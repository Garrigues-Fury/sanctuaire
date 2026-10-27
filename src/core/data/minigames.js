/* Mini-jeux et épreuves des chevaliers (demandés par Seba le 2026-10-27).
   - Chaque mini-jeu appartient à une constellation : il s'ouvre quand son armure a un porteur.
   - Il compte 20 niveaux de difficulté croissante, puis il est fini.
   - Les autres constellations ont des objectifs à remplir (core/epreuves.js).
   - Une épreuve finie à 100 % donne un bonus permanent au Sanctuaire, selon l'élément et le rang. */
import { CONS_BY } from './world.js';

export const MG_LEVELS=20;
export const GAMES=[
 {k:'fleche',cons:'fleche',n:'Le vol de la Flèche',st:['vi','de'],d:'La flèche file droit jusqu’au premier obstacle. Ramasse les étoiles de cosmos, puis arrête-toi pile sur la cible, en un nombre de coups limité.'},
 {k:'lyre',cons:'lyre',n:'Le chant de la Lyre',st:['co','ps'],d:'Écoute la mélodie, puis rejoue-la note pour note sur les cinq cordes. Elle s’allonge et s’accélère à chaque niveau.'},
 {k:'horloge',cons:'horloge',n:'L’instant juste',st:['vi','de'],d:'L’aiguille tourne. Touche l’écran quand elle traverse une zone dorée, sans en manquer. Les zones rétrécissent, l’aiguille accélère, puis change de sens.'},
 {k:'burin',cons:'burin',n:'La taille de pierre',st:['de','fo'],d:'Le motif s’illumine un instant sur le bloc. Taille-le de mémoire, sans fissurer la pierre.'},
 {k:'fourneau',cons:'fourneau',n:'Garder la braise',st:['fo','en'],d:'Appuie pour souffler sur la braise, relâche pour la laisser refroidir. Garde la chaleur dans la bande dorée assez longtemps.'},
 {k:'cameleon',cons:'cameleon',n:'L’œil du Caméléon',st:['de','ps'],d:'Toutes les pierres se ressemblent, sauf une. Trouve l’intruse, cinq fois de suite. Les nuances deviennent de plus en plus fines.'}
];
export const GAME_BY=Object.fromEntries(GAMES.map(g=>[g.k,g]));
export const GAME_OF_CONS=Object.fromEntries(GAMES.map(g=>[g.cons,g]));

// Bonus permanents : deux possibles par élément, en % ; bronze 2, argent 4, or 8.
export const BONUS_N={XP:'expérience de tous',NRG:'récupération d’énergie',FP:'points d’amitié plus fréquents',BUILD:'chantiers plus rapides',CAP:'réserves plus grandes',UPKEEP:'vivres consommés en moins',FORGE:'forge plus rapide',DEF:'défense des gardes',CRAFT:'artisanat plus rapide',TRIAL:'chances aux épreuves d’armure'};
const BY_EL={feu:['FORGE','DEF'],eau:['NRG','UPKEEP'],air:['XP','FP'],terre:['BUILD','CAP']};
const MAG={bronze:2,argent:4,or:8};
const hash=s=>{let h=7;for(const ch of s)h=(h*31+ch.charCodeAt(0))>>>0;return h;};
export function epBonus(k){
 const c=CONS_BY[k];if(!c)return null;
 const g=GAME_OF_CONS[k],key=g?(g.st.includes('fo')||g.st.includes('en')?'CRAFT':'TRIAL'):BY_EL[c.el][hash(k)%2];
 return{key,v:MAG[c.rank]*(key==='TRIAL'?.5:1)};
}
export function bonusText(b){return b?'+'+b.v+' % '+BONUS_N[b.key]:'';}
