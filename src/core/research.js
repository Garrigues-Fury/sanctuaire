/* Recherche à la bibliothèque (demandée par Seba le 2026-10-25) : les chercheurs retrouvent peu à peu des savoirs
   perdus pendant la guerre sainte. Chaque savoir retrouvé améliore l'apprentissage et la transmission des compétences. */
import { ql } from './data/traits.js';
import { jobF } from './schedule.js';
import { S, log } from './state.js';

// Les savoirs perdus, dans l'ordre où on les retrouve.
export const LORE=['Les tablettes du premier Grand Pope','Le traité des sept sens','Les carnets des maîtres d’armes','L’atlas des quatre-vingt-huit constellations',
 'Les chants de la guerre des Titans','Le codex des techniques oubliées','Le registre des armures et de leurs porteurs','Le livre des éléments',
 'Les lettres d’Athéna à ses chevaliers','Le testament du dernier Grand Pope'];
export const LORE_BONUS=.05;
// Heures de recherche à plein temps pour retrouver le savoir n (de plus en plus long).
export const loreNeed=n=>Math.round(30*Math.pow(n,1.5));
export function loreLevel(){return(S&&S.lore&&S.lore.lv)||0;}
// Bonus d'apprentissage et de transmission des compétences : +5 % par savoir retrouvé.
export function loreMult(){return 1+LORE_BONUS*loreLevel();}
// Effort de recherche par heure : chercheurs à leur métier, leur niveau, studieux, et la bibliothèque.
export function researchRate(){
 if(!(S.b&&S.b.biblio>0))return 0;
 return S.knights.filter(k=>k.role==='biblio').reduce((t,k)=>t+jobF(k)*(1+k.lv/20)*(1+.25*ql(k,'studieux')),0)*(1+.1*S.b.biblio);
}
export function tickResearch(h,sum){
 const r=researchRate();if(r<=0)return;
 S.lore=S.lore||{lv:0,pts:0};if(S.lore.lv>=LORE.length)return;
 S.lore.pts+=r*h;
 while(S.lore.lv<LORE.length&&S.lore.pts>=loreNeed(S.lore.lv+1)){S.lore.pts-=loreNeed(S.lore.lv+1);S.lore.lv++;
  const m='Les chercheurs retrouvent un savoir perdu : « '+LORE[S.lore.lv-1]+' ». Apprentissage et transmission des compétences +'+Math.round(LORE_BONUS*100*S.lore.lv)+' %.';
  log(m);sum&&sum.ev.push(m);S._dirty=true;}
}
