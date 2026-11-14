import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generate() {
  const iconSvg = fs.readFileSync('public/icon.svg');
  const maskableSvg = fs.readFileSync('public/icon-maskable.svg');

  await sharp(iconSvg)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  console.log('Generated public/pwa-192x192.png');

  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');
  console.log('Generated public/pwa-512x512.png');

  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-maskable-512x512.png');
  console.log('Generated public/pwa-maskable-512x512.png');

  await sharp(iconSvg)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('Generated public/apple-touch-icon.png');

  await sharp(iconSvg)
    .resize(64, 64)
    .png()
    .toFile('public/favicon.png');
  console.log('Generated public/favicon.png');
}

generate().catch(console.error);
