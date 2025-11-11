// postinstall.js
const { execSync } = require('child_process');
const { mkdirSync, copyFileSync, existsSync, readFileSync } = require('fs');
const path = require('path');

if (process.env.SKIP_FRONTEND_FRAMEWORK_POSTINSTALL) {
  console.log('ℹ️ SKIP_FRONTEND_FRAMEWORK_POSTINSTALL set — skipping postinstall');
  process.exit(0);
}

const hostDir = process.env.INIT_CWD || process.cwd();
const distDir = path.join(hostDir, 'dist');
const builtFile = path.join(__dirname, 'dist', 'frontend-framework.js');
const bundleDest = path.join(distDir, 'frontend-framework.js');

const filesToCopy = [
  { src: path.join(__dirname, 'templates', 'index.js'), dest: path.join(hostDir, 'index.js'), allowOverwrite: false },
  { src: path.join(__dirname, 'templates', 'index.html'), dest: path.join(hostDir, 'index.html'), allowOverwrite: false },
  { src: path.join(__dirname, 'templates', 'index.css'), dest: path.join(hostDir, 'index.css'), allowOverwrite: false }
];

// env flag to force overwriting user files (not the bundle)
const FORCE_USER_OVERWRITE = process.env.FRAMEWORK_OVERWRITE === '1';

try {
  console.log('📦 Building frontend-framework...');
  execSync('npm run build', { stdio: 'inherit' });

  mkdirSync(distDir, { recursive: true });

  // 1) Copy user-facing templates but avoid overwriting unless forced or identical
  for (const { src, dest, allowOverwrite } of filesToCopy) {
    const destExists = existsSync(dest);

    if (destExists && !FORCE_USER_OVERWRITE && !allowOverwrite) {
      try {
        const srcBuf = readFileSync(src);
        const destBuf = readFileSync(dest);
        if (srcBuf.equals(destBuf)) {
          console.log(`ℹ️ Skipped ${dest} (already exists and identical)`);
        } else {
          console.log(`⚠️ Skipped ${dest} (exists and differs). Set FRAMEWORK_OVERWRITE=1 to replace.`);
        }
      } catch (e) {
        console.log(`⚠️ Skipped ${dest} (exists but could not compare)`);
      }
      continue;
    }

    copyFileSync(src, dest);
    console.log(`✅ Copied ${src} -> ${dest}`);
  }

  // 2) Always copy the built bundle so updates are applied
  copyFileSync(builtFile, bundleDest);
  console.log(`✅ Updated bundle ${bundleDest}`);

  console.log('✅ Postinstall finished');
} catch (err) {
  console.error('❌ Build or copy failed:', err);
  process.exit(1);
}
