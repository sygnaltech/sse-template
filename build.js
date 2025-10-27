const esbuild = require('esbuild');
const glob = require('glob');
const sass = require('sass');
const fs = require('fs');
const path = require('path');

// Check if watch mode is enabled
const isWatch = process.argv.includes('--watch');

// Build TypeScript files
const entryPoints = glob.sync('./src/**/*.ts');

// Build SCSS files
function buildSCSS() {
  const scssFiles = glob.sync('./src/**/*.scss');

  scssFiles.forEach(file => {
    try {
      const result = sass.compile(file, {
        style: 'compressed', // or 'expanded' for development
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

// Initial SCSS build
console.log('Building SCSS files...');
buildSCSS();

// Build TypeScript files with esbuild
console.log('Building TypeScript files...');
esbuild.build({
  entryPoints,
  bundle: true,
  sourcemap: true,
  outdir: 'dist',
  watch: isWatch ? {
    onRebuild(error, result) {
      if (error) {
        console.error('✗ TypeScript build failed:', error);
      } else {
        console.log('✓ TypeScript rebuilt successfully');
      }
    }
  } : false,
}).then(() => {
  console.log('✓ Initial TypeScript build complete');

  // Watch SCSS files if in watch mode
  if (isWatch) {
    console.log('Watching SCSS files for changes...');
    const scssFiles = glob.sync('./src/**/*.scss');
    scssFiles.forEach(file => {
      fs.watch(file, (eventType) => {
        if (eventType === 'change') {
          console.log(`SCSS file changed: ${file}`);
          buildSCSS();
        }
      });
    });
    console.log('👀 Watching for changes...');
  }
}).catch((error) => {
  console.error('✗ Build failed:', error);
  process.exit(1);
});