/* Apparence selon l’origine : peau, cheveux, yeux. */
import { NATS } from './data/countries.js';
import { mulberry32 } from './util.js';

export const SKIN=['#fbe4d4','#f3d0b5','#e4b791','#c98f67','#9a6444','#6b412d'];
export const HAIRC={noir:'#1c1a21',brunfonce:'#3a2620',brun:'#5e3a24',chatain:'#8a5a34',auburn:'#8e3b22',roux:'#b5501f',blond:'#d6ab5f',platine:'#e9dab4'};
export const EYEC={brunfonce:'#3b2416',brun:'#6b4022',noisette:'#8a6a2a',vert:'#3f7a4c',bleu:'#3f78bd',gris:'#7d8c9a'};
export const APPEAR={
 neu:{skin:[0,1],hair:{blond:3,chatain:3,brun:2,roux:.8,platine:.6,noir:.4},eye:{bleu:3,gris:2,vert:2,brun:1}},
 ceu:{skin:[0,1],hair:{roux:2.5,auburn:1.5,chatain:2.5,brun:2,blond:1.2,noir:.5},eye:{bleu:3,vert:2.5,gris:1.5,brun:1}},
 feu:{skin:[0,2],hair:{brun:3,chatain:3,brunfonce:2,noir:1,blond:1.5,auburn:.6,roux:.4},eye:{brun:3,bleu:2,vert:1.5,noisette:1.5,gris:.8}},
 seu:{skin:[1,2],hair:{brunfonce:4,noir:3,brun:2.5,chatain:1,auburn:.3,blond:.3},eye:{brun:4,noisette:2,brunfonce:2,vert:1,bleu:.6}},
 sla:{skin:[0,1],hair:{chatain:3,brun:3,blond:2.5,noir:.8,platine:.5,roux:.3},eye:{bleu:3,gris:2.5,vert:2,brun:1}},
 mena:{skin:[2,3],hair:{noir:4,brunfonce:3.5,brun:1},eye:{brun:3,brunfonce:3,noisette:1.5,vert:.6}},
 cauc:{skin:[1,2],hair:{noir:3,brunfonce:3,brun:1.5},eye:{brun:3,noisette:1.5,vert:1,brunfonce:2}},
 afr:{skin:[4,5],hair:{noir:5,brunfonce:1},eye:{brunfonce:4,brun:1.5},curly:1},
 sas:{skin:[3,4],hair:{noir:5,brunfonce:1.5},eye:{brunfonce:3,brun:2.5}},
 eas:{skin:[1,1],hair:{noir:4,brunfonce:2},eye:{brunfonce:4,brun:1.5},mono:1},
 sea:{skin:[2,3],hair:{noir:5,brunfonce:1},eye:{brunfonce:3,brun:2},mono:.5},
 pac:{skin:[3,4],hair:{noir:4,brunfonce:2},eye:{brunfonce:3,brun:2},wavy:1},
 cas:{skin:[1,2],hair:{noir:4,brunfonce:2},eye:{brunfonce:3,brun:2},mono:.6},
 lat:{skin:[1,4],hair:{noir:3.5,brunfonce:3,brun:1.5},eye:{brun:3,brunfonce:2.5,noisette:1.2,vert:.4}}
};
export const ZONE_APPEAR={gr:'seu',it:'seu',es:'seu',pt:'seu',fr:'feu',de:'neu',no:'neu',en:'neu',ce:'ceu',sl:'sla',ba:'seu',ro:'seu',hu:'sla',fi:'neu',bt:'neu',tr:'mena',ar:'mena',fa:'mena',ca:'cauc',he:'mena',ea:'afr',wa:'afr',sa:'afr',in:'sas',cn:'eas',jp:'eas',kr:'eas',se:'sea',pa:'pac',ct:'cas',la:'lat'};
export const NAT_APPEAR={'Angola':'afr','Mozambique':'afr','Cap-Vert':'afr','Guinée-Bissau':'afr','São Tomé-et-Principe':'afr','Brésil':'lat','Timor oriental':'sea','Jamaïque':'afr','Barbade':'afr','Bahamas':'afr','Trinité-et-Tobago':'afr','Antigua-et-Barbuda':'afr','Saint-Kitts-et-Nevis':'afr','Sainte-Lucie':'afr','Saint-Vincent-et-les-Grenadines':'afr','Grenade':'afr','Dominique':'afr','Guyana':'afr','Haïti':'afr','Seychelles':'afr','Comores':'afr','Soudan':'afr','Mauritanie':'afr','Suriname':'lat','Singapour':'eas','Madagascar':'sea','Maurice':'sas'};
export function wpick(r,o){let t=0;for(const k in o)t+=o[k];let x=r()*t;for(const k in o){x-=o[k];if(x<=0)return k;}return Object.keys(o)[0];}
export function appearOf(p){const N=NATS[p.nat]||NATS['Grèce'];return APPEAR[NAT_APPEAR[N.n]||ZONE_APPEAR[N.z]||'seu'];}
export function looks(p){
 const r=mulberry32((p.seed^0x2f6b1d)>>>0);const A=appearOf(p);
 const si=A.skin[0]+Math.floor(r()*(A.skin[1]-A.skin[0]+1));
 const hk=wpick(r,A.hair),ek=wpick(r,A.eye);
 return{r,skin:SKIN[si],si,hair:HAIRC[hk],hk,eye:EYEC[ek],curly:A.curly?r()<.85:false,wavy:!!A.wavy,mono:A.mono?r()<A.mono:false,
  tattoo:r()<.22,earring:r()<(p.sex==='F'?.55:.18),smile:r()<.3,fierce:r()<.35,style:r()};
}
