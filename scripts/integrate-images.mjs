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
const NAME = /^((perso-(or-[a-z]+|(argent|bronze)-(feu|eau|air|terre)|cons-[a-z-]+)-[FM])|(armure-(or-[a-z]+|(argent|bronze)-(feu|eau|air|terre))))\.(png|jpe?g|webp)$/;

const done = [];
for (const f of fs.readdirSync(SRC)) {
  const m = NAME.exec(f); if (!m) continue;
  const name = f.replace(/\.\w+$/, ''), src = path.join(SRC, f);
  if (name.startsWith('perso-')) {
    await sharp(src).resize({ width: 600 }).webp({ quality: 82 }).toFile(path.join(GACHA, name + '.webp'));
    // Visage : le haut de l'image, recadré là où l'œil est attiré (le visage, en pratique).
    const meta = await sharp(src).metadata();
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
