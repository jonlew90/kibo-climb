import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Read current package version
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
const version = pkg.version || '1.0.0';

async function generateOtaBundle() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('Error: dist/ directory does not exist. Run "npm run build" first.');
    process.exit(1);
  }

  const otaDir = path.join(DIST_DIR, 'ota');
  if (!fs.existsSync(otaDir)) {
    fs.mkdirSync(otaDir, { recursive: true });
  }

  const zipFileName = `bundle-${version}.zip`;
  const zipPath = path.join(otaDir, zipFileName);
  const output = fs.createWriteStream(zipPath);
  const archive = new archiver.ZipArchive({ zlib: { level: 9 } });

  output.on('close', () => {
    const sizeKb = (archive.pointer() / 1024).toFixed(1);
    console.log(`✅ [OTA] Created bundle: dist/ota/${zipFileName} (${sizeKb} KB)`);

    // Generate self-hosted manifest
    const manifest = {
      version: version,
      url: `https://kibo-climb.web.app/ota/${zipFileName}`,
      timestamp: new Date().toISOString(),
      sizeBytes: archive.pointer()
    };

    const manifestPath = path.join(DIST_DIR, 'ota_manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`✅ [OTA] Generated manifest: dist/ota_manifest.json`);
    console.log(JSON.stringify(manifest, null, 2));
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // Zip all contents of dist EXCEPT any existing ota/ directory to avoid recursion
  archive.glob('**/*', {
    cwd: DIST_DIR,
    ignore: ['ota/**', 'ota_manifest.json']
  });

  await archive.finalize();
}

generateOtaBundle().catch((err) => {
  console.error('[OTA Bundle Error]:', err);
  process.exit(1);
});
