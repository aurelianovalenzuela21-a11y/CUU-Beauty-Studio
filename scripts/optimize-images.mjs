// Genera versiones WebP ligeras de las fotos (se corre a mano: `node scripts/optimize-images.mjs`).
// Requiere `sharp` instalado (npm i -g sharp). Las fotos originales van en design/originales/.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'design/originales';
const OUT = 'public/img';
fs.mkdirSync(OUT, { recursive: true });

for (const file of fs.readdirSync(SRC)) {
  if (!/\.(jpe?g|png)$/i.test(file) || file.startsWith('sin-usar')) continue;
  const base = file.replace(/\.(jpe?g|png)$/i, '').replace(/_new$/, '');
  const widths = base.startsWith('profile') ? [160, 320] : [400, 640, 900];
  for (const w of widths) {
    await sharp(path.join(SRC, file))
      .resize({ width: w, height: w, fit: 'cover', position: 'attention', withoutEnlargement: false })
      .webp({ quality: 74, effort: 6 })
      .toFile(path.join(OUT, `${base}-${w}.webp`));
  }
  console.log('ok', base);
}
