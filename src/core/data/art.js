/* Images peintes disponibles (voir docs/charte-graphique.md). Chemins relatifs au site. */
import { PAINTED } from './art-list.js';
import { CONS_BY } from './world.js';
import { S } from '../state.js';

export const SIGN_KEY=['belier','taureau','gemeaux','cancer','lion','vierge','balance','scorpion','sagittaire','capricorne','verseau','poissons'];
const armorKey=c=>c.rank==='or'?'or-'+SIGN_KEY[c.sign]:c.rank+'-'+c.el;
// Chevalier illustré façon gacha (charte v3) : même armure (maison d'or, ou élément pour l'argent et le bronze)
// et même sexe. Une image n'a qu'un porteur à la fois : le premier chevalier qui y a droit ; les autres gardent le générateur.
// Une illustration propre à la constellation (perso-cons-coupe-F…) passe avant celle de l'élément : elle va à celui qui porte l'armure.
export function paintedOf(p){
 const c=p&&p.cons&&CONS_BY[p.cons];if(!c||!S||!S.knights)return null;
 const own='perso-cons-'+p.cons+'-'+p.sex;if(PAINTED.has(own))return{body:'img/gacha/'+own+'.webp',head:'img/gacha/'+own+'-tete.webp'};
 const key='perso-'+armorKey(c)+'-'+p.sex;if(!PAINTED.has(key))return null;
 const first=S.knights.filter(k=>k.sex===p.sex&&k.cons&&CONS_BY[k.cons]&&armorKey(CONS_BY[k.cons])===armorKey(c)).sort((a,b)=>a.id-b.id)[0];
 if(first&&first.id!==p.id)return null;
 return{body:'img/gacha/'+key+'.webp',head:'img/gacha/'+key+'-tete.webp'};
}

// Chevaliers d'or illustrés, par indice de signe (0 = Bélier … 11 = Poissons).
// n = numéro de la planche dans public/img/or/, sex = sexe du personnage dessiné.
// Un chevalier d'or reçoit l'image de sa maison seulement si son sexe correspond ; sinon, portrait procédural.
export const GOLD_ART={
 0:{n:1,sex:'F'},   // Bélier : cornes de bélier, cape rouge
 1:{n:6,sex:'M'},   // Taureau : cornes, armure verte
 3:{n:2,sex:'F'},   // Cancer : croissant de lune
 4:{n:5,sex:'M'},   // Lion : tête de lion
 5:{n:3,sex:'F'},   // Vierge : ailes, voiles blancs
 7:{n:7,sex:'M'},   // Scorpion : queue de scorpion
 10:{n:8,sex:'M'},  // Verseau : volutes d'eau
 11:{n:4,sex:'F'}   // Poissons : coquillage, voiles roses
};
// Armures illustrées (style anime), par clé de constellation. Les autres gardent un simple libellé.
export const ARMOR_ART=new Set(['or-1','or-2','or-3','or-4','or-5']);
export function armorImg(k,mini){const c=CONS_BY[k];if(c&&PAINTED.has('armure-'+armorKey(c)))return 'img/armures/armure-'+armorKey(c)+(mini?'-mini':'')+'.webp';return ARMOR_ART.has(k)?'img/armures/'+k+(mini?'-mini':'')+'.webp':null;}
export function goldArt(p){const a=GOLD_ART[p.sign];return a&&a.sex===p.sex?a:null;}
export const SANCT_VIEWS=[
 {src:'img/sanctuaire/vue-1.webp',t:'Le Sanctuaire au couchant, de la plaine au palais du Pope'},
 {src:'img/sanctuaire/vue-2.webp',t:'L’escalier des douze maisons, gardé par le bélier et le taureau'},
 {src:'img/sanctuaire/vue-3.webp',t:'Les premières maisons, bannières déployées'},
 {src:'img/sanctuaire/vue-4.webp',t:'Les terrasses et la rose des vents'}
];
