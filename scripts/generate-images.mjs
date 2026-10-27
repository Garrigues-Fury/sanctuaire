// Génère les images du jeu avec l'API Mammouth AI, d'après la charte graphique v3 (docs/charte-graphique.md).
// Usage : node scripts/generate-images.mjs [nom-ou-préfixe…]   (sans argument : toutes celles qui manquent)
// La clé est lue dans .env.local (MAMMOUTH_API_KEY), jamais publiée.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
try { process.loadEnvFile(path.join(ROOT, '.env.local')); } catch {}
const KEY = process.env.MAMMOUTH_API_KEY;
if (!KEY || KEY === 'colle-ta-cle-ici') { console.error('Clé absente : remplis MAMMOUTH_API_KEY dans .env.local'); process.exit(1); }
const MODEL = process.env.MAMMOUTH_IMAGE_MODEL || 'gemini-3-pro-image-preview';
const OUT = path.join(ROOT, 'art/a-integrer'); fs.mkdirSync(OUT, { recursive: true });
const REF = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ROOT, 'docs/reference.jpeg')).toString('base64');

// Bloc de style commun (charte, section 2).
const STYLE = 'Illustration de style manga / anime, rendu « splash art » de personnage de jeu mobile idol gacha haut de gamme : contours nets, couleurs vives et lumineuses, ombrages doux et brillants, reflets dorés sur le métal, grands yeux expressifs, visage très beau et soigné. Même qualité de trait que l’image jointe, mais ne reprends pas ses personnages. Lumière chaude de soleil couchant. Univers de la Grèce antique mythique. Armure en métal ciselé, segmenté et riveté, avec cuir, tissu, sangles et boucles. Aucun texte, aucune lettre, aucun logo, aucune signature, aucun filigrane. Une seule image, jamais de planche à plusieurs cases.';
// Personnage adulte en armure (charte, section 3) : pas de casque, un accessoire discret.
const HEAD = 'Pas de casque ni de couvre-chef : cheveux libres et soignés, visibles en entier, avec seulement un petit accessoire discret aux couleurs de l’armure (barrette, fine chaîne, plume ou petit ornement dans les cheveux) ou une boucle d’oreille.';
// Silhouettes et visages variés (demande de Seba du 2026-10-24) : toutes les femmes ne sont pas fines, tous les hommes ne sont pas beaux.
const LOOK_F = ['très belle, poitrine généreuse, taille fine', 'jolie, petite poitrine, silhouette fine et sportive', 'femme ronde et voluptueuse, hanches larges, ventre doux, très séduisante', 'grande et très musclée, épaules larges, cicatrice sur le bras', 'traits marqués, pas d’une beauté parfaite mais pleine de caractère, cicatrice sur la joue, tatouages tribaux sur l’épaule'];
const LOOK_M = ['très beau, traits fins', 'traits rudes et irréguliers, nez cassé, pas spécialement beau mais charismatique', 'homme corpulent et massif, gros ventre puissant, barbe épaisse', 'mince et nerveux, cicatrice en travers du sourcil', 'colosse très musclé, cicatrices sur le torse, tatouages tribaux sur les bras'];
const BODY = {
  F: look => 'Une femme adulte d’environ 25 ans, au look sexy et séduisant d’héroïne de jeu gacha : ' + look + '. Armure ajustée qui laisse voir le ventre, les épaules et le haut des cuisses, tenue séduisante mais jamais vulgaire, aucune nudité.',
  M: look => 'Un homme adulte d’environ 28 ans, au look sexy et charismatique de héros de jeu gacha : ' + look + '. Ventre et bras en partie visibles entre les pièces d’armure, tenue séduisante mais jamais vulgaire, aucune nudité.'
};
const FRAME = 'Tatouages tribaux discrets. Pose assurée et dynamique de personnage de gacha, vue de face ou de légers trois quarts. Le personnage ENTIER, des cheveux jusqu’aux pieds compris, avec de l’espace vide au-dessus de la tête et sous les pieds : rien n’est coupé par le bord de l’image. Fond gris neutre uni, sans aucun décor, sans ciel ni bâtiment. Format vertical 2:3.';
const RANK = {
  or: 'Armure d’or de chevalier, très ornée, avec des pierres de couleur : épaulières, plastron, ceinture, brassards, gantelets, jambières et bottes.',
  argent: 'Armure d’argent et de bleu acier, partielle et plus sobre qu’une armure d’or : épaulières, plastron, avant-bras et jambières sur une tenue sombre ajustée.',
  bronze: 'Armure légère de bronze patiné : quelques pièces (épaulières, plastron court, brassards, genouillères) sur une tenue de cuir et de tissu, rivets apparents.'
};
// Armure seule (pour l'atelier des armures) : sans casque non plus.
const EMPTY = 'L’armure seule, vide, dressée comme si un corps invisible la portait, en pied, vue de face, entièrement dans le cadre. Forme neutre, qui irait aussi bien à un homme qu’à une femme. Pas de casque : au niveau de la tête, rien, ou seulement un petit ornement de cheveux posé au-dessus. Fond gris neutre uni. Format vertical 2:3.';

// Les douze maisons : thème de l'armure, et origine des deux personnages illustrés (pour varier les visages).
const GOLD = [
  ['belier', 'Thème du Bélier : épaulières en cornes de bélier enroulées, cape rouge, pierres rouges.', 'Grèce', 'Maroc'],
  ['taureau', 'Thème du Taureau : épaulières massives ornées de cornes de taureau, plastron puissant, tissus vert sombre, pierres vertes.', 'Brésil', 'Mongolie'],
  ['gemeaux', 'Thème des Gémeaux : deux visages sereins gravés sur le plastron, symétrie parfaite, cape bleu nuit, pierres bleues.', 'Japon', 'Inde'],
  ['cancer', 'Thème du Cancer : petit croissant de lune comme ornement de cheveux, épaulières en carapace arrondie, cape bleue, pierres argentées.', 'France', 'Égypte'],
  ['lion', 'Thème du Lion : épaulières en tête de lion à crinière, genouillères à tête de lion, cape rouge, pierres ambrées.', 'Nigeria', 'Espagne'],
  ['vierge', 'Thème de la Vierge : petites ailes aux épaules, voiles blancs, épis de blé gravés, pierres bleu pâle.', 'Inde', 'Suède'],
  ['balance', 'Thème de la Balance : plateaux de balance stylisés aux épaules, lignes droites et équilibrées, tissus blanc et or, pierres vertes.', 'Chine', 'Mexique'],
  ['scorpion', 'Thème du Scorpion : plaques en carapace pointue, queue de scorpion articulée dans le dos, cape violette, pierres violettes.', 'Turquie', 'Russie'],
  ['sagittaire', 'Thème du Sagittaire : grandes ailes repliées dans le dos, arc doré fixé à l’épaule, tissus bruns, pierres rouges.', 'Pérou', 'Kenya'],
  ['capricorne', 'Thème du Capricorne : lame courbe le long de l’avant-bras, petites cornes de chèvre recourbées comme ornement de cheveux, tissus gris, pierres noires.', 'Iran', 'Écosse'],
  ['verseau', 'Thème du Verseau : volutes d’eau gravées partout, amphore stylisée sur le plastron, voiles bleu clair, pierres bleues.', 'Islande', 'Polynésie française'],
  ['poissons', 'Thème des Poissons : épaulières en coquillage, écailles gravées, voiles roses transparents, pierres roses.', 'Italie', 'Corée du Sud']
];
const EL = {
  feu: ['Thème du feu : flammes gravées, tissus rouges, pierres rouges.', 'Espagne', 'Ghana'],
  eau: ['Thème de l’eau : vagues gravées, tissus bleus, pierres bleues.', 'Philippines', 'Norvège'],
  air: ['Thème de l’air : plumes et nuages gravés, tissus blancs, pierres blanches.', 'Argentine', 'Vietnam'],
  terre: ['Thème de la terre : roche et racines gravées, tissus verts, pierres vertes.', 'Éthiopie', 'Pérou']
};
const who = (sex, nat, look) => BODY[sex](look) + ' Originaire de ' + nat + ' : peau, cheveux, yeux et traits du visage typiques de ce pays.';
const perso = (sex, nat, rank, theme, i) => who(sex, nat, sex === 'F' ? LOOK_F[i % 5] : LOOK_M[(i + 2) % 5]) + ' ' + RANK[rank] + ' ' + theme + ' ' + HEAD + ' ' + FRAME;

export const JOBS = {};
// Variantes demandées par Seba le 2026-10-24 : roux aux taches de rousseur, cheveux colorés de manga, physiques variés.
// [pays (ou null), silhouette (ou null), détail ajouté]
const RED_TXT = ' Cheveux roux flamboyants, taches de rousseur bien visibles sur le nez, les joues et les épaules.';
const EXTRA = {
  'perso-argent-air-F': ['Irlande', null, RED_TXT],
  'perso-bronze-terre-M': ['Écosse', null, RED_TXT],
  'perso-or-vierge-F': [null, 'femme ronde et voluptueuse, hanches larges, ventre doux, très séduisante', ' Longs cheveux vert émeraude de manga, brillants.'],
  'perso-or-gemeaux-F': [null, 'jolie, petite poitrine, silhouette fine et sportive', ' Cheveux rose vif de manga, coupe au carré.'],
  'perso-or-belier-M': [null, 'homme corpulent et massif, gros ventre puissant, barbe épaisse', ' Cheveux argentés de manga, en bataille.'],
  'perso-or-lion-M': [null, 'traits rudes et irréguliers, nez cassé, pas spécialement beau mais charismatique', ' Cheveux bleu nuit de manga, cicatrice sur la joue.']
};
GOLD.forEach(([k, theme, natF, natM], i) => {
  JOBS['perso-or-' + k + '-F'] = perso('F', natF, 'or', theme, i);
  JOBS['perso-or-' + k + '-M'] = perso('M', natM, 'or', theme, i);
});
Object.entries(EL).forEach(([e, [theme, natF, natM]], j) => {
  ['argent', 'bronze'].forEach((rk, r) => {
    JOBS['perso-' + rk + '-' + e + '-F'] = perso('F', natF, rk, theme, j * 2 + r + 1);
    JOBS['perso-' + rk + '-' + e + '-M'] = perso('M', natM, rk, theme, j * 2 + r + 3);
  });
});
for (const n in EXTRA) { if (!JOBS[n]) continue; const [nat, look, txt] = EXTRA[n];
  if (nat) JOBS[n] = JOBS[n].replace(/Originaire de [^:]+:/, 'Originaire de ' + nat + ' :');
  if (look) JOBS[n] = JOBS[n].replace(/jeu gacha : [^.]*./, 'jeu gacha : ' + look + '.');
  JOBS[n] = JOBS[n].replace(' ' + HEAD, txt + ' ' + HEAD); }
// Illustrations propres à une constellation (perso-cons-<clé>-<sexe>), demandées une à une par Seba.
JOBS['perso-cons-coupe-F'] = 'Une femme adulte d’environ 25 ans, d’une beauté élégante et envoûtante d’héroïne de jeu gacha : silhouette fine et élancée, courbes gracieuses, poitrine bien proportionnée, port de tête distingué. Européenne, peau blanche, longs cheveux châtains soyeux et légèrement ondulés, magnifiques yeux vert émeraude au regard envoûtant. Armure ajustée qui laisse voir le ventre, les épaules et le haut des cuisses, tenue séduisante et raffinée mais jamais vulgaire, aucune nudité. '
  + RANK.bronze + ' Thème de la constellation de la Coupe : une coupe antique (cratère grec) ciselée au centre du plastron, épaulières évasées comme le bord d’une coupe, volutes d’eau gravées qui semblent s’en écouler, voiles bleu profond, petites pierres bleues. Petite coupe stylisée en bronze comme ornement de cheveux. ' + HEAD + ' ' + FRAME;
JOBS['perso-cons-oiseau-paradis-F'] = 'Une femme adulte d’environ 25 ans, éclatante, exubérante et joyeuse, héroïne de jeu gacha au grand sourire lumineux et plein de vie, pose vive et enjouée comme une danse : très belle, silhouette gracieuse. Européenne, peau blanche, cheveux longs et volumineux. Armure ajustée qui laisse voir le ventre, les épaules et le haut des cuisses, tenue séduisante mais jamais vulgaire, aucune nudité. '
  + RANK.bronze + ' Thème de la constellation de l’Oiseau de paradis, qui se dégage d’elle et de son armure : longues plumes de queue chatoyantes qui jaillissent du dos et de la ceinture en éventail, épaulières en forme d’ailes déployées, plumes irisées gravées sur le métal, voiles et rubans aux couleurs éclatantes (émeraude, turquoise, or, orange vif, magenta, violet), petites pierres de toutes les couleurs, quelques plumes colorées qui volettent autour d’elle. Une parure de fines plumes colorées comme ornement de cheveux. ' + HEAD + ' ' + FRAME;
JOBS['perso-cons-grue-F'] = 'Une femme adulte d’environ 25 ans, charmante et gracieuse, à l’allure légère et aérienne d’héroïne de jeu gacha, comme prête à s’envoler : très belle, silhouette élancée. Peau noire, beaux yeux marron clair, fins traits rouges peints sur les joues, cheveux longs vert menthe tirant sur le bleu canard (cheveux colorés de manga, teintés par le cosmos). Armure ajustée qui laisse voir le ventre, les épaules et le haut des cuisses, tenue séduisante mais jamais vulgaire, aucune nudité. '
  + 'Armure légère de bronze aux reflets cuivrés et orangés, rivets apparents, sur une tenue de cuir et de tissu. Thème de la constellation de la Grue, inspiré de la grue couronnée : toutes les pièces d’armure ont la forme de plumes superposées (épaulières, plastron, tassettes, jambières), longues plumes effilées qui retombent des hanches comme une traîne, et sur la tête une couronne de plumes dorées hérissées en éventail comme l’aigrette de la grue couronnée. Voiles blanc et gris perle, petites pierres rouges. ' + HEAD.replace('Pas de casque ni de couvre-chef', 'Pas de casque') + ' ' + FRAME;
JOBS['perso-cons-petit-cheval-M'] = 'Un homme adulte d’environ 28 ans, beau et charmeur, héros de jeu gacha : pose décontractée de gars cool et sûr de lui, sourire en coin et regard charmeur, une main sur la hanche ou passée dans les cheveux, poids sur une jambe. Européen, peau blanche, yeux marron, cheveux châtains coiffés en mèches un peu en bataille, une cicatrice nette sur la joue droite. Ventre et bras en partie visibles entre les pièces d’armure, tenue séduisante mais jamais vulgaire, aucune nudité. '
  + RANK.argent + ' Thème de la constellation du Petit Cheval : épaulières en forme de tête de poulain stylisée, crinière de métal finement ciselée qui court le long des épaules et du dos, petits fers à cheval décoratifs à la ceinture, jambières élancées évoquant des pattes de cheval, gravures de terre et d’herbes, tissus vert sombre et brun, petites pierres vertes. ' + HEAD + ' ' + FRAME;
GOLD.forEach(([k, theme]) => { JOBS['armure-or-' + k] = RANK.or + ' ' + theme + ' ' + EMPTY; });
Object.entries(EL).forEach(([e, [theme]]) => ['argent', 'bronze'].forEach(rk => { JOBS['armure-' + rk + '-' + e] = RANK[rk] + ' ' + theme + ' ' + EMPTY; }));

async function generate(name, prompt) {
  const body = { model: MODEL, modalities: ['image', 'text'], image_config: { aspect_ratio: '2:3' },
    messages: [{ role: 'user', content: [{ type: 'text', text: STYLE + '\n\n' + prompt }, { type: 'image_url', image_url: { url: REF } }] }] };
  const res = await fetch('https://api.mammouth.ai/v1/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const txt = await res.text();
  if (!res.ok) throw new Error('HTTP ' + res.status + ' : ' + txt.slice(0, 300));
  const msg = JSON.parse(txt).choices?.[0]?.message || {};
  const img = (msg.images || [])[0];
  let url = img?.image_url?.url || img?.url || (typeof img === 'string' ? img : null);
  if (!url && typeof msg.content === 'string') url = (/(data:image\/\w+;base64,[A-Za-z0-9+/=]+)/.exec(msg.content) || /(https?:\/\/\S+\.(?:png|jpe?g|webp))/i.exec(msg.content) || [])[1];
  if (!url) throw new Error('pas d’image dans la réponse : ' + JSON.stringify(msg).slice(0, 300));
  const m = /^data:image\/(\w+);base64,(.+)$/s.exec(url);
  const buf = m ? Buffer.from(m[2], 'base64') : Buffer.from(await (await fetch(url)).arrayBuffer());
  const file = path.join(OUT, name + '.' + (m ? (m[1] === 'jpeg' ? 'jpg' : m[1]) : 'png'));
  fs.writeFileSync(file, buf);
  return file;
}

// Arguments : noms exacts ou préfixes (« perso-or » = les 24 chevaliers d'or). Sans argument : tout ce qui manque.
const wanted = process.argv.slice(2);
const exists = n => fs.readdirSync(OUT).some(f => f.startsWith(n + '.'));
const names = wanted.length ? Object.keys(JOBS).filter(n => wanted.some(w => n === w || n.startsWith(w))) : Object.keys(JOBS).filter(n => !exists(n));
if (!names.length) console.error('Rien à générer pour :', wanted.join(' ') || '(tout existe déjà)');
for (const n of names) {
  if (process.env.SKIP_EXISTING && exists(n)) continue;
  for (let essai = 1; essai <= 3; essai++) {
    try { console.log('✓', n, '→', path.relative(ROOT, await generate(n, JOBS[n]))); break; }
    catch (e) { console.error('✗', n, 'essai', essai, ':', e.message);
      if (/budget/i.test(e.message)) { console.error('Plafond de dépense atteint : arrêt.'); process.exit(2); } if (essai === 3) console.error('  abandon pour', n); else await new Promise(r => setTimeout(r, 5000)); }
  }
}
