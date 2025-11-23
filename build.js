const esbuild = require('esbuild');
const { execSync } = require('child_process');
const sass = require('sass');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const packageJson = require('./package.json');

// Check if watch mode is enabled
const isWatch = process.argv.includes('--watch');

// Determine environment (default to development)
const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

/**
 * Load environment variables from .env file
 */
function loadEnvFile() {
  let envFile = '.env'; // default to development

  if (env === 'production') {
    envFile = '.env.prod';
  } else if (env === 'test') {
    envFile = '.env.test';
  }

  const envPath = path.join(__dirname, envFile);

  console.log(`Loading environment: ${env}`);
  console.log(`Environment file: ${envFile}`);

  if (!fs.existsSync(envPath)) {
    console.warn(`⚠ Warning: ${envFile} not found`);
    return {};
  }

  const envVars = {};
  const envContent = fs.readFileSync(envPath, 'utf8');

  envContent.split('\n').forEach(line => {
    // Skip empty lines and comments
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    // Parse KEY=VALUE
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      envVars[key] = value;
    }
  });

  console.log(`✓ Loaded ${Object.keys(envVars).length} environment variables from file`);

  // Merge with process.env (Netlify/CI environment variables take precedence)
  const finalEnvVars = {
    ...envVars,
    ...(process.env.API_BASE_URL && { API_BASE_URL: process.env.API_BASE_URL }),
    ...(process.env.MEMBERSTACK_ID && { MEMBERSTACK_ID: process.env.MEMBERSTACK_ID }),
  };

  console.log('Final environment variables:', Object.keys(finalEnvVars));
  return finalEnvVars;
}

// Single entry point for bundling (only index.ts is loaded in Webflow)
const entryPoint = './src/index.ts';

/**
 * Run TypeScript type checking
 * This doesn't generate files, just validates types
 */
function typeCheck() {
  console.log('Running type check...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log('✓ Type check passed');
    return true;
  } catch (error) {
    console.error('✗ Type check failed');
    return false;
  }
}

/**
 * Build SCSS files
 */
function buildSCSS() {
  const scssFiles = glob.sync('./src/**/*.scss');

  if (scssFiles.length === 0) {
    console.log('No SCSS files to compile');
    return;
  }

  scssFiles.forEach(file => {
    try {
      const result = sass.compile(file, {
        style: 'compressed',
        sourceMap: true,
      });

      // Convert src path to dist path (cross-platform)
      const relativePath = path.relative('src', file);
      const outputPath = path.join('dist', relativePath).replace(/\.scss$/, '.css');
      const outputDir = path.dirname(outputPath);

      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write CSS file
      fs.writeFileSync(outputPath, result.css);

      // Write source map if available
      if (result.sourceMap) {
        fs.writeFileSync(outputPath + '.map', JSON.stringify(result.sourceMap));
      }

      console.log(`✓ Compiled: ${file} → ${outputPath}`);
    } catch (error) {
      console.error(`✗ Error compiling ${file}:`, error.message);
      if (!isWatch) process.exit(1);
    }
  });
}

/**
 * Build TypeScript with esbuild
 */
async function buildTypeScript() {
  console.log('Bundling TypeScript with esbuild...');

  // Load environment variables
  const envVars = loadEnvFile();

  // Create define object for environment variable replacement
  const define = {
    'process.env.NODE_ENV': JSON.stringify(env),
  };

  // Add all loaded env vars to define
  Object.keys(envVars).forEach(key => {
    define[`process.env.${key}`] = JSON.stringify(envVars[key]);
  });

  try {
    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      sourcemap: true,
      outfile: 'dist/index.js',
      platform: 'browser',
      target: 'es6',
      minify: isProduction,
      define: define,
      banner: {
        js: `/* Version: ${packageJson.version} | Build: ${new Date().toISOString()} */`,
//        js: `/* Version: ${packageJson.version} | Build: ${new Date().toISOString()} | Environment: ${env} */`,
      },
      watch: isWatch ? {
        onRebuild(error, result) {
          if (error) {
            console.error('✗ esbuild failed:', error);
          } else {
            console.log('✓ TypeScript rebuilt');
          }
        }
      } : false,
    });

    console.log('✓ Bundle created: dist/index.js');
  } catch (error) {
    console.error('✗ Build failed:', error);
    throw error;
  }
}

/**
 * Main build process
 */
async function build() {
  console.log('='.repeat(50));
  console.log('Starting build process...');
  console.log('='.repeat(50));

  // Step 1: Type check (skip in watch mode for faster rebuilds)
  if (!isWatch) {
    if (!typeCheck()) {
      process.exit(1);
    }
  }

  // Step 2: Build SCSS
  console.log('\nBuilding SCSS files...');
  buildSCSS();

  // Step 3: Bundle TypeScript
  console.log('\nBundling TypeScript...');
  await buildTypeScript();

  // Step 4: Watch SCSS files if in watch mode
  if (isWatch) {
    console.log('\nWatching SCSS files for changes...');
    const scssFiles = glob.sync('./src/**/*.scss');
    scssFiles.forEach(file => {
      fs.watch(file, (eventType) => {
        if (eventType === 'change') {
          console.log(`\nSCSS file changed: ${file}`);
          buildSCSS();
        }
      });
    });
    console.log('👀 Watch mode active - waiting for changes...');
  } else {
    console.log('\n' + '='.repeat(50));
    console.log('✓ Build complete!');
    console.log('='.repeat(50));
  }
}

// Run the build
build().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
