// Branche dans le jeu les images générées (art/a-integrer/, charte v3) :
// personnages en pied et visage recadré dans public/img/gacha/, armures seules dans public/img/armures/,
// puis écrit la liste des images disponibles dans src/core/data/art-list.js.
// Usage : node scripts/integrate-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const SRC = path.join(ROOT, 'art/a-integrer');
const GACHA = path.join(ROOT, 'public/img/gacha'), ARM = path.join(ROOT, 'public/img/armures');
fs.mkdirSync(GACHA, { recursive: true }); fs.mkdirSync(ARM, { recursive: true });
const NAME = /^((perso-(or-[a-z]+|(argent|bronze)-(feu|eau|air|terre)|cons-[a-z-]+)-[FM]\d?)|(armure-(or-[a-z]+|(argent|bronze)-(feu|eau|air|terre))))\.(png|jpe?g|webp)$/;

// Visages mal trouvés par le recadrage automatique (bras levé…) : carré fixé à la main, en fractions de la largeur et de la hauteur.
const HEAD_BOX = { 'perso-cons-oiseau-paradis-F': { x: .39, y: .11, w: .26 }, 'perso-cons-grue-F': { x: .31, y: .05, w: .31 },
  'perso-cons-ophiuchus-F': { x: .35, y: .13, w: .3 }, 'perso-cons-fourneau-F': { x: .33, y: 0, w: .36 } };
// Image pas au format vertical 2:3 (carré de Gemini…) : on retire le fond uni autour du personnage,
// puis on le complète avec le même gris jusqu'au format 2:3. Rien n'est rogné.
async function vertical(src) {
  const { width: w, height: h } = await sharp(src).metadata();
  if (Math.abs(w / h - 2 / 3) < .04) return src;
  const { data: px } = await sharp(src).extract({ left: 2, top: 2, width: 1, height: 1 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const background = { r: px[0], g: px[1], b: px[2] };
  const { data, info } = await sharp(src).removeAlpha().trim({ background, threshold: 18 }).toBuffer({ resolveWithObject: true });
  const W = Math.round(Math.max(info.width, info.height * 2 / 3) * 1.08), H = Math.round(W * 1.5);
  const left = Math.floor((W - info.width) / 2), top = Math.floor((H - info.height) / 2);
  return sharp(data).extend({ left, right: W - info.width - left, top, bottom: H - info.height - top, background }).png().toBuffer();
}
const done = [];
for (const f of fs.readdirSync(SRC)) {
  const m = NAME.exec(f); if (!m) continue;
  const name = f.replace(/\.\w+$/, '');
  let src = path.join(SRC, f);
  if (name.startsWith('perso-')) {
    src = await vertical(src);
    await sharp(src).resize({ width: 600 }).webp({ quality: 82 }).toFile(path.join(GACHA, name + '.webp'));
    // Visage : le haut de l'image, recadré là où l'œil est attiré (le visage, en pratique).
    const meta = await sharp(src).metadata(), box = HEAD_BOX[name];
    if (box) { const s = Math.round(box.w * meta.width);
      await sharp(src).extract({ left: Math.round(box.x * meta.width), top: Math.round(box.y * meta.height), width: s, height: s }).resize(256, 256).webp({ quality: 85 }).toFile(path.join(GACHA, name + '-tete.webp'));
      done.push(name); continue; }
    const band = await sharp(src).extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * .27) }).toBuffer();
    await sharp(band).resize(256, 256, { fit: 'cover', position: sharp.strategy.attention }).webp({ quality: 85 }).toFile(path.join(GACHA, name + '-tete.webp'));
  } else {
    await sharp(src).resize({ width: 500 }).webp({ quality: 82 }).toFile(path.join(ARM, name + '.webp'));
    await sharp(src).resize({ width: 160 }).webp({ quality: 80 }).toFile(path.join(ARM, name + '-mini.webp'));
  }
  done.push(name);
}
done.sort();
fs.writeFileSync(path.join(ROOT, 'src/core/data/art-list.js'),
  '/* Images générées et branchées par scripts/integrate-images.mjs (ne pas modifier à la main). */\nexport const PAINTED=new Set(' + JSON.stringify(done) + ');\n');
console.log(done.length + ' images branchées.');
