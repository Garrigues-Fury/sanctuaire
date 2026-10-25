/* Programme d'entraînement : le temps d'entraînement se répartit en 6 parts (total 100 %).
   Physique, rapidité, dextérité, endurance : leur statistique. Méditation : cosmos, psychokinésie et énergie.
   Études : l'XP. Chaque part fait aussi découvrir ses familles de compétences. */
import { ql } from './data/traits.js';
import { apTrainF, plan, rebalance, selfF, timeMult } from './schedule.js';
import { S } from './state.js';

export const STAT_KEYS=['fo','vi','de','en','ps','co'];
// Les 6 parts du programme (revues par Seba le 2026-10-25) : chacune fait monter ses statistiques
// et fait découvrir plus vite ses familles de compétences.
export const PROG=[
 {k:'phy',n:'Physique',gain:'force',st:{fo:1},fam:['phy','cor']},
 {k:'rap',n:'Rapidité',gain:'vitesse',st:{vi:1},fam:['vit']},
 {k:'dex',n:'Dextérité',gain:'dextérité',st:{de:1},fam:['art','ctl']},
 {k:'end',n:'Endurance',gain:'endurance',st:{en:1},fam:['def']},
 {k:'med',n:'Méditation',gain:'cosmos et psychokinésie',st:{co:.5,ps:.5},fam:['psy','ele','pro']},
 {k:'etu',n:'Études',gain:'XP',st:{},fam:['men']}];
// Les 8 fondamentales, chacune rattachée à une part.
export const FUND_PART={F1:'med',F2:'med',F3:'phy',F4:'dex',F5:'med',F6:'dex',F7:'end',F8:'etu'};
const FAM_PART={};PROG.forEach(x=>x.fam.forEach(fm=>FAM_PART[fm]=x.k));
export const PROG_DEF={phy:20,rap:15,dex:15,end:15,med:25,etu:10};
// Programme d'un personnage ; les anciens programmes en 8 parts sont convertis.
export function prog(p){
 if(!p.tr)p.tr=Object.assign({},PROG_DEF);
 else if(p.tr.phy==null){const o=p.tr;p.tr={phy:o.fo||0,rap:o.vi||0,dex:o.de||0,end:o.en||0,med:(o.med||0)+(o.ps||0)+(o.co||0),etu:o.etu||0};
  const sum=Object.values(p.tr).reduce((x,y)=>x+y,0);if(sum!==100)p.tr=Object.assign({},PROG_DEF);}
 return p.tr;
}
export function setProg(p,key,v){return rebalance(prog(p),key,v);}
// La part du programme qui nourrit une compétence (0 à 1).
export function partOf(s){return s.fam==='fond'?FUND_PART[s.id]:FAM_PART[s.fam];}
export function partShare(p,s){const k=partOf(s);return k?(prog(p)[k]||0)/100:1/6;}
// Découverte : ×1 pour une part moyenne (1/6), jusqu'à ×4 si tout le programme y est consacré, ×0,4 sans rien.
export function discoverMult(p,s){return .4+3.6*partShare(p,s);}
// Personnages d'avant la v0.8 : dextérité et psychokinésie tirées de leurs autres statistiques.
export function ensureStats(p){
 const s=p.st;if(s.de==null)s.de=Math.round((s.fo+s.vi)/2);if(s.ps==null)s.ps=Math.round((s.co+s.en)/2);prog(p);
}
// Heures d'entraînement « pleines » par heure de jeu, selon l'emploi du temps.
export function trainTime(p){
 if(S.knights.includes(p))return selfF(p);
 if(S.aps.includes(p))return apTrainF(p)*timeMult(p);
 return .6*timeMult(p);
}
// Points de statistique gagnés par heure d'entraînement plein (les apprentis apprennent plus vite).
const BASE_PPH=p=>S.aps.includes(p)?1/10:1/12;
export function statPerHour(p,mult=1){return BASE_PPH(p)*trainTime(p)*mult;}
// Avance l'entraînement de h heures. mult : bonus de l'arène.
export function trainStats(p,h,mult){
 const t=prog(p),r=statPerHour(p,mult)*h;if(r<=0)return;
 const acc=p.tacc||(p.tacc={});
 PROG.forEach(x=>{for(const k in x.st)acc[k]=(acc[k]||0)+r*(t[x.k]||0)/100*x.st[k];});
 STAT_KEYS.forEach(k=>{while(acc[k]>=1){acc[k]--;p.st[k]=(p.st[k]||0)+1;S._dirty=true;}});
}
// Gain par jour de chaque part, pour l'affichage.
export function perDay(p,mult){const r=statPerHour(p,mult)*24,t=prog(p),o={};STAT_KEYS.forEach(k=>o[k]=0);PROG.forEach(x=>{for(const k in x.st)o[k]+=r*(t[x.k]||0)/100*x.st[k];});return o;}
// La méditation recharge l'énergie plus vite ; les études accélèrent la progression.
export function medMult(p){return 1+.5*prog(p).med/100;}
export function studyMult(p){return 1+.6*prog(p).etu/100*(1+.5*ql(p,'studieux'));}
// À l'ouverture d'une sauvegarde : emploi du temps, nouvelles statistiques et programme pour tous.
export function ensureSchedules(){S.knights.concat(S.aps).forEach(plan);S.knights.concat(S.aps,S.guards||[]).forEach(ensureStats);}
