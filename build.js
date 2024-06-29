const esbuild = require('esbuild');
const glob = require('glob');

const entryPoints = glob.sync('./src/**/*.ts');

esbuild.build({
  entryPoints,
  bundle: true,
  sourcemap: true,
  outdir: 'dist',
  watch: process.argv.includes('--watch'),
}).catch(() => process.exit(1));