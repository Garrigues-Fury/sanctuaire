/* Programme d'entraînement (étape 2 du système « temps, missions, blessures », demandé par Seba le 2026-10-24).
   Le temps d'entraînement d'un personnage se répartit en 8 parts (total 100 %) : chaque part fait monter
   une statistique, sauf la méditation (énergie, et un peu de cosmos) et les études (XP). */
import { ql } from './data/traits.js';
import { apTrainF, plan, rebalance, selfF, timeMult } from './schedule.js';
import { S } from './state.js';

export const STAT_KEYS=['fo','vi','de','en','ps','co'];
export const PROG=[
 {k:'fo',n:'Physique',gain:'force'},{k:'vi',n:'Rapidité',gain:'vitesse'},{k:'de',n:'Dextérité',gain:'dextérité'},
 {k:'en',n:'Endurance',gain:'endurance'},{k:'ps',n:'Psychokinésie',gain:'psychokinésie'},{k:'co',n:'Cosmos',gain:'cosmos'},
 {k:'med',n:'Méditation',gain:'énergie, et un peu de cosmos'},{k:'etu',n:'Études',gain:'XP'}];
export const PROG_DEF={fo:15,vi:15,de:10,en:15,ps:10,co:15,med:10,etu:10};
export function prog(p){if(!p.tr)p.tr=Object.assign({},PROG_DEF);return p.tr;}
export function setProg(p,key,v){return rebalance(prog(p),key,v);}
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
 STAT_KEYS.forEach(k=>{acc[k]=(acc[k]||0)+r*t[k]/100;});
 acc.co+=r*t.med/100*.5;
 STAT_KEYS.forEach(k=>{while(acc[k]>=1){acc[k]--;p.st[k]=(p.st[k]||0)+1;S._dirty=true;}});
}
// Gain par jour de chaque part, pour l'affichage.
export function perDay(p,mult){const r=statPerHour(p,mult)*24,t=prog(p),o={};STAT_KEYS.forEach(k=>o[k]=r*t[k]/100);o.co+=r*t.med/100*.5;return o;}
// La méditation recharge l'énergie plus vite ; les études accélèrent la progression.
export function medMult(p){return 1+.8*prog(p).med/100;}
export function studyMult(p){return 1+.6*prog(p).etu/100*(1+.5*ql(p,'studieux'));}
// À l'ouverture d'une sauvegarde : emploi du temps, nouvelles statistiques et programme pour tous.
export function ensureSchedules(){S.knights.concat(S.aps).forEach(plan);S.knights.concat(S.aps,S.guards||[]).forEach(ensureStats);}
