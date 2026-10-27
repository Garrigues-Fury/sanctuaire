/* Règles des défis physiques (data/defis.js). Rien ne quitte le téléphone : le fichier GPX est lu sur place.
   - Un défi ne s'ouvre que quand un chevalier porte l'armure.
   - Un palier validé rapporte des heures d'entraînement à la réserve et des statistiques au porteur de l'armure,
     sans la limite par jour des mini-jeux : c'est un vrai effort.
   - Une même sortie GPX ne compte qu'une fois. */
import { CONS_BY } from './data/world.js';
import { DEFI_OF_CONS, DEFI_REST_H, DEFI_TYPES, stepText } from './data/defis.js';
import { gainStat } from './scale.js';
import { S, log } from './state.js';

export function ensureDefis(){if(!S.defis)S.defis={};if(!S.gpxUsed)S.gpxUsed=[];if(S.xpPool==null)S.xpPool=0;return S.defis;}
export function defiOf(consK){ensureDefis();return S.defis[consK]||(S.defis[consK]={done:0,last:0});}
export function defiType(consK){return DEFI_OF_CONS[consK]||null;}
// Comme les mini-jeux, un défi ne s'ouvre que quand un chevalier porte l'armure (choix de Seba du 2026-10-28).
export function defiOpen(consK){return!!S.knights.find(k=>k.cons===consK);}
// Le prochain palier, et quand il sera ouvert (repos de 20 h entre deux paliers, en temps réel).
export function nextStep(consK,now=Date.now()){
 const t=defiType(consK),d=defiOf(consK),T=DEFI_TYPES[t];if(!T||d.done>=T.steps.length)return null;
 const readyAt=d.last?d.last+DEFI_REST_H*3600e3:0;
 return{i:d.done,target:T.steps[d.done],text:stepText(t,d.done),ready:now>=readyAt,readyAt};
}
function reward(consK,out){
 const d=defiOf(consK),T=DEFI_TYPES[defiType(consK)],h=6+d.done;
 S.xpPool=Math.round((S.xpPool+h)*10)/10;out.push('+'+h+' h d’entraînement dans la réserve');
 const b=S.knights.find(k=>k.cons===consK);
 if(b)T.st.forEach(s=>{const v0=b.st[s]||0;gainStat(b,s,2);out.push(b.name+' : +'+Math.round((b.st[s]||0)-v0)+' '+({fo:'force',vi:'vitesse',de:'dextérité',en:'endurance'})[s]);});
}
function validate(consK,now,out,what){
 const d=defiOf(consK);d.done++;d.last=now;reward(consK,out);
 const c=CONS_BY[consK],T=DEFI_TYPES[defiType(consK)];
 log('Défi '+T.n.toLowerCase()+' ('+c.n+') : palier '+d.done+' sur '+T.steps.length+' réussi'+(what?' ('+what+')':'')+'. Bravo.');
 if(d.done>=T.steps.length)out.push('Défi terminé : les 10 paliers sont réussis !');
 S._dirty=true;return out;
}
// Pompes, gainage, corde : sur l'honneur.
export function validateHonor(consK,now=Date.now()){
 const t=defiType(consK),st=nextStep(consK,now);if(!t||!st||!st.ready||DEFI_TYPES[t].gpx||!defiOpen(consK))return null;
 return validate(consK,now,[],st.text);
}
// VTT et course : une trace GPX déjà lue (gpxSummary) ; la distance doit atteindre le palier.
export function validateGpx(consK,g,now=Date.now()){
 const t=defiType(consK),st=nextStep(consK,now);
 if(!t||!st||!DEFI_TYPES[t].gpx)return{ok:false,why:'Ce défi ne se valide pas par un fichier GPX.'};
 if(!defiOpen(consK))return{ok:false,why:'Ce défi s’ouvrira quand un chevalier portera cette armure.'};
 if(!st.ready)return{ok:false,why:'Repos : le prochain palier s’ouvrira plus tard.'};
 if(!g||!g.km)return{ok:false,why:'Aucun parcours lisible dans ce fichier.'};
 if(S.gpxUsed.includes(g.sig))return{ok:false,why:'Cette sortie a déjà été comptée.'};
 if(g.km<st.target)return{ok:false,why:'Sortie de '+g.km.toFixed(1)+' km : il en faut '+st.target+'.'};
 S.gpxUsed.push(g.sig);
 return{ok:true,out:validate(consK,now,[],g.km.toFixed(1)+' km'+(g.dplus?', '+Math.round(g.dplus)+' m de dénivelé':''))};
}

/* ---------- lecture d'un fichier GPX ---------- */
const R=6371;
function hav(a,b){const t=x=>x*Math.PI/180,dLa=t(b.lat-a.lat),dLo=t(b.lon-a.lon),h=Math.sin(dLa/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(h));}
// Distance (km), dénivelé positif (m), date de départ et une signature pour ne pas compter deux fois la même sortie.
export function gpxSummary(text){
 const pts=[],re=/<(?:trkpt|rtept)\b([^>]*)>([\s\S]*?)<\/(?:trkpt|rtept)>|<(?:trkpt|rtept)\b([^>]*)\/>/g;let m;
 while((m=re.exec(text))){const at=m[1]||m[3]||'',body=m[2]||'';const la=/lat="([-\d.]+)"/.exec(at),lo=/lon="([-\d.]+)"/.exec(at);if(!la||!lo)continue;
  const el=/<ele>([-\d.]+)<\/ele>/.exec(body),tm=/<time>([^<]+)<\/time>/.exec(body);pts.push({lat:+la[1],lon:+lo[1],ele:el?+el[1]:null,t:tm?tm[1]:null});}
 if(pts.length<2)return null;
 let km=0,dplus=0;for(let i=1;i<pts.length;i++){const d=hav(pts[i-1],pts[i]);if(d<5)km+=d;const e0=pts[i-1].ele,e1=pts[i].ele;if(e0!=null&&e1!=null&&e1>e0)dplus+=e1-e0;}
 const start=pts.find(p=>p.t)?.t||null;
 return{km:Math.round(km*100)/100,dplus,start,points:pts.length,sig:(start||'')+'|'+pts[0].lat.toFixed(4)+','+pts[0].lon.toFixed(4)+'|'+Math.round(km*10)};
}
export function defiProgress(consK){const t=defiType(consK);return t?defiOf(consK).done/DEFI_TYPES[t].steps.length:0;}
