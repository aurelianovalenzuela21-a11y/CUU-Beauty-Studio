// Genera íconos PNG e imagen para compartir en redes (og). Uso: node scripts/make-icons.mjs
import sharp from 'sharp';
import fs from 'node:fs';

const svg = fs.readFileSync('public/favicon.svg');
for (const [name, size] of [['apple-touch-icon', 180], ['icon-192', 192], ['icon-512', 512]]) {
  await sharp(svg, { density: 600 }).resize(size, size).png().toFile(`public/img/${name}.png`);
}

// Imagen para compartir (1200x630): 3 fotos + texto.
const W = 1200, H = 630;
const photo = (f, s) => sharp(`design/originales/${f}`).resize(s, s, { fit: 'cover', position: 'attention' }).toBuffer();
const [a, b, c] = await Promise.all([photo('portfolio_ailyn_2.jpg', 370), photo('portfolio_arely_3.jpg', 210), photo('portfolio_bere_1.jpg', 230)]);
const round = (s, r) => Buffer.from(`<svg width="${s}" height="${s}"><rect width="${s}" height="${s}" rx="${r}" ry="${r}"/></svg>`);
const mask = async (buf, s, r) => sharp(buf).composite([{ input: round(s, r), blend: 'dest-in' }]).png().toBuffer();
const text = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="p" cx="0" cy="0" r="1"><stop offset="0" stop-color="#ff2e93" stop-opacity=".55"/><stop offset="1" stop-color="#ff2e93" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="1" cy="1" r="1"><stop offset="0" stop-color="#2f6bff" stop-opacity=".55"/><stop offset="1" stop-color="#2f6bff" stop-opacity="0"/></radialGradient>
    <linearGradient id="t" x1="0" x2="1"><stop offset="0" stop-color="#ff5fae"/><stop offset=".5" stop-color="#b57bff"/><stop offset="1" stop-color="#6f98ff"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#170f2b"/>
  <rect width="${W}" height="${H}" fill="url(#p)"/>
  <rect width="${W}" height="${H}" fill="url(#b)"/>
  <text x="70" y="150" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="26" letter-spacing="5" fill="#ffc2e1">CHIHUAHUA · AGENDA EN LÍNEA</text>
  <text x="66" y="265" font-family="DejaVu Sans, Arial, sans-serif" font-weight="800" font-size="92" fill="#fff">CUU</text>
  <text x="300" y="265" font-family="DejaVu Serif, Georgia, serif" font-style="italic" font-size="96" fill="url(#t)">Beauty</text>
  <text x="70" y="345" font-family="DejaVu Sans, Arial, sans-serif" font-size="34" fill="#ffffff" fill-opacity=".86">Todo lo que necesitas,</text>
  <text x="70" y="392" font-family="DejaVu Sans, Arial, sans-serif" font-size="34" fill="#ffffff" fill-opacity=".86">en un mismo lugar.</text>
  <text x="70" y="520" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="26" fill="#fff">Uñas · Pedicura spa · Faciales · Cejas</text>
  <text x="70" y="562" font-family="DejaVu Sans, Arial, sans-serif" font-size="24" fill="#ffffff" fill-opacity=".7">www.cuubeauty.com</text>
</svg>`);
await sharp(text)
  .composite([
    { input: await mask(a, 370, 36), left: 690, top: 130 },
    { input: await mask(b, 210, 28), left: 950, top: 40 },
    { input: await mask(c, 230, 30), left: 930, top: 370 },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile('public/img/og-cuubeauty.jpg');
console.log('listo');
