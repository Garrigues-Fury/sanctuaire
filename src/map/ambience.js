/* Lumière du jour et de la nuit sur la carte.
   En temps normal, on suit l'heure réelle du téléphone. En mode test ×60, on suit l'heure du jeu
   (une journée complète défile alors en 24 minutes). */

// Repères de la journée : heure → voile de couleur posé sur la carte (couleur, opacité) et intensité des lumières.
const KEYS=[
 [0,0x0a1030,.55,1],[5,0x0a1030,.5,1],[6.5,0x5a2f66,.28,.5],[8,0xfff2d0,.0,0],
 [17,0xfff2d0,.0,0],[19,0xff7a30,.16,.15],[20.5,0x2a1840,.38,.7],[22,0x0a1030,.55,1],[24,0x0a1030,.55,1]
];
const lerp=(a,b,t)=>a+(b-a)*t;
function lerpColor(a,b,t){return(Math.round(lerp(a>>16,b>>16,t))<<16)|(Math.round(lerp(a>>8&255,b>>8&255,t))<<8)|Math.round(lerp(a&255,b&255,t));}

export function hourOf(S,now=Date.now()){
 if(S.speed===1){const d=new Date(now);return d.getHours()+d.getMinutes()/60;}
 const d=new Date(S.created);return((d.getHours()+d.getMinutes()/60+S.gt)%24+24)%24;
}
// Renvoie le voile à appliquer et l'intensité des lumières (0 en plein jour, 1 en pleine nuit).
export function skyAt(h){
 h=((h%24)+24)%24;
 for(let i=0;i<KEYS.length-1;i++){const [h0,c0,a0,l0]=KEYS[i],[h1,c1,a1,l1]=KEYS[i+1];
  if(h>=h0&&h<=h1){const t=(h-h0)/(h1-h0);return{color:lerpColor(c0,c1,t),alpha:lerp(a0,a1,t),lights:lerp(l0,l1,t)};}}
 return{color:KEYS[0][1],alpha:KEYS[0][2],lights:1};
}
export function phaseName(h){h=((h%24)+24)%24;return h<5?'nuit':h<8?'aube':h<17?'jour':h<20.5?'crépuscule':'nuit';}
