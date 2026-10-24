/* Images peintes disponibles (voir docs/charte-graphique.md). Chemins relatifs au site. */

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
export function armorImg(k,mini){return ARMOR_ART.has(k)?'img/armures/'+k+(mini?'-mini':'')+'.webp':null;}
export function goldArt(p){const a=GOLD_ART[p.sign];return a&&a.sex===p.sex?a:null;}
export const SANCT_VIEWS=[
 {src:'img/sanctuaire/vue-1.webp',t:'Le Sanctuaire au couchant, de la plaine au palais du Pope'},
 {src:'img/sanctuaire/vue-2.webp',t:'L’escalier des douze maisons, gardé par le bélier et le taureau'},
 {src:'img/sanctuaire/vue-3.webp',t:'Les premières maisons, bannières déployées'},
 {src:'img/sanctuaire/vue-4.webp',t:'Les terrasses et la rose des vents'}
];
