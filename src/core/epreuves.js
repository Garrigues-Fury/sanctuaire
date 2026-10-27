/* Épreuves des chevaliers (demandées par Seba le 2026-10-27) : chaque constellation a la sienne.
   - Un mini-jeu à finir (20 niveaux) quand il en existe un pour elle (data/minigames.js) ;
   - sinon des objectifs à remplir par son porteur : niveau, compétences de l'armure, missions, défense, amitié,
     maison relevée pour l'or. (Les quêtes d'histoire écrites viendront s'ajouter.)
   Une épreuve finie à 100 % l'est pour toujours : bonus permanent au Sanctuaire (recomputeCB) et carte dorée
   dans la collection. */
import { CONS, CONS_BY } from './data/world.js';
import { specReq } from './data/skills.js';
import { GAME_OF_CONS, MG_LEVELS, bonusText, epBonus } from './data/minigames.js';
import { skillLevel } from './skills.js';
import { S, emit, log } from './state.js';
import { clamp } from './util.js';

const hash=s=>{let h=11;for(const ch of s)h=(h*33+ch.charCodeAt(0))>>>0;return h;};
const T={bronze:0,argent:1,or:2};
const fk=(a,b)=>a<b?a+'-'+b:b+'-'+a;
// Les objectifs d'une constellation : toujours le niveau et les compétences de l'armure, plus un troisième selon elle.
export function objectivesOf(c){
 const t=T[c.rank],o=[{k:'lv',n:[30,45,60][t],t:'Atteindre le niveau '+[30,45,60][t]},{k:'skill',n:[15,20,25][t],t:'Porter les compétences de son armure au niveau '+[15,20,25][t]}];
 const third=c.rank==='or'?'house':['mis','def','friend'][hash(c.k)%3];
 if(third==='house')o.push({k:'house',n:5,t:'Relever sa maison au niveau 5'});
 if(third==='mis')o.push({k:'mis',n:[3,5,8][t],t:'Réussir '+[3,5,8][t]+' missions'});
 if(third==='def')o.push({k:'def',n:[5,10,20][t],t:'Vaincre '+[5,10,20][t]+' ennemis en défendant le Sanctuaire'});
 if(third==='friend')o.push({k:'friend',n:6,t:'Nouer une amitié de 6/10'});
 return o;
}
export function epreuveOf(c){const g=GAME_OF_CONS[c.k];return g?{type:'jeu',game:g}:{type:'obj',objs:objectivesOf(c)};}
export function bearerOf(c){return S.knights.find(k=>k.cons===c.k)||null;}
// Où en est un objectif pour le porteur p : [valeur, cible].
export function objValue(o,p,c){
 if(!p)return[0,o.n];
 if(o.k==='lv')return[p.lv,o.n];
 if(o.k==='skill'){const ids=specReq(c);return[ids.length?Math.min(...ids.map(id=>skillLevel(p,id))):0,o.n];}
 if(o.k==='mis')return[(p.rec&&p.rec.mw)||0,o.n];
 if(o.k==='def')return[(p.rec&&p.rec.w)||0,o.n];
 if(o.k==='house')return[S.houses[c.sign]||0,o.n];
 if(o.k==='friend'){let m=0;for(const k in S.friend||{}){const [a,b]=k.split('-').map(Number);if(a===p.id||b===p.id)m=Math.max(m,S.friend[k]);}return[m,o.n];}
 return[0,o.n];
}
export const isDone=k=>(S.epDone||[]).includes(k);
// Avancement de 0 à 1.
export function progressOf(c){
 if(isDone(c.k))return 1;
 const e=epreuveOf(c);
 if(e.type==='jeu')return((S.mg&&S.mg[e.game.k]&&S.mg[e.game.k].done)||0)/MG_LEVELS;
 const p=bearerOf(c);if(!p)return 0;
 return e.objs.reduce((t,o)=>{const [v,n]=objValue(o,p,c);return t+clamp(v/n,0,1);},0)/e.objs.length;
}
// Vérifie les épreuves finies (une fois par heure de jeu suffit). Renvoie vrai si une épreuve vient d'être finie.
export function tickEpreuves(sum){
 S.epAcc=(S.epAcc||0);if(S.gt<S.epAcc)return false;S.epAcc=S.gt+1;
 return checkEpreuves(sum);
}
export function checkEpreuves(sum){
 if(!S.epDone)S.epDone=[];let any=false;
 CONS.forEach(c=>{if(isDone(c.k))return;if(progressOf(c)>=1){S.epDone.push(c.k);any=true;
  const p=bearerOf(c),m='Épreuve de '+c.n+' accomplie'+(p?' par '+p.name:'')+' : '+bonusText(epBonus(c.k))+' pour tout le Sanctuaire.';
  log(m);sum?sum.ev.push(m):emit('milestone');}});
 if(any)S._dirty=true;return any;
}
// Le palmarès d'un porteur pour sa carte de collection.
export function cardStats(p){return p?{lv:p.lv,mw:(p.rec&&p.rec.mw)||0,w:(p.rec&&p.rec.w)||0,l:(p.rec&&p.rec.l)||0}:null;}
// Cartes visibles : une armure portée un jour, ou une épreuve finie.
export function seenCons(){if(!S.seenCons)S.seenCons=[];S.knights.forEach(k=>{if(k.cons&&!S.seenCons.includes(k.cons))S.seenCons.push(k.cons);});return S.seenCons;}
