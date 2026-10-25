/* Médecin (demandé par Seba le 2026-10-25) : soigne les blessés et accélère la récupération ; avec le temps,
   il développe la compétence « Maintien en vie », très longue à apprendre, qui donne à un chevalier grièvement
   blessé de bons espoirs de survie. Les blessures graves et la mort viendront avec les missions risquées
   (étape 4) : cette compétence s'appliquera alors. */
import { ql } from './data/traits.js';
import { jobF } from './schedule.js';
import { S, log } from './state.js';

const medics=()=>S.knights.filter(k=>k.role==='medecin');
// Force des soins : somme des médecins à leur métier (1 = un médecin à plein temps).
export function careF(){return medics().reduce((t,k)=>t+jobF(k)*(1+.2*ql(k,'patient')),0);}
// Récupération : repos après une épreuve plus court (jusqu'à −40 %) et énergie plus vite rechargée (jusqu'à +15 %).
export function restMult(){return 1-.4*Math.min(1,careF());}
export function recoveryMult(){return 1+.15*Math.min(1,careF());}
export function restHours(p){return Math.round((ql(p,'orgueilleux')?24:12)*restMult());}
// Maintien en vie : découvert après 72 h de pratique à plein temps ; niveau selon les heures de pratique (très long).
export const VIE_FOUND=72;
export function vieLevel(p){if(!(p.sk&&p.sk.vie))return 0;return Math.min(10,1+Math.floor(Math.sqrt((p.vieH||0)/36)));}
export function survivalOf(lv){return lv?Math.min(90,20+7*lv):10;}
// Chance de survie d'un chevalier grièvement blessé : le meilleur médecin en poste.
export function survivalChance(){return survivalOf(Math.max(0,...medics().map(vieLevel)));}
export function tickMedicine(h,sum){
 medics().forEach(k=>{const j=jobF(k);if(j<=0)return;k.sk=k.sk||{};k.skx=k.skx||{};k.skp=k.skp||{};
  if(!k.sk.vie){k.skp.vie=(k.skp.vie||0)+h*j;if(k.skp.vie>=VIE_FOUND){k.sk.vie=1;delete k.skp.vie;k.vieH=0;const m=k.name+' découvre une compétence de médecin : Maintien en vie.';log(m);sum&&sum.ev.push(m);S._dirty=true;}return;}
  const before=vieLevel(k);k.vieH=(k.vieH||0)+h*j*(1+.2*ql(k,'patient'));const after=vieLevel(k);
  if(after>before){const m=k.name+' progresse en Maintien en vie (niveau '+after+') : un chevalier grièvement blessé aurait '+survivalOf(after)+' % de chances de survivre.';log(m);sum&&sum.ev.push(m);S._dirty=true;}});
}
