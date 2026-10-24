/* La mappemonde : régions, contours simplifiés des continents, ennemis.
   Coordonnées : x = longitude + 180, y = 90 − latitude (carte de 360 × 180). */
import { NATS } from './countries.js';

export const REGIONS={
 med:{n:'Grèce et Méditerranée',x:200,y:50,bg:['#c9784a','#3a2230']},
 ouest:{n:'Europe de l’Ouest et du Nord',x:187,y:38,bg:['#8a8f9a','#26283a']},
 est:{n:'Europe de l’Est et Caucase',x:218,y:38,bg:['#9a8a7a','#2a2430']},
 orient:{n:'Afrique du Nord et Moyen-Orient',x:220,y:62,bg:['#d6a35a','#3a2418']},
 afrique:{n:'Afrique',x:202,y:90,bg:['#c8803e','#2e1c14']},
 asud:{n:'Asie du Sud',x:258,y:66,bg:['#d08a4a','#331d22']},
 aest:{n:'Asie de l’Est et du Sud-Est',x:295,y:60,bg:['#c86a5a','#251a2e']},
 acentre:{n:'Asie centrale',x:248,y:46,bg:['#b89a6a','#2a2420']},
 ameriques:{n:'Amériques',x:105,y:70,bg:['#b8784a','#231c2c']},
 oceanie:{n:'Océanie',x:322,y:118,bg:['#5aa0b8','#1c2238']}
};
const ZONE_REGION={gr:'med',it:'med',es:'med',pt:'med',ba:'med',ro:'est',fr:'ouest',de:'ouest',no:'ouest',ce:'ouest',fi:'ouest',bt:'ouest',hu:'est',sl:'est',ca:'est',
 tr:'orient',ar:'orient',fa:'orient',he:'orient',wa:'afrique',ea:'afrique',sa:'afrique',in:'asud',cn:'aest',jp:'aest',kr:'aest',se:'aest',ct:'acentre',la:'ameriques',pa:'oceanie',en:'ameriques'};
const NAT_REGION={'Royaume-Uni':'ouest','Irlande':'ouest','Australie':'oceanie','Nouvelle-Zélande':'oceanie','Brésil':'ameriques','Angola':'afrique','Mozambique':'afrique','Cap-Vert':'afrique','Guinée-Bissau':'afrique','São Tomé-et-Principe':'afrique','Timor oriental':'aest',
 'Haïti':'ameriques','Seychelles':'afrique','Suriname':'ameriques','Maurice':'afrique','Comores':'afrique','Turquie':'orient','Azerbaïdjan':'est','Tadjikistan':'acentre','Afghanistan':'acentre','Pays-Bas':'ouest'};
export function regionOf(nat){const N=NATS[nat];if(!N)return'med';return NAT_REGION[nat]||ZONE_REGION[N.z]||'med';}
export function countriesOf(reg){return Object.keys(NATS).filter(n=>regionOf(n)===reg);}

// Contours très simplifiés, en [longitude, latitude].
export const LANDS=[
 [[-165,62],[-160,70],[-140,70],[-120,72],[-95,72],[-80,68],[-65,60],[-55,50],[-66,44],[-75,38],[-81,31],[-80,25],[-84,30],[-90,29],[-97,26],[-97,20],[-90,16],[-83,10],[-79,8],[-84,14],[-92,15],[-105,20],[-112,30],[-117,32],[-124,40],[-125,49],[-135,58],[-150,60]],
 [[-79,8],[-72,12],[-62,10],[-50,0],[-35,-5],[-38,-13],[-40,-22],[-48,-26],[-53,-34],[-58,-38],[-65,-42],[-68,-52],[-72,-50],[-74,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-5],[-80,0],[-77,5]],
 [[-55,60],[-42,60],[-20,70],[-20,80],[-40,83],[-60,82],[-70,78],[-55,70]],
 [[-10,36],[-9,43],[-2,44],[-5,48],[2,51],[5,53],[9,55],[8,57],[5,59],[5,62],[12,66],[20,70],[30,70],[40,67],[60,70],[80,73],[100,77],[120,73],[140,72],[160,70],[175,67],[180,65],[170,60],[160,58],[150,59],[140,54],[142,47],[135,43],[130,42],[126,38],[122,40],[120,35],[122,30],[120,25],[110,21],[108,16],[109,12],[105,9],[103,4],[100,6],[98,10],[98,16],[94,17],[92,22],[88,22],[80,15],[77,8],[73,16],[72,21],[67,24],[57,25],[56,27],[50,30],[48,29],[51,25],[56,24],[58,20],[52,16],[45,13],[43,15],[38,22],[34,28],[35,32],[36,36],[30,36],[27,37],[26,40],[23,38],[22,41],[19,42],[16,38],[13,45],[9,44],[3,43],[0,39],[-2,37],[-6,36]],
 [[-17,15],[-17,21],[-13,28],[-6,35],[10,37],[11,33],[20,31],[32,31],[34,28],[43,12],[51,12],[48,5],[40,-3],[40,-15],[35,-24],[32,-29],[27,-34],[20,-35],[18,-29],[12,-17],[13,-6],[9,-1],[9,4],[5,6],[-5,5],[-12,8]],
 [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[141,-38],[135,-35],[129,-32],[115,-34]],
 [[-5,50],[1,51],[0,53],[-2,56],[-5,58],[-6,56],[-3,54]],[[-10,52],[-6,52],[-6,55],[-10,54]],
 [[130,31],[135,34],[140,36],[142,40],[141,45],[139,42],[136,36],[130,33]],
 [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]],
 [[95,5],[105,-6],[115,-8],[120,-9],[110,-4],[106,2],[98,4]],[[109,1],[117,7],[119,1],[116,-4],[110,-3]],[[131,-1],[141,-3],[150,-10],[143,-9],[138,-8],[132,-4]],
 [[167,-46],[174,-41],[178,-38],[174,-36],[172,-41]],[[12,56],[15,59],[22,65],[28,70],[18,69],[11,63],[6,58]],[[-24,64],[-14,64],[-14,66],[-22,66]]
];
export function landPath(){return LANDS.map(p=>'M'+p.map(([lo,la])=>(lo+180).toFixed(0)+' '+(90-la).toFixed(0)).join('L')+'Z').join('');}

/* Ennemis. el = élément, mult = puissance relative, lines = répliques. */
export const FOES={
 bandits:{n:'Pillards',god:null,el:['terre','feu'],names:['Pillard','Brigand','Écorcheur','Chef pillard'],lines:['Rends-nous les greniers, et personne ne sera blessé… enfin, presque personne.','Un chevalier ? Ici ? On nous avait dit que le Sanctuaire était mort !']},
 ares:{n:'Berserkers d’Arès',god:'ares',el:['feu','terre'],names:['Berserker','Furie sanglante','Porte-hache','Champion d’Arès'],lines:['Arès a soif. Ce village sera sa coupe !','Ta déesse dort, chevalier. Le nôtre, jamais.']},
 eris:{n:'Fidèles d’Éris',god:'eris',el:['air','feu'],names:['Semeur de discorde','Langue d’or','Fanatique','Héraut d’Éris'],lines:['Une pomme d’or a roulé jusqu’ici… et ils s’entretuent déjà pour elle.','Bats-toi, et regarde tes amis se déchirer en ton absence.']},
 artemis:{n:'Satellites d’Artémis',god:'artemis',el:['air','eau'],names:['Chasseresse','Archer d’argent','Traqueur','Satellite lunaire'],lines:['Ces bois appartiennent à la Lune. Les hommes n’y ont rien à faire.','Nos flèches ne manquent jamais leur cible.']},
 hermes:{n:'Ombres d’Hermès',god:'hermes',el:['air','eau'],names:['Voleur ailé','Messager noir','Espion','Ombre d’Hermès'],lines:['Nous ne sommes pas là pour le village. Nous sommes là pour toi.','Le Sanctuaire a des secrets. Hermès les veut tous.']},
 dionysos:{n:'Ménades de Dionysos',god:'dionysos',el:['eau','terre'],names:['Ménade','Satyre ivre','Danseuse folle','Grand Satyre'],lines:['Bois avec nous, chevalier ! Ou meurs sobre…','La fête ne finit jamais. Jamais. JAMAIS.']},
 betes:{n:'Bêtes mythiques',god:null,el:['terre','eau','feu','air'],names:['Loup géant','Sanglier d’Érymanthe','Harpie','Chimère'],lines:['Un grondement sourd monte des collines.','La bête renifle l’air… et tourne la tête vers toi.']}
};
export const FOE_KEYS=Object.keys(FOES);
// Avantage d'élément : le feu bat l'air, l'air bat la terre, la terre bat l'eau, l'eau bat le feu.
export const BEATS={feu:'air',air:'terre',terre:'eau',eau:'feu'};
export function elemMult(att,def){return BEATS[att]===def?1.3:BEATS[def]===att?.8:1;}
