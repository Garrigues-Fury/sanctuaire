/* Défis physiques réels (demandés par Seba le 2026-10-27 : « rendre le joueur meilleur »).
   - Sorties VTT et course : validées en important le fichier GPX de la sortie (exporté de l'appli de sport).
   - Pompes, gainage, corde à sauter : déclarés sur l'honneur.
   - 10 paliers progressifs par défi, un palier par jour au plus (le repos fait partie de l'entraînement).
   Niveaux de départ réglés avec Seba : VTT 25, 30 puis 35 km ; pompes en séries, de 1 × 10 jusqu'à 100 au total. */
export const DEFI_TYPES={
 velo:{n:'Sortie VTT',gpx:true,unit:'km',st:['en','vi'],steps:[25,25,25,30,30,30,35,35,35,35]},
 course:{n:'Course à pied',gpx:true,unit:'km',st:['vi','en'],steps:[6,6,7,7,8,8,9,10,10,10]},
 pompes:{n:'Pompes',unit:'pompes',st:['fo','en'],steps:[[1,10],[2,10],[3,10],[4,10],[5,10],[5,12],[5,15],[6,15],[5,20],[4,25]]},
 gainage:{n:'Gainage',unit:'s',st:['en','fo'],steps:[[1,45],[1,60],[1,75],[1,90],[2,60],[2,75],[2,90],[3,75],[3,90],[2,120]]},
 corde:{n:'Corde à sauter',unit:'sauts',st:['vi','de'],steps:[[1,100],[1,150],[1,200],[1,250],[1,300],[2,200],[2,250],[3,200],[2,300],[3,300]]}
};
// Les constellations dont l'épreuve est un défi physique.
export const DEFI_OF_CONS={cocher:'velo',voiles:'velo','petit-cheval':'course','chiens-chasse':'course',hercule:'pompes','grande-ourse':'pompes',ecu:'gainage',table:'gainage',lievre:'corde',dauphin:'corde'};
export const DEFI_REST_H=20;
export function stepText(type,i){
 const T=DEFI_TYPES[type],s=T.steps[i];if(s==null)return'';
 if(T.gpx)return'une sortie de '+s+' km au moins';
 const [n,x]=s,u=type==='gainage'?(x>=60&&x%60===0?(x/60)+' min':x+' s'):x+' '+T.unit;
 return n>1?n+' séries de '+u+(type==='pompes'?' ('+n*x+' au total)':''):u+(type==='gainage'?' de planche':' d’affilée');
}
