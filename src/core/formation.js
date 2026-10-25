/* Suivi des formations (demandé par Seba le 2026-10-25).
   Le Maître d'apprentissage (un métier) oriente les apprentis : il révèle jusqu'où chacun peut aller
   et accélère leurs découvertes. Pour chaque armure, on cherche les maîtres capables de guider ses candidats :
   les constellations dont l'armure maîtrise une des compétences exigées (le Verseau pour le froid du Cygne…),
   avec leur porteur actuel s'il existe. */
import { AFF_MIN, armorAffinity } from './armor.js';
import { specReq } from './data/skills.js';
import { CONS, CONS_BY } from './data/world.js';
import { jobF } from './schedule.js';
import { hasSkill } from './skills.js';
import { S } from './state.js';

const RI={bronze:1,argent:2,or:3};
// Force de l'orientation : 0 sans maître d'apprentissage, 1 pour un maître à plein temps.
export function orientF(){return S.knights.filter(k=>k.role==='apprentissage').reduce((t,k)=>t+jobF(k),0);}
export function revealed(){return orientF()>0;}
// Le rang le plus haut qu'un apprenti peut espérer, d'après son potentiel caché.
export function reachOf(p){return p.pot>=93?'or':p.pot>=65?'argent':'bronze';}
// Maîtres capables de guider vers une armure : constellations qui partagent une compétence exigée,
// avec leur porteur s'il existe, puis les chevaliers qui ont appris ces compétences autrement.
export function guidesFor(c){
 const req=specReq(c),out=[];
 CONS.forEach(k=>{if(k.k===c.k)return;const common=specReq(k).filter(id=>req.includes(id));if(!common.length)return;
  out.push({c:k,skills:common,wearer:S.knights.find(x=>x.cons===k.k)||null});});
 S.knights.forEach(x=>{if(x.cons===c.k||out.some(o=>o.wearer===x))return;const common=req.filter(id=>hasSkill(x,id));if(common.length)out.push({c:CONS_BY[x.cons],skills:common,wearer:x,learned:true});});
 return out.sort((a,b)=>(!!b.wearer-!!a.wearer)||b.skills.length-a.skills.length||RI[b.c.rank]-RI[a.c.rank]);
}
// Candidats à une armure : apprentis qui ont assez d'affinité, du plus proche au plus lointain.
export function candidatesFor(c){
 if(S.armors[c.k]==='portee')return[];
 return S.aps.filter(a=>c.rank!=='or'||a.sign===c.sign).map(a=>({a,af:armorAffinity(a,c).v})).filter(x=>x.af>=AFF_MIN[c.rank]).sort((x,y)=>y.af-x.af);
}
// Classement des maîtres possibles pour un apprenti : lien de signe ou d'élément, compétences utiles
// pour l'armure visée, rang et niveau ; et place disponible (3 disciples au plus).
export function mastersFor(ap,target,affinity){
 const req=target?specReq(target):[];
 return S.knights.map(k=>{const n=S.aps.filter(x=>x.master===k.id).length,af=affinity(ap,k),know=req.filter(id=>hasSkill(k,id)).length;
  return{k,n,full:n>=3&&ap.master!==k.id,af,know,score:af.x*2+know+RI[k.rank]*.6+k.lv/40};}).sort((a,b)=>b.score-a.score);
}
