const esbuild = require('esbuild');
const { execSync } = require('child_process');
const sass = require('sass');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Check if watch mode is enabled
const isWatch = process.argv.includes('--watch');

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

  try {
    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      sourcemap: true,
      outfile: 'dist/index.js',
      platform: 'browser',
      target: 'es6',
      minify: false, // Set to true for production builds
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
