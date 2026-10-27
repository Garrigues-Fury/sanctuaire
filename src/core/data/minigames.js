/* Mini-jeux et épreuves des chevaliers (demandés par Seba le 2026-10-27).
   - 15 sortes de mini-jeux, dans des domaines variés (adresse, réflexes, mémoire, logique, calcul, langue, culture, rythme).
   - Chaque constellation a son épreuve : un mini-jeu de 20 niveaux (une sorte de jeu, avec ses propres niveaux,
     plus durs pour l'argent et l'or), ou un défi physique réel (data/defis.js). Le jeu s'ouvre quand l'armure a un porteur.
   - Une épreuve finie à 100 % donne un bonus permanent au Sanctuaire, selon l'élément et le rang. */
import { CONS, CONS_BY } from './world.js';
import { DEFI_OF_CONS } from './defis.js';

export const MG_LEVELS=20;
export const MECHS={
 fleche:{n:'Le vol de la Flèche',dom:'adresse',st:['vi','de'],d:'La flèche file droit jusqu’au premier obstacle. Ramasse les étoiles de cosmos, puis arrête-toi pile sur la cible, en un nombre de coups limité.'},
 lyre:{n:'Le chant de la Lyre',dom:'rythme',st:['co','ps'],d:'Écoute la mélodie, puis rejoue-la note pour note sur les cinq cordes. Elle s’allonge et s’accélère à chaque niveau.'},
 horloge:{n:'L’instant juste',dom:'réflexes',st:['vi','de'],d:'L’aiguille tourne. Touche l’écran quand elle traverse une zone dorée, sans en manquer. Les zones rétrécissent, l’aiguille accélère, puis change de sens.'},
 burin:{n:'La taille de pierre',dom:'mémoire',st:['de','fo'],d:'Le motif s’illumine un instant sur le bloc. Taille-le de mémoire, sans fissurer la pierre.'},
 fourneau:{n:'Garder la braise',dom:'adresse',st:['fo','en'],d:'Appuie pour souffler sur la braise, relâche pour la laisser refroidir. Garde la chaleur dans la bande dorée assez longtemps.'},
 cameleon:{n:'L’œil du Caméléon',dom:'observation',st:['de','ps'],d:'Toutes les pierres se ressemblent, sauf une. Trouve l’intruse, cinq fois de suite. Les nuances deviennent de plus en plus fines.'},
 canal:{n:'Les canaux de l’Éridan',dom:'logique',st:['ps','en'],d:'Tourne les tuyaux de pierre pour amener l’eau de la source jusqu’à la fontaine. Les réseaux s’agrandissent et les fausses pistes se multiplient.'},
 etoiles:{n:'Relier les étoiles',dom:'attention',st:['vi','co'],d:'Touche les étoiles dans l’ordre, de 1 jusqu’à la dernière, avant la fin du temps. Plus loin, les numéros s’effacent : il faut s’en souvenir.'},
 balance:{n:'Le juste poids',dom:'calcul',st:['ps','de'],d:'Pose des poids sur le plateau de droite pour équilibrer exactement celui de gauche. Trois pesées par niveau, de plus en plus fines.'},
 memoire:{n:'Les paires du zodiaque',dom:'mémoire',st:['co','ps'],d:'Retourne les cartes deux par deux et retrouve les paires de signes, avec un nombre d’erreurs limité.'},
 labyrinthe:{n:'Le labyrinthe',dom:'orientation',st:['en','vi'],d:'Trouve la sortie du labyrinthe. Il grandit à chaque niveau, puis la brume ne laisse voir que les abords.'},
 sentinelle:{n:'La sentinelle',dom:'réflexes',st:['vi','fo'],d:'Des ennemis surgissent des créneaux : frappe-les vite. Ne touche pas les villageois.'},
 mots:{n:'Les mots du Sanctuaire',dom:'langue',st:['co','ps'],d:'Les lettres ont été mélangées par un dieu farceur. Remets-les dans l’ordre pour retrouver le mot.'},
 esquive:{n:'La pluie de pierres',dom:'arcade',st:['vi','en'],d:'Les pierres tombent de la montagne. Déplace-toi d’un couloir à l’autre pour les éviter, jusqu’à la fin du temps.'},
 quiz:{n:'Les questions du Pope',dom:'culture',st:['co','ps'],d:'Le Grand Pope interroge : mythologie, constellations, héros grecs. Cinq questions par niveau, de plus en plus difficiles.'}
};
// Une sorte de jeu par constellation : selon son thème quand il y en a un, sinon au hasard (toujours le même).
const THEME={
 fleche:'fleche',sagittaire:'fleche',lyre:'lyre','couronne-boreale':'lyre',horloge:'horloge',sextant:'horloge',octant:'horloge',capricorne:'horloge',
 burin:'burin',sculpteur:'burin',belier:'burin',fourneau:'fourneau',cameleon:'cameleon',peintre:'cameleon',poissons:'cameleon',
 eridan:'canal',verseau:'canal','poisson-austral':'canal',coupe:'canal',baleine:'canal',
 telescope:'etoiles',compas:'etoiles',reticule:'etoiles','croix-sud':'etoiles',triangle:'etoiles','triangle-austral':'etoiles',vierge:'etoiles',
 balance:'balance',regle:'balance',gemeaux:'memoire',chevelure:'memoire',microscope:'memoire',boussole:'labyrinthe',cancer:'labyrinthe',
 lynx:'sentinelle',aigle:'sentinelle',cerbere:'sentinelle',loup:'sentinelle',scorpion:'sentinelle',taureau:'sentinelle',
 colombe:'mots',corbeau:'mots',toucan:'mots','poisson-volant':'esquive',mouche:'esquive',pegase:'esquive',lion:'esquive',
 cephee:'quiz',cassiopee:'quiz',persee:'quiz',orion:'quiz',autel:'quiz',andromede:'quiz'
};
const MKEYS=Object.keys(MECHS);
const hash=s=>{let h=7;for(const ch of s)h=(h*31+ch.charCodeAt(0))>>>0;return h;};
// Les armures d'or s'appellent « or-0 » (Bélier) à « or-11 » (Poissons) : on lit leur thème par le nom du signe.
const GOLD_KEYS=['belier','taureau','gemeaux','cancer','lion','vierge','balance','scorpion','sagittaire','capricorne','verseau','poissons'];
export function mechOf(consK){const m=/^or-(\d+)$/.exec(consK),t=m?GOLD_KEYS[+m[1]]:consK;return THEME[t]||MKEYS[hash(consK)%MKEYS.length];}
// Difficulté de départ : l'argent et l'or commencent plus haut.
export const RANK_OFF={bronze:0,argent:2,or:4};
export function gameOf(consK){const c=CONS_BY[consK];if(!c||DEFI_OF_CONS[consK])return null;const m=mechOf(consK),M=MECHS[m];return{k:consK,cons:consK,mech:m,n:M.n,st:M.st,d:M.d,dom:M.dom,off:RANK_OFF[c.rank]||0};}
export const ALL_GAMES=()=>CONS.map(c=>gameOf(c.k)).filter(Boolean);

// Bonus permanents : deux possibles par élément, en % ; bronze 2, argent 4, or 8.
export const BONUS_N={XP:'expérience de tous',NRG:'récupération d’énergie',FP:'points d’amitié plus fréquents',BUILD:'chantiers plus rapides',CAP:'réserves plus grandes',UPKEEP:'vivres consommés en moins',FORGE:'forge plus rapide',DEF:'défense des gardes',CRAFT:'artisanat plus rapide',TRIAL:'chances aux épreuves d’armure'};
const BY_EL={feu:['FORGE','DEF'],eau:['NRG','UPKEEP'],air:['XP','FP'],terre:['BUILD','CAP']};
const MAG={bronze:2,argent:4,or:8};
export function epBonus(k){
 const c=CONS_BY[k];if(!c)return null;
 // un défi physique réel rapporte double
 const key=BY_EL[c.el][hash(k)%2],v=MAG[c.rank]*(DEFI_OF_CONS[k]?2:1);
 return{key,v};
}
export function bonusText(b){return b?'+'+b.v+' % '+BONUS_N[b.key]:'';}
