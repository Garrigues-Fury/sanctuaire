/* Épreuves des chevaliers (demandées par Seba le 2026-10-27) : chaque constellation a la sienne.
   - Un mini-jeu de 20 niveaux (data/minigames.js), qui s'ouvre quand l'armure a un porteur ;
   - ou un défi physique réel de 10 paliers (data/defis.js), ouvert à tout moment : c'est le joueur qui l'accomplit.
   (Les objectifs du début ont été remplacés par des jeux, à la demande de Seba. D'autres objectifs viendront avec
   les ennemis des autres panthéons.)
   Une épreuve finie à 100 % l'est pour toujours : bonus permanent au Sanctuaire (recomputeCB) et carte dorée. */
import { CONS } from './data/world.js';
import { MG_LEVELS, bonusText, epBonus, gameOf } from './data/minigames.js';
import { DEFI_OF_CONS, DEFI_TYPES } from './data/defis.js';
import { defiProgress } from './defis.js';
import { S, emit, log } from './state.js';

export function epreuveOf(c){const t=DEFI_OF_CONS[c.k];return t?{type:'defi',defi:t,T:DEFI_TYPES[t]}:{type:'jeu',game:gameOf(c.k)};}
export function bearerOf(c){return S.knights.find(k=>k.cons===c.k)||null;}
export const isDone=k=>(S.epDone||[]).includes(k);
// Avancement de 0 à 1.
export function progressOf(c){
 if(isDone(c.k))return 1;
 const e=epreuveOf(c);
 return e.type==='defi'?defiProgress(c.k):((S.mg&&S.mg[c.k]&&S.mg[c.k].done)||0)/MG_LEVELS;
}
// Vérifie les épreuves finies (une fois par heure de jeu suffit). Renvoie vrai si une épreuve vient d'être finie.
export function tickEpreuves(sum){
 S.epAcc=(S.epAcc||0);if(S.gt<S.epAcc)return false;S.epAcc=S.gt+1;
 return checkEpreuves(sum);
}
export function checkEpreuves(sum){
 if(!S.epDone)S.epDone=[];let any=false;
 CONS.forEach(c=>{if(isDone(c.k))return;if(progressOf(c)>=1){S.epDone.push(c.k);any=true;
  const p=bearerOf(c),m='Épreuve de '+c.n+' accomplie'+(p?' ('+p.name+')':'')+' : '+bonusText(epBonus(c.k))+' pour tout le Sanctuaire.';
  log(m);sum?sum.ev.push(m):emit('milestone');}});
 if(any)S._dirty=true;return any;
}
// Le palmarès d'un porteur pour sa carte de collection.
export function cardStats(p){return p?{lv:p.lv,mw:(p.rec&&p.rec.mw)||0,w:(p.rec&&p.rec.w)||0,l:(p.rec&&p.rec.l)||0}:null;}
// Cartes visibles : une armure portée un jour, ou une épreuve finie.
export function seenCons(){if(!S.seenCons)S.seenCons=[];S.knights.forEach(k=>{if(k.cons&&!S.seenCons.includes(k.cons))S.seenCons.push(k.cons);});return S.seenCons;}
