/* Blessures (demandées par Seba le 2026-10-27) : un chevalier ou un garde vaincu est mis hors de combat
   et soigné par les équipes médicales du Sanctuaire. Pendant ce temps il ne s'entraîne pas, ne part pas en mission
   et ne défend pas. Les soins vont plus vite avec des médecins (métier), des gardes postés à l'infirmerie,
   et la compétence « Soins par le cosmos ». Pas de mort ici : elle n'arrivera que sur une mission risquée
   lancée par le joueur, avec un avertissement (décision de Seba du 2026-10-24). */
import { careF } from './medicine.js';
import { hasSkill } from './skills.js';
import { S, log } from './state.js';

export const HEAL_BASE=36;
export const isKO=p=>!!(p&&p.ko&&p.ko>S.gt);
export const isAway=p=>!!(p&&p.away&&p.away>S.gt);
// Force des soins : médecins à leur métier, gardes de l'infirmerie (deux fois plus s'ils savent soigner par le cosmos).
export function healers(){return(S.guards||[]).filter(g=>g.post==='infirmerie'&&!isKO(g));}
export function healPower(){
 let f=careF();healers().forEach(g=>f+=hasSkill(g,'guerison')?.6:.3);
 S.knights.filter(k=>k.role==='medecin'&&hasSkill(k,'guerison')).forEach(()=>f+=.3);
 return f;
}
export function healHours(sev=1){return Math.round(HEAL_BASE*sev/(1+healPower()));}
export function wound(p,sev=1){const h=healHours(sev);p.ko=Math.max(p.ko||0,S.gt+h);p.koLog=true;return h;}
// Retour de l'infirmerie, une ligne dans la chronique.
export function tickWounds(sum){
 S.knights.concat(S.guards||[]).forEach(p=>{if(p.koLog&&!isKO(p)){p.koLog=false;const m=p.name+' quitte l’infirmerie, remis'+(p.sex==='F'?'e':'')+' sur pied.';log(m);sum&&sum.ev.push(m);S._dirty=true;}});
}
