/* Entraînement automatique de la nuit (demandé par Seba le 2026-10-27).
   Chaque jour à 2 h du matin (heure du téléphone), l'énergie que personne n'a dépensée sert à s'entraîner :
   d'abord avec les partenaires choisis, dans l'ordre, puis seul avec la séance choisie. Rien n'est perdu
   les jours où le joueur n'a pas le temps. En mode test (×60), la nuit revient toutes les 24 h de jeu. */
import { PAIR_E, TRAININGS, canTrain, kindOf, train, trainTogether, unavailable } from './training.js';
import { compat } from './social.js';
import { byId, people } from './rules.js';
import { S, log } from './state.js';
import { isAway, isKO } from './wounds.js';

export const AUTO_HOUR=2;
// Séances qu'on peut choisir pour l'entraînement seul (celles qui ne consomment aucun objet).
export const soloKeys=()=>TRAININGS.filter(t=>!t.item&&!t.savoir).map(t=>t.k);

// Réglages d'un personnage, créés à la première lecture. Un apprenti s'entraîne d'abord avec son maître.
// « maitre » et « disciples » désignent toujours le maître ou les disciples du moment.
export function autoOf(p){
 if(!p.auto)p.auto={on:true,partners:[kindOf(p)==='a'?'maitre':'disciples'],solo:'libre',keep:0};
 return p.auto;
}
export function resolvePartners(p){
 const out=[];(autoOf(p).partners||[]).forEach(x=>{
  if(x==='maitre'){const m=p.master!=null&&byId(p.master);if(m)out.push(m);}
  else if(x==='disciples')S.aps.filter(a=>a.master===p.id).forEach(a=>out.push(a));
  else{const q=byId(x);if(q)out.push(q);}});
 return out.filter((q,i)=>q.id!==p.id&&out.indexOf(q)===i);
}
// Heures de jeu jusqu'à la prochaine nuit, à partir d'une heure réelle donnée.
export function hoursToNight(ms){const d=new Date(ms),h=d.getHours()+d.getMinutes()/60+d.getSeconds()/3600;let x=(AUTO_HOUR-h+24)%24;return x<1e-6?24:x;}
// Place la prochaine nuit dans le temps du jeu (à l'ouverture, et quand on change la vitesse du temps).
export function ensureAuto(force){if(S.autoAt==null||force)S.autoAt=S.gt+(S.speed===1?hoursToNight(S.lastReal||Date.now()):24);}

// Dépense l'énergie d'un personnage ; renvoie {duo, solo, notes}.
export function spendNight(p){
 const A=autoOf(p),out={duo:0,solo:0,notes:[]};if(!A.on||isKO(p)||isAway(p))return out;
 const room=()=>p.nrg-(A.keep||0);
 let guard=0;
 // avec ses partenaires, dans l'ordre choisi
 for(const q of resolvePartners(p)){
  // le partenaire aussi garde sa réserve, et on ne puise pas dans l'énergie d'un personnage réglé sur « désactivé »
  const qa=autoOf(q);
  while(room()>=PAIR_E&&qa.on&&q.nrg-(qa.keep||0)>=PAIR_E&&!unavailable(q)&&guard++<12){
   const r=trainTogether(p,q,compat(p,q).v);if(!r.ok)break;out.duo++;
   if(/devient|découvre/.test(r.msg))out.notes.push(r.msg.slice(r.msg.indexOf('.')+2));
  }
 }
 // puis seul
 const t=TRAININGS.find(x=>x.k===A.solo)||TRAININGS.find(x=>x.k==='libre');
 while(room()>=t.e&&canTrain(p,t)&&guard++<30){train(p,t.k);out.solo++;}
 return out;
}
// La nuit : tout le monde, chevaliers d'abord (ils accueillent leurs disciples), puis apprentis et gardes.
export function runNight(sum){
 let duo=0,solo=0,who=0;const notes=[];
 S.knights.concat(S.aps,S.guards||[]).forEach(p=>{const r=spendNight(p);if(r.duo||r.solo)who++;duo+=r.duo;solo+=r.solo;notes.push(...r.notes);});
 if(!duo&&!solo)return;
 const m='Entraînements de la nuit : '+who+' personne'+(who>1?'s':'')+', '+duo+' séance'+(duo>1?'s':'')+' à deux, '+solo+' seul'+(solo>1?'es':'')+'.';
 log(m);sum&&sum.ev.push(m);notes.slice(0,4).forEach(n=>{log(n);sum&&sum.ev.push(n);});S._dirty=true;
}
// Appelé à chaque pas de temps par rules.js.
export function tickAuto(sum){ensureAuto();while(S.gt>=S.autoAt){S.autoAt+=24;runNight(sum);}}
// Partenaires possibles pour la liste (mêmes règles que l'entraînement à deux).
export function autoCandidates(p){
 const k=kindOf(p);
 return(k==='a'?S.aps.filter(x=>x.id!==p.id).concat(S.knights):S.knights.concat(S.guards||[]).filter(x=>x.id!==p.id).concat(S.aps)).filter(q=>q.id!==p.id);
}
export function allAuto(){people().forEach(autoOf);}
