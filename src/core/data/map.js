/* Géométrie de la carte du Sanctuaire (coordonnées 360 × 400). */

export const VW=360,VH=400;
export const SITES={
 carriere:{n:'Carrière',r:[10,184,84,50]},
 biblio:{n:'Bibliothèque',r:[108,188,70,44]},
 dortoirs:{n:'Dortoirs',r:[192,190,62,40]},
 mine:{n:'Mine',r:[268,184,82,50]},
 champs:{n:'Oliveraies',r:[10,250,96,66]},
 arene:{n:'Arène',r:[118,252,84,62]},
 artisans:{n:'Village',r:[214,262,54,52]},
 forge:{n:'Atelier des armures',r:[276,250,74,64]},
 jardin:{n:'Jardin des simples',r:[10,330,104,56]},
 herbo:{n:'Herboristerie',r:[128,332,90,54]},
 atelier:{n:'Artisanat',r:[232,332,118,54]}
};
export const DEPOT=[230,244];
export const HOUSE_PTS=[];for(let i=0;i<12;i++)HOUSE_PTS.push([180+(i%2?1:-1)*(58-i*3.8),166-i*11.6]);
export function rectPt(rc,r){return[rc[0]+8+r()*(rc[2]-16),rc[1]+10+r()*(rc[3]-18)];}
export function guardPt(post,p){const j=(p.id%5)*2-4;if(/^h\d+$/.test(post)){const hp=HOUSE_PTS[+post.slice(1)];return[hp[0]+9+j*.4,hp[1]+1];}if(post==='village'){const rc=SITES.artisans.r;return[rc[0]+rc[2]+2+j,rc[1]+rc[3]-6];}const rc=SITES[post].r;return[rc[0]+rc[2]-6+j,rc[1]+rc[3]-4];}
