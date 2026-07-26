const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Genera versiones WebP optimizadas y responsivas de las fotos colocadas
// directamente en public/assets/images (logo/ e icons/ se excluyen: son
// vectores o iconos pequeños que no necesitan variantes de tamaño).
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'assets', 'images');
const RESPONSIVE_WIDTHS = [480, 768, 1280, 1920];

async function optimizeImage(filePath) {
  const { dir, name } = path.parse(filePath);

  await Promise.all(
    RESPONSIVE_WIDTHS.map((width) =>
      sharp(filePath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(dir, `${name}-${width}.webp`))
    )
  );

  console.log(`Optimizado: ${path.basename(filePath)} -> ${RESPONSIVE_WIDTHS.length} variantes WebP`);
}

async function run() {
  const files = fs
    .readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(jpg|jpeg|png)$/i.test(entry.name));

  if (files.length === 0) {
    console.log('No hay fotos nuevas en public/assets/images para optimizar.');
    return;
  }

  for (const file of files) {
    await optimizeImage(path.join(IMAGES_DIR, file.name));
  }
}

run().catch((error) => {
  console.error('Error optimizando imágenes:', error.message);
  process.exit(1);
});
