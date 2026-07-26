const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Genera, a partir de los SVG fuente, los binarios que los navegadores y
// redes sociales esperan: favicon.ico, apple-touch-icon.png y og-image.jpg.
// Se puede volver a correr cada vez que se actualice el diseño del logo/marca.
const ICONS_DIR = path.join(__dirname, '..', 'public', 'assets', 'images', 'icons');
const LOGO_DIR = path.join(__dirname, '..', 'public', 'assets', 'images', 'logo');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Envuelve un PNG cuadrado en un contenedor ICO valido (formato PNG-in-ICO,
// soportado por todos los navegadores desde hace mas de una decada).
function buildIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, pngBuffer]);
}

async function generateFavicon() {
  const svgPath = path.join(ICONS_DIR, 'favicon.svg');
  const pngBuffer = await sharp(svgPath).resize(32, 32).png().toBuffer();

  fs.writeFileSync(path.join(ICONS_DIR, 'favicon-48.png'), await sharp(svgPath).resize(48, 48).png().toBuffer());
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), buildIco(pngBuffer, 32));
  console.log('Generado: public/favicon.ico y icons/favicon-48.png');
}

async function generateAppleTouchIcon() {
  const svgPath = path.join(ICONS_DIR, 'favicon.svg');
  const buffer = await sharp(svgPath).resize(180, 180).png().toBuffer();

  fs.writeFileSync(path.join(ICONS_DIR, 'apple-touch-icon.png'), buffer);
  console.log('Generado: icons/apple-touch-icon.png');
}

async function generateOgImage() {
  const svgPath = path.join(LOGO_DIR, 'og-image-source.svg');
  const buffer = await sharp(svgPath).resize(1200, 630).jpeg({ quality: 85 }).toBuffer();

  fs.writeFileSync(path.join(LOGO_DIR, 'og-image.jpg'), buffer);
  console.log('Generado: logo/og-image.jpg');
}

async function run() {
  await generateFavicon();
  await generateAppleTouchIcon();
  await generateOgImage();
}

run().catch((error) => {
  console.error('Error generando assets de marca:', error.message);
  process.exit(1);
});
