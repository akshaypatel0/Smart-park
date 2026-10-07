import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Check for user-provided icon in assets/icon.png first, otherwise fall back to public/icon.svg
const assetPngPath = path.resolve('assets/icon.png');
const svgPath = path.resolve('public/icon.svg');

let iconBuffer;
if (fs.existsSync(assetPngPath) && fs.statSync(assetPngPath).size > 0) {
  console.log('Using uploaded icon asset from assets/icon.png for Android APK launcher');
  iconBuffer = fs.readFileSync(assetPngPath);
} else {
  console.log('Falling back to default SVG icon from public/icon.svg');
  iconBuffer = fs.readFileSync(svgPath);
}

const resDir = path.resolve('android/app/src/main/res');

const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

async function generateAndroidIcons() {
  console.log('Generating Android native launcher icons...');
  for (const [folder, size] of Object.entries(sizes)) {
    const targetFolder = path.join(resDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    // Standard square launcher icon
    await sharp(iconBuffer)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher.png'));

    // Round launcher icon with circular crop or fitted
    // For round icon, let's create a circle mask
    const circleSvg = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#000" /></svg>`
    );
    const roundImage = await sharp(iconBuffer)
      .resize(size, size, { fit: 'cover' })
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toBuffer();

    await sharp(roundImage).toFile(path.join(targetFolder, 'ic_launcher_round.png'));

    // Foreground icon for adaptive icons (with safe margin)
    const fgSize = Math.round(size * 0.72);
    const fgBuffer = await sharp(iconBuffer)
      .resize(fgSize, fgSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: fgBuffer,
          top: Math.round((size - fgSize) / 2),
          left: Math.round((size - fgSize) / 2),
        },
      ])
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_foreground.png'));

    console.log(`Generated ${folder} (${size}x${size})`);
  }
  console.log('Android APK icons updated successfully!');
}

generateAndroidIcons().catch((err) => {
  console.error('Error generating android icons:', err);
  process.exit(1);
});
