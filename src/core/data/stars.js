/* Lecture des astres, version Splendor : les 102 cartes, les 10 artefacts et les 8 constellations sacrées.
   Gemmes : feu, eau, air, terre, plus « or » (le cosmos d'or, joker obtenu en réservant une carte).
   Une carte coûte des gemmes, rapporte des ✦ (points) et donne un bonus permanent de son élément :
   une réduction d'une gemme de cet élément sur tous les achats suivants de la partie. */
import { EKEYS } from './world.js';
import { EFFPOOL, EFFBASE } from './gods.js';

export const GEMS=['feu','eau','air','terre','or'];
export const GEM_N={feu:'Feu',eau:'Eau',air:'Air',terre:'Terre',or:'Cosmos d’or (joker)'};
export const WIN_PTS=15,MAX_ROUNDS=20,HAND_MAX=10,RESERVE_MAX=3,BANK_N=7,JOKERS=5,ROW_N=4,MAX_BUYS=2;

const NAMES={
 feu:['Braise sacrée','Forge céleste','Flamme d’Hestia','Brasier du Lion','Torche d’Éleusis','Étincelle d’or','Volcan de Lemnos','Fournaise','Comète ardente','Autel de feu','Soleil couchant','Lame rougeoyante','Char d’Hélios','Phénix renaissant','Lampe du temple','Bûcher des héros','Enclume divine','Cœur de magma','Aube incandescente','Salamandre','Foudre rouge','Lave de l’Etna','Couronne solaire'],
 eau:['Source sacrée','Marée d’argent','Pluie d’étoiles','Rosée de l’aube','Fleuve Alphée','Perle d’Égée','Brume du cap','Coquillage nacré','Lac gelé','Vague de fond','Fontaine bénie','Larme d’Écho','Trident brisé','Néréide','Abysses','Glacier d’Hyperborée','Sirène','Oasis','Miroir lunaire','Cascade du Parnasse','Écume d’Aphrodite','Eaux du Styx','Tempête de Charybde'],
 air:['Vent du Parnasse','Souffle d’Éole','Nuée d’orage','Chant des cigales','Aile de faucon','Rouleau ancien','Étoile du berger','Murmure des oracles','Brise de Délos','Plume blanche','Éclair lointain','Ciel d’Attique','Harpe éolienne','Aigle de Zeus','Zéphyr','Cygne étoilé','Sandale ailée','Nuage de l’Olympe','Voix de la Pythie','Tourbillon','Aurore boréale','Flèche céleste','Chouette nocturne'],
 terre:['Pierre de serment','Colonne du temple','Racine d’olivier','Marbre blanc','Bouclier de chêne','Montagne sacrée','Fondations cyclopéennes','Statue votive','Grenier de Rodorio','Rempart d’airain','Grotte des ermites','Seuil de granit','Olivier millénaire','Cerbère de pierre','Carrière du Pentélique','Minotaure','Gemme de la terre','Labyrinthe','Titan endormi','Forêt de Dodone','Lion de Némée','Mine d’orichalque','Géant de bronze']
};
// Modèles de coût (décalage d'élément → nombre de gemmes) et points, inspirés de Splendor.
// Décalage 0 = l'élément de la carte, 1 à 3 = les autres éléments.
const PAT={
 1:[[{1:1,2:1,3:1},0],[{1:2,2:1},0],[{2:2,3:1},0],[{1:3},0],[{3:2,0:1},0],[{1:1,2:2},0],[{2:1,3:1,1:2},0],[{3:3},0],[{1:2,3:2},0],[{2:4},1]],
 2:[[{1:2,2:2,3:1},1],[{2:3,0:2},1],[{1:5},2],[{3:4,1:2},2],[{2:5,3:3},2],[{0:6},3],[{1:3,2:2,3:2},1],[{3:5},2]],
 3:[[{1:7},4],[{1:6,0:3},4],[{2:3,3:3,1:5},3],[{2:7,0:3},5],[{3:4,1:3,2:3},3]]
};
// Effet permanent pour le Sanctuaire si l'on garde la carte après une victoire.
function sanctEff(el,t,i){const ep=EFFPOOL[el][i%4],o={};o[ep[0]]=Math.max(1,Math.round(ep[1]*EFFBASE[t]));return o;}
export const CARDS2=[];
EKEYS.forEach((el,ei)=>{let n=0;[1,2,3].forEach(t=>PAT[t].forEach(([pat,pts],i)=>{
 const cost={};for(const off in pat){const e=EKEYS[(ei+(+off))%4];cost[e]=pat[off];}
 CARDS2.push({id:'s'+el[0]+t+i,t,el,n:NAMES[el][n++],cost,pts,eff:sanctEff(el,t,i+n),art:(ei*7+n*3)%16});}));});

/* Artefacts : on les achète pendant un duel (effet immédiat jusqu'à la fin de la partie), puis ils rejoignent
   la collection pour toujours. Avant chaque duel, on en emporte 3. */
export const RELICS=[
 {id:'masque',n:'Masque du Grand Pope',d:'+1 ✦ et 1 cosmos d’or au début de la partie.',cost:{feu:2,eau:2,air:2,terre:2},pts:2},
 {id:'sceptre',n:'Sceptre d’Athéna',d:'Chaque carte de rang III achetée rapporte +1 ✦.',cost:{feu:3,air:3,terre:2},pts:2},
 {id:'bouclier',n:'Bouclier d’Athéna',d:'Le dieu perd un bonus permanent et ne peut plus réserver.',cost:{terre:4,eau:3},pts:2},
 {id:'urne',n:'Urne d’Athéna',d:'Vous pouvez garder 12 gemmes au lieu de 10, et recevez 1 cosmos d’or.',cost:{eau:4,air:2},pts:1},
 {id:'couronne',n:'Couronne d’olivier',d:'+1 bonus permanent dans votre élément le plus faible.',cost:{terre:3,air:3},pts:1},
 {id:'chouette',n:'Chouette d’Athéna',d:'Le premier balayage de chaque partie est gratuit.',cost:{air:4,eau:2},pts:1},
 {id:'lance',n:'Lance de Pallas',d:'Prendre 2 gemmes identiques en donne une 3e de la même couleur.',cost:{feu:4,terre:2},pts:1},
 {id:'peplos',n:'Péplos sacré',d:'Les renforts coûtent moitié moins de ressources.',cost:{eau:3,feu:3},pts:1},
 {id:'lampe',n:'Lampe éternelle du Parthénon',d:'Réserver une carte donne 2 cosmos d’or au lieu d’un.',cost:{feu:3,eau:2,air:2},pts:2},
 {id:'sablier',n:'Sablier de Chronos',d:'La partie dure 3 manches de plus, et vous recevez 1 cosmos d’or.',cost:{air:3,terre:3,feu:2},pts:2}
];
export const RELIC_BY={};RELICS.forEach(r=>RELIC_BY[r.id]=r);

/* Constellations sacrées (les « nobles » de Splendor) : 3 sont tirées à chaque partie. Le premier qui réunit
   les bonus demandés à la fin de son tour reçoit leurs ✦. */
export const SACRED=[
 {id:'ourse',n:'La Grande Ourse',need:{terre:3,air:3},pts:3},
 {id:'orion',n:'Orion le chasseur',need:{feu:3,terre:3},pts:3},
 {id:'cassiopee',n:'Cassiopée',need:{eau:3,air:3},pts:3},
 {id:'pleiades',n:'Les Pléiades',need:{eau:4,feu:2},pts:3},
 {id:'croix',n:'La Croix du Sud',need:{air:4,terre:2},pts:3},
 {id:'andromede',n:'Andromède',need:{eau:3,terre:3},pts:3},
 {id:'hydre',n:'L’Hydre',need:{feu:2,eau:2,air:2,terre:2},pts:3},
 {id:'lyre',n:'La Lyre',need:{feu:4,air:2},pts:3}
];
