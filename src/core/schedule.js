/* Emploi du temps des personnages (demandé par Seba le 2026-10-24).
   Chevalier : métier, formation de ses disciples, entraînement personnel, en % (total 100).
   Apprenti en renfort sur un site : entraînement et aide au Sanctuaire.
   Le goût de l'effort ou la paresse change le rendement de ce temps. */
import { fl, ql } from './data/traits.js';
import { S } from './state.js';

export const KPLAN=[{k:'job',n:'Métier'},{k:'dis',n:'Former ses disciples'},{k:'self',n:'Entraînement personnel'}];
export const APLAN=[{k:'train',n:'Entraînement'},{k:'help',n:'Aide au Sanctuaire'}];
const isAp=p=>S.aps.includes(p);
// Emploi du temps d'un personnage (créé à la première lecture ; reprend l'ancien rôle « Maître »).
export function plan(p){
 if(p.role==='maitre'){p.role=null;p.tm={job:0,dis:50,self:50};}
 if(!p.tm)p.tm=isAp(p)?{train:50,help:50}:p.role?{job:100,dis:0,self:0}:{job:0,dis:0,self:100};
 return p.tm;
}
// Rendement du temps : 1 = normal.
export function timeMult(p){return 1+.06*ql(p,'travailleur')+.03*ql(p,'perseverant')-.06*fl(p,'paresseux');}
export function timeWhy(p){const w=[];if(ql(p,'travailleur'))w.push('travailleur');if(ql(p,'perseverant'))w.push('persévérant');if(fl(p,'paresseux'))w.push('paresseux');return w;}
// Part de l'effet plein du métier (1 = métier à 100 %).
export function jobF(k){return k.role?plan(k).job/100*timeMult(k):0;}
// Qualité de la formation donnée aux disciples (1 = à 50 % du temps, jusqu'à 1,5).
export function teachF(k){return Math.min(1.5,plan(k).dis/50)*timeMult(k);}
// Vitesse de sa propre progression (1 = tout son temps à s'entraîner).
export function selfF(k){return(.3+.7*plan(k).self/100)*timeMult(k);}
export function isMaster(k){return !isAp(k)&&plan(k).dis>0;}
// Apprenti : part de formation et part de travail sur le site (1 = comme avant, à 50/50).
export function apTrainF(a){return a.job?.1+.9*plan(a).train/100:1;}
export function apHelpF(a){return a.job?plan(a).help/50*timeMult(a):0;}
// Fixe une part et répartit le reste entre les autres, au prorata (par pas de 5 %).
export function setShare(p,key,v,locked){
 const tm=plan(p),keys=Object.keys(tm),others=keys.filter(x=>x!==key&&!(locked||[]).includes(x));
 if(!others.length)return tm;
 v=Math.max(0,Math.min(100,Math.round(v/5)*5));
 const fixed=keys.filter(x=>x!==key&&!others.includes(x)).reduce((s,x)=>s+tm[x],0);
 v=Math.min(v,100-fixed);tm[key]=v;
 let rest=100-fixed-v;const cur=others.reduce((s,x)=>s+tm[x],0);
 others.forEach((x,i)=>{if(i===others.length-1){tm[x]=rest;return;}const n=Math.round((cur?tm[x]/cur:1/others.length)*(100-fixed-v)/5)*5;tm[x]=Math.min(rest,n);rest-=tm[x];});
 return tm;
}
