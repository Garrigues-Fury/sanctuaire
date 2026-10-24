// Génère les images du jeu avec l'API Mammouth AI (modèle Gemini « Nano Banana »).
// Usage : node scripts/generate-images.mjs [nom-de-fichier…]   (sans argument : toutes celles qui manquent)
// La clé est lue dans .env.local (MAMMOUTH_API_KEY), jamais publiée.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
try { process.loadEnvFile(path.join(ROOT, '.env.local')); } catch {}
const KEY = process.env.MAMMOUTH_API_KEY;
if (!KEY || KEY === 'colle-ta-cle-ici') { console.error('Clé absente : remplis MAMMOUTH_API_KEY dans .env.local'); process.exit(1); }
const MODEL = process.env.MAMMOUTH_IMAGE_MODEL || 'google/gemini-2.5-flash-image';
const OUT = path.join(ROOT, 'art/a-integrer'); fs.mkdirSync(OUT, { recursive: true });
const REF = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ROOT, 'docs/reference.jpeg')).toString('base64');

const STYLE = 'Illustration de style anime, exactement le même style de dessin que l’image jointe : dessin japonais moderne de qualité série télévisée haut de gamme, contours nets, aplats de couleur et ombrages doux. Lumière dorée de soleil couchant. Univers de la Grèce antique mythique. Métal patiné, segmenté et riveté, cuir, tissu, sangles et boucles. Aucun texte, aucune lettre, aucun logo, aucune signature, aucun filigrane. Une seule image, jamais de planche à plusieurs cases. Ne reprends pas les personnages de l’image jointe : seulement son style.';
const GOLD = 'Une armure d’or de chevalier, vide, dressée comme si un corps invisible la portait, en pied, vue de face, de la tête aux pieds, entièrement dans le cadre. Forme neutre, qui irait aussi bien à un homme qu’à une femme. Armure intégrale très ornée : casque ou diadème, épaulières, plastron, ceinture, brassards, gantelets, jambières, bottes, pièces segmentées et rivetées, avec des pierres de couleur. Fond gris neutre uni. Format vertical 2:3.';
const SILVER = 'Une armure d’argent de chevalier, vide, dressée comme si un corps invisible la portait, en pied, vue de face, de la tête aux pieds, entièrement dans le cadre. Forme neutre, qui irait aussi bien à un homme qu’à une femme. Armure partielle : épaulières, plastron, avant-bras, jambières, sur une tenue sombre ajustée. Argent et bleu acier, plus sobre qu’une armure d’or, pièces segmentées et rivetées. Fond gris neutre uni. Format vertical 2:3.';
const BRONZE = 'Une armure de bronze de chevalier, vide, dressée comme si un corps invisible la portait, en pied, vue de face, de la tête aux pieds, entièrement dans le cadre. Forme neutre, qui irait aussi bien à un homme qu’à une femme. Armure légère de bronze patiné : quelques pièces (épaulières, plastron court, brassards, genouillères) sur une tenue de cuir et de tissu, rivets apparents. Fond gris neutre uni. Format vertical 2:3.';
const EL = { feu: 'Thème du feu : flammes gravées, pierres rouges.', eau: 'Thème de l’eau : vagues gravées, pierres bleues.', air: 'Thème de l’air : plumes et nuages gravés, pierres blanches.', terre: 'Thème de la terre : roche et racines gravées, pierres vertes.' };

export const JOBS = {
  'armure-or-belier': GOLD + ' Thème du Bélier : épaulières en cornes de bélier enroulées, cape rouge, pierres rouges.',
  'armure-or-taureau': GOLD + ' Thème du Taureau : casque à larges cornes de taureau, plastron massif, tissus vert sombre, pierres vertes.',
  'armure-or-gemeaux': GOLD + ' Thème des Gémeaux : deux visages sereins gravés sur le plastron, symétrie parfaite, cape bleu nuit, pierres bleues.',
  'armure-or-cancer': GOLD + ' Thème du Cancer : croissant de lune sur le diadème, épaulières en carapace arrondie, cape bleue, pierres argentées.',
  'armure-or-lion': GOLD + ' Thème du Lion : casque en tête de lion à crinière, genouillères à tête de lion, cape rouge, pierres ambrées.',
  'armure-or-vierge': GOLD + ' Thème de la Vierge : petites ailes aux épaules, voiles blancs, épis de blé gravés, pierres bleu pâle.',
  'armure-or-balance': GOLD + ' Thème de la Balance : plateaux de balance stylisés aux épaules, lignes droites et équilibrées, tissus blanc et or, pierres vertes.',
  'armure-or-scorpion': GOLD + ' Thème du Scorpion : plaques en carapace pointue, queue de scorpion articulée dans le dos, cape violette, pierres violettes.',
  'armure-or-sagittaire': GOLD + ' Thème du Sagittaire : grandes ailes repliées dans le dos, arc doré fixé à l’épaule, tissus bruns, pierres rouges.',
  'armure-or-capricorne': GOLD + ' Thème du Capricorne : casque à cornes de chèvre recourbées vers l’arrière, lame courbe le long de l’avant-bras, tissus gris, pierres noires.',
  'armure-or-verseau': GOLD + ' Thème du Verseau : volutes d’eau gravées partout, amphore stylisée sur le plastron, voiles bleu clair, pierres bleues.',
  'armure-or-poissons': GOLD + ' Thème des Poissons : épaulières en coquillage, écailles gravées, voiles roses transparents, pierres roses.',
  ...Object.fromEntries(Object.keys(EL).map(e => ['armure-argent-' + e, SILVER + ' ' + EL[e]])),
  ...Object.fromEntries(Object.keys(EL).map(e => ['armure-bronze-' + e, BRONZE + ' ' + EL[e]]))
};

async function generate(name, prompt) {
  const body = { model: MODEL, modalities: ['image', 'text'], image_config: { aspect_ratio: '2:3' },
    messages: [{ role: 'user', content: [{ type: 'text', text: STYLE + '\n\n' + prompt }, { type: 'image_url', image_url: { url: REF } }] }] };
  const res = await fetch('https://api.mammouth.ai/v1/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const txt = await res.text();
  if (!res.ok) throw new Error('HTTP ' + res.status + ' : ' + txt.slice(0, 300));
  const msg = JSON.parse(txt).choices?.[0]?.message || {};
  const img = (msg.images || [])[0];
  const url = img?.image_url?.url || img?.url || (typeof img === 'string' ? img : null);
  if (!url) throw new Error('pas d’image dans la réponse : ' + JSON.stringify(msg).slice(0, 300));
  const m = /^data:image\/(\w+);base64,(.+)$/s.exec(url);
  const buf = m ? Buffer.from(m[2], 'base64') : Buffer.from(await (await fetch(url)).arrayBuffer());
  const file = path.join(OUT, name + '.' + (m ? (m[1] === 'jpeg' ? 'jpg' : m[1]) : 'png'));
  fs.writeFileSync(file, buf);
  return file;
}

const wanted = process.argv.slice(2);
const names = (wanted.length ? wanted : Object.keys(JOBS)).filter(n => {
  if (!JOBS[n]) { console.error('inconnu :', n); return false; }
  return wanted.length || !fs.readdirSync(OUT).some(f => f.startsWith(n + '.'));
});
for (const n of names) {
  for (let essai = 1; essai <= 3; essai++) {
    try { console.log('✓', n, '→', path.relative(ROOT, await generate(n, JOBS[n]))); break; }
    catch (e) { console.error('✗', n, 'essai', essai, ':', e.message); if (essai === 3) console.error('  abandon pour', n); else await new Promise(r => setTimeout(r, 5000)); }
  }
}
