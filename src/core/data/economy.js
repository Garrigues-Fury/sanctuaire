/* Ressources, objets, recettes, bâtiments, rôles et armures. */
import { capFor, herbBase, herbCap, prodBase, siteSlots, slotsFor, villageCap } from '../rules.js';
import { fmt, fmt1 } from '../util.js';

export const RES={vivres:{n:'Vivres',c:'#9cc27a',b:'champs',k:30},marbre:{n:'Marbre',c:'#e5dfd1',b:'carriere',k:16},metal:{n:'Métal',c:'#d0905a',b:'mine',k:9},savoir:{n:'Savoir',c:'#a99be0',b:'biblio',k:4}};
export const RKEYS=['vivres','marbre','metal','savoir'];
export const ITEMS={herbes:{n:'Herbes',c:'#8fb08a'},potion:{n:'Potion d’endurance',c:'#e4a852'},onguent:{n:'Onguent',c:'#d5d9a8'},tisane:{n:'Tisane apaisante',c:'#9fc7b6'},elixir:{n:'Élixir de concentration',c:'#b3a3ea'},lingot:{n:'Lingot',c:'#d0905a'},outil:{n:'Outils',c:'#bfc8d8'},materiel:{n:'Matériel d’entraînement',c:'#c47e48'},ambroisie:{n:'Ambroisie',c:'#f3d58d'},huile:{n:'Huile sacrée',c:'#e9c46a'}};
export const IKEYS=Object.keys(ITEMS);
export const RECIPES=[
 {k:'potion',ws:'herbo',inp:{herbes:6},work:2,d:'Rend 40 points d’énergie à un personnage.'},
 {k:'onguent',ws:'herbo',inp:{herbes:4,vivres:20},work:1.5,d:'Soigne un apprenti après une épreuve ratée : il peut retenter aussitôt.'},
 {k:'tisane',ws:'herbo',inp:{herbes:5},work:1,d:'Pour corriger l’impulsivité, la colère, l’arrogance, l’entêtement ou la gourmandise.'},
 {k:'elixir',ws:'herbo',inp:{herbes:8,savoir:15},work:3,d:'Pour corriger la paresse ou la distraction, et renforcer une qualité.'},
 {k:'lingot',ws:'atelier',inp:{metal:30},work:1,d:'Métal coulé, base de l’artisanat.'},
 {k:'outil',ws:'atelier',inp:{lingot:2,marbre:20},work:3,d:'Améliore l’outillage d’un site de production (+10 % par niveau).'},
 {k:'materiel',ws:'atelier',inp:{lingot:1,marbre:40},work:2,d:'Pour corriger la peur ou la fragilité par un entraînement dur.'},
 {k:'ambroisie',ws:'herbo',lock:'ambroisie',inp:{herbes:10,vivres:50,savoir:30},work:4,d:'Énergie au maximum et 12 h de formation d’un coup.'},
 {k:'huile',ws:'atelier',lock:'huile',inp:{herbes:6,metal:40},work:2,d:'Versée sur une armure en restauration : avance le travail de moitié.'}
];
export const REC_BY={};RECIPES.forEach(r=>REC_BY[r.k]=r);

export const BUILD={
 champs:{n:'Oliveraies et potagers',base:{marbre:30,vivres:20},t:.33,eff:l=>'base '+fmt(prodBase('vivres',l))+' vivres / h · '+siteSlots('champs',l)+' postes'},
 carriere:{n:'Carrière de marbre',base:{vivres:45},t:.4,eff:l=>'base '+fmt(prodBase('marbre',l))+' marbre / h · '+siteSlots('carriere',l)+' postes'},
 mine:{n:'Mine de cuivre et d’étain',base:{vivres:60,marbre:40},t:.5,eff:l=>'base '+fmt(prodBase('metal',l))+' métal / h · '+siteSlots('mine',l)+' postes'},
 biblio:{n:'Bibliothèque du Pope',base:{marbre:120,metal:40},t:1,eff:l=>l?'base '+fmt(prodBase('savoir',l))+' savoir / h · '+siteSlots('biblio',l)+' postes':'parchemins ensevelis'},
 jardin:{n:'Jardin des simples',base:{vivres:60,marbre:30},t:.5,eff:l=>l?'base '+fmt1(herbBase(l))+' herbes / h · '+siteSlots('jardin',l)+' postes':'en friche'},
 herbo:{n:'Herboristerie',base:{marbre:80,vivres:60,savoir:10},t:1,eff:l=>l?siteSlots('herbo',l)+' herboristes · +'+10*l+' % de vitesse':'à bâtir'},
 atelier:{n:'Ateliers d’artisanat',base:{marbre:120,metal:60},t:1,eff:l=>l?siteSlots('atelier',l)+' artisans · +'+10*l+' % de vitesse':'à bâtir'},
 arene:{n:'Arène d’entraînement',base:{marbre:140,metal:50},t:1,eff:l=>'+'+15*l+' % d’XP pour tous'},
 dortoirs:{n:'Dortoirs des apprentis',base:{marbre:90,vivres:80},t:.75,eff:l=>(3+2*l)+' places d’apprentis'},
 entrepot:{n:'Réserves',base:{marbre:80,metal:25},t:.66,eff:l=>fmt(capFor('marbre',l))+' max · savoir '+fmt(capFor('savoir',l))+' · herbes '+fmt(herbCap(l))},
 forge:{n:'Atelier des armures',base:{marbre:200,metal:120,savoir:20},t:1.5,eff:l=>l?('armures '+(l>=8?'d’or':l>=4?'d’argent':'de bronze')+' · '+siteSlots('forge',l)+' forgerons · +'+10*l+' % de vitesse'):'en ruines'},
 artisans:{n:'Village des artisans',base:{marbre:250,vivres:200,metal:100},t:2,eff:l=>slotsFor(l)+' chantier'+(slotsFor(l)>1?'s':'')+' · '+villageCap(l)+' villageois'}
};
export const BORDER=['champs','carriere','mine','biblio','jardin','herbo','atelier','entrepot','dortoirs','arene','forge','artisans'];
export const WORK={champs:{res:'vivres',stat:'en'},carriere:{res:'marbre',stat:'fo'},mine:{res:'metal',stat:'fo'},biblio:{res:'savoir',stat:'co'},jardin:{item:'herbes',stat:'en'},forge:{stat:'co'},herbo:{stat:'ps'},atelier:{stat:'de'}};
export const TOOL_SITES=['champs','carriere','mine','biblio','jardin'];
export const STATN={fo:'force',vi:'vitesse',de:'dextérité',en:'endurance',ps:'psychokinésie',co:'cosmos'};
// Les métiers des chevaliers. Les effets sont pleins quand le métier occupe 100 % du temps (voir schedule.js).
export const ROLES={
 pope:{n:'Grand Pope',d:'+10 % de production et d’XP pour tout le Sanctuaire, plus 1 % par 10 points de cosmos. Un seul. Mène la lecture des astres.'},
 recruteur:{n:'Recruteur',d:'Parcourt le monde et ramène des candidats apprentis. Plus son cosmos est fort, plus il trouve vite.'},
 intendant:{n:'Intendant',d:'+15 % de production des ressources.'},
 oeuvre:{n:'Maître d’œuvre',d:'Dirige les artisans : chantiers 20 % plus rapides.'},
 apprentissage:{n:'Maître d’apprentissage',d:'Oriente les apprentis vers leurs maîtres : révèle jusqu’où chacun peut aller (bronze, argent, or) et accélère leurs découvertes de compétences (jusqu’à +15 %).'},
 biblio:{n:'Chercheur',d:'Recherche à la bibliothèque (à bâtir) : produit du savoir et retrouve les savoirs perdus, qui améliorent l’apprentissage et la transmission des compétences (+5 % par savoir retrouvé).'},
 medecin:{n:'Médecin',d:'Soigne les blessés : repos plus court après une épreuve et énergie plus vite rechargée. Développe avec le temps la compétence Maintien en vie (très longue à apprendre), qui donne à un chevalier grièvement blessé de bons espoirs de survie.'}
};
export const ARMOR_COST={bronze:{metal:150,savoir:40},argent:{marbre:300,metal:700,savoir:250},or:{marbre:1500,metal:3000,savoir:1200}};
export const ARMOR_WORK={bronze:6,argent:24,or:96};
export const ARMOR_FORGE={bronze:1,argent:4,or:8};
export const ARMOR_SMITH={bronze:1,argent:3,or:5};
export const TRIAL_LV={bronze:8,argent:16,or:28};
export const TRIAL_POT={bronze:0,argent:65,or:93};
export const E_REGEN=4;
