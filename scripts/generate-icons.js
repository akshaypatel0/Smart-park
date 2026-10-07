import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Check for user-provided icon in assets/icon.png first, otherwise fall back to public/icon.svg
const assetPngPath = path.resolve('assets/icon.png');
const svgPath = path.resolve('public/icon.svg');

let iconBuffer;
if (fs.existsSync(assetPngPath) && fs.statSync(assetPngPath).size > 0) {
  console.log('Using uploaded icon asset from assets/icon.png');
  iconBuffer = fs.readFileSync(assetPngPath);
  try {
    fs.copyFileSync(assetPngPath, path.resolve('public/icon.png'));
  } catch (e) {
    console.warn('Could not copy to public/icon.png:', e);
  }
} else {
  console.log('Falling back to default SVG icon from public/icon.svg');
  iconBuffer = fs.readFileSync(svgPath);
}

async function generate() {
  console.log('Generating PWA and Android app icons from source icon...');

  // 1. 192x192 PNG
  await sharp(iconBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  console.log('Generated public/pwa-192x192.png');

  // 2. 512x512 PNG
  await sharp(iconBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');
  console.log('Generated public/pwa-512x512.png');

  // 3. Apple Touch Icon 180x180
  await sharp(iconBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('Generated public/apple-touch-icon.png');

  // 4. Favicon 64x64 PNG
  await sharp(iconBuffer)
    .resize(64, 64)
    .png()
    .toFile('public/favicon.png');
  console.log('Generated public/favicon.png');

  // 5. Maskable 512x512 (with safe zone padding and background)
  const innerSize = Math.round(512 * 0.76); // ~390px
  const innerBuffer = await sharp(iconBuffer)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }, // dark navy #0f172a matching brand
    },
  })
    .composite([
      {
        input: innerBuffer,
        top: Math.round((512 - innerSize) / 2),
        left: Math.round((512 - innerSize) / 2),
      },
    ])
    .png()
    .toFile('public/pwa-maskable-512x512.png');
  console.log('Generated public/pwa-maskable-512x512.png');

  console.log('All PWA and APK icon assets generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
