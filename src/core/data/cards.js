/* Effets permanents, cartes et artefacts. */

export const UNIT={feu:{res:'metal',q:40},terre:{res:'marbre',q:60},eau:{res:'vivres',q:80},air:{res:'savoir',q:15}};
export const TIER_MULT={1:1,2:1.6,3:2.5};
export const EFF_N={P_vivres:'production de vivres',P_marbre:'production de marbre',P_metal:'production de métal',P_savoir:'production de savoir',P_herbes:'récolte d’herbes',P_all:'toute la production',XP:'XP de tous',NRG:'récupération d’énergie',FORGE:'vitesse de l’atelier des armures',CRAFT:'vitesse des fabrications',BUILD:'durée des chantiers',FP:'points d’amitié',TRIAL:'aux épreuves',RECRUIT:'vitesse de recrutement',CAP:'capacité des réserves',DEF:'défense des gardes',UPKEEP:'consommation de vivres',FCAP:'au plafond du bonus d’amitié',REVEAL:''};
export const UNLOCK_N={ambroisie:'Débloque la recette de l’ambroisie (herboristerie).',huile:'Débloque la recette de l’huile sacrée (artisanat).',reveal:'Révèle le potentiel exact des recrues.'};
export function effText(k,v){if(k==='REVEAL')return UNLOCK_N.reveal;if(k==='BUILD'||k==='UPKEEP')return '−'+v+' % '+EFF_N[k];if(k==='TRIAL'||k==='FCAP')return '+'+v+(v>1?' points ':' point ')+EFF_N[k];return '+'+v+' % '+EFF_N[k];}
export const CARDS=[
 {id:'c01',t:1,n:'Source sacrée',el:'eau',cost:{terre:2,air:1},eff:{P_vivres:5}},
 {id:'c02',t:1,n:'Veine de cuivre',el:'feu',cost:{eau:2,terre:1},eff:{P_metal:5}},
 {id:'c03',t:1,n:'Bloc du vieux temple',el:'terre',cost:{eau:1,feu:2},eff:{P_marbre:5}},
 {id:'c04',t:1,n:'Rouleau d’Hésiode',el:'air',cost:{eau:2,terre:2},eff:{P_savoir:5}},
 {id:'c05',t:1,n:'Lampe à huile',el:'feu',cost:{air:2,eau:1},eff:{XP:2}},
 {id:'c06',t:1,n:'Amphores scellées',el:'terre',cost:{eau:3},eff:{CAP:5}},
 {id:'c07',t:1,n:'Chant des cigales',el:'air',cost:{feu:1,eau:2},eff:{FP:10}},
 {id:'c08',t:1,n:'Filet de pêcheur',el:'eau',cost:{feu:2,air:1},eff:{P_vivres:3}},
 {id:'c09',t:1,n:'Enclume ancienne',el:'feu',cost:{terre:3,eau:1},eff:{FORGE:5}},
 {id:'c10',t:1,n:'Mortier d’herboriste',el:'eau',cost:{terre:1,air:2},eff:{CRAFT:5}},
 {id:'c11',t:1,n:'Colonne relevée',el:'terre',cost:{feu:2,eau:2},eff:{BUILD:3}},
 {id:'c12',t:1,n:'Plume de messager',el:'air',cost:{feu:2,terre:1},eff:{RECRUIT:5}},
 {id:'c13',t:1,n:'Galet d’Éleusis',el:'eau',cost:{air:3},fav:1},
 {id:'c14',t:1,n:'Braise éternelle',el:'feu',cost:{terre:2,air:2},fav:1},
 {id:'c15',t:1,n:'Statuette votive',el:'terre',cost:{air:2,feu:2},fav:1},
 {id:'c16',t:1,n:'Vent du Parnasse',el:'air',cost:{terre:2,eau:2},eff:{NRG:3},fav:1},
 {id:'c17',t:2,n:'Aqueduc de Rodorio',el:'eau',cost:{terre:3,feu:2,eau:2},eff:{P_vivres:10},fav:1},
 {id:'c18',t:2,n:'Hauts fourneaux',el:'feu',cost:{terre:3,air:2,feu:2},eff:{P_metal:10},fav:1,req:[{t:'elem',e:'feu',v:15}]},
 {id:'c19',t:2,n:'Équerre de l’architecte',el:'terre',cost:{feu:3,eau:3},eff:{BUILD:10},fav:1},
 {id:'c20',t:2,n:'Scriptorium',el:'air',cost:{terre:2,eau:2,air:3},eff:{P_savoir:10},fav:1,req:[{t:'cosmos',v:40}]},
 {id:'c21',t:2,n:'Serre des simples',el:'eau',cost:{air:3,terre:3},eff:{P_herbes:20},fav:1},
 {id:'c22',t:2,n:'Secret de l’ambroisie',el:'air',cost:{eau:4,feu:2},unlock:'ambroisie',fav:1,req:[{t:'qual',k:'studieux',v:1}]},
 {id:'c23',t:2,n:'Soufflet de Lemnos',el:'feu',cost:{terre:4,eau:2},eff:{FORGE:15},fav:1,req:[{t:'rank',v:'argent'}]},
 {id:'c24',t:2,n:'Bains chauds',el:'eau',cost:{feu:4,terre:2},eff:{NRG:10},fav:1},
 {id:'c25',t:2,n:'Banquet des héros',el:'terre',cost:{eau:5,feu:2},eff:{FP:25,XP:3},fav:1},
 {id:'c26',t:2,n:'Pierre de serment',el:'terre',cost:{air:3,feu:3},eff:{TRIAL:4},fav:2,req:[{t:'aps',v:4}]},
 {id:'c27',t:2,n:'Rite de l’huile sacrée',el:'feu',cost:{air:3,eau:3},unlock:'huile',fav:1,req:[{t:'house',v:2}]},
 {id:'c28',t:2,n:'Carte des routes du monde',el:'air',cost:{feu:2,terre:3,eau:2},eff:{RECRUIT:20},fav:1,req:[{t:'elem',e:'air',v:15}]},
 {id:'c29',t:2,n:'Palissade de cyprès',el:'terre',cost:{feu:3,air:3},eff:{DEF:10},fav:2,req:[{t:'guards',v:1}]},
 {id:'c30',t:2,n:'Miroir de bronze',el:'feu',cost:{eau:3,air:3},eff:{XP:5},fav:2,req:[{t:'elem',e:'eau',v:15}]},
 {id:'c31',t:3,n:'Phare du cap Sounion',el:'feu',cost:{eau:4,air:4,terre:3},eff:{P_all:10},fav:3,req:[{t:'rank',v:'or'}]},
 {id:'c32',t:3,n:'Bibliothèque des origines',el:'air',cost:{feu:3,terre:4,eau:4},eff:{XP:10},fav:3,req:[{t:'cosmos',v:80}]},
 {id:'c33',t:3,n:'Jardins suspendus',el:'eau',cost:{terre:5,air:3,feu:3},eff:{P_vivres:20,P_herbes:30},fav:3},
 {id:'c34',t:3,n:'Carrière du Pentélique',el:'terre',cost:{feu:5,eau:4,air:2},eff:{P_marbre:20,BUILD:10},fav:3},
 {id:'c35',t:3,n:'Oracle de Delphes',el:'air',cost:{eau:5,feu:5},eff:{TRIAL:8,RECRUIT:25},fav:4,req:[{t:'elem',e:'air',v:40}]},
 {id:'c36',t:3,n:'Chêne de Dodone',el:'terre',cost:{air:5,eau:5},eff:{NRG:20},fav:4,req:[{t:'qual',k:'perseverant',v:2}]},
 {id:'c37',t:3,n:'Fournaise du Titan',el:'feu',cost:{terre:6,air:4},eff:{FORGE:30,CRAFT:20},fav:4,req:[{t:'elem',e:'feu',v:40}]},
 {id:'c38',t:3,n:'Source de Castalie',el:'eau',cost:{feu:4,terre:4,air:4},eff:{FP:50,NRG:10},fav:4},
 {id:'c39',t:3,n:'Rempart cyclopéen',el:'terre',cost:{feu:4,eau:4,air:4},eff:{DEF:25},fav:5,req:[{t:'guards',v:3}]},
 {id:'c40',t:3,n:'Constellation retrouvée',el:'air',cost:{feu:3,eau:3,terre:3,air:3},eff:{XP:8},fav:5,req:[{t:'cons',v:150}]}
];
export const CARD_BY={};CARDS.forEach(c=>CARD_BY[c.id]=c);
export const ARTEFACTS=[
 {id:'a1',n:'Égide',need:{terre:4,feu:4},eff:{DEF:30,CAP:25},d:'Le bouclier qui protège la cité.'},
 {id:'a2',n:'Corne d’abondance',need:{eau:4,terre:4},eff:{P_vivres:30,UPKEEP:20},d:'Les greniers ne se vident plus.'},
 {id:'a3',n:'Sandales ailées',need:{air:4,feu:3},eff:{BUILD:25,RECRUIT:30},d:'Les messagers volent, les chantiers filent.'},
 {id:'a4',n:'Lyre d’Orphée',need:{air:4,eau:3},eff:{FP:100,FCAP:10},d:'Sa musique rapproche les cœurs.'},
 {id:'a5',n:'Toison d’or',need:{feu:3,terre:3,eau:3},eff:{P_all:15},d:'La prospérité gagne tout le Sanctuaire.'},
 {id:'a6',n:'Feu de Prométhée',need:{feu:6},req:[{t:'rank',v:'argent'}],eff:{FORGE:50,CRAFT:30},d:'La flamme volée aux dieux, au service des forgerons.'},
 {id:'a7',n:'Tablettes de Mnémosyne',need:{air:6},eff:{P_savoir:40,XP:10},d:'La mémoire du monde.'},
 {id:'a8',n:'Coupe d’Hébé',need:{eau:6},eff:{NRG:40},d:'Qui y boit retrouve la vigueur de la jeunesse.'},
 {id:'a9',n:'Ceinture d’Hippolyte',need:{terre:5,feu:5},req:[{t:'rank',v:'or'}],eff:{TRIAL:10,DEF:15},d:'Les armures reconnaissent les cœurs qui la portent.'},
 {id:'a10',n:'Astrolabe d’Hipparque',need:{air:3,eau:3,feu:3,terre:3},eff:{REVEAL:1,XP:5},d:'Les étoiles de chaque recrue se lisent enfin.'}
];
export const ART_BY={};ARTEFACTS.forEach(a=>ART_BY[a.id]=a);
