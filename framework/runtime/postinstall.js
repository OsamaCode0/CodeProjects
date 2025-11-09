// postinstall.js
const { execSync } = require('child_process');
const { mkdirSync, copyFileSync } = require('fs');
const path = require('path');

const hostDir = process.env.INIT_CWD; // This is where npm install was run
const distDir = path.join(hostDir, 'dist');
const builtFile = path.join(__dirname, 'dist', 'frontend-framework.js');
const targetFile = path.join(distDir, 'frontend-framework.js');

try {
  console.log('📦 Building frontend-framework...');
  execSync('npm run build', { stdio: 'inherit' });

  mkdirSync(distDir, { recursive: true });
  copyFileSync(builtFile, targetFile);

  console.log(`✅ Copied build to ${targetFile}`);
} catch (err) {
  console.error('❌ Build or copy failed:', err);
  process.exit(1);
}
