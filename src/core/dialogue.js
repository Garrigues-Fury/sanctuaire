/* Moteur de dialogues. Une scène est un petit graphe de répliques (voir data/scenes.js).
   Chaque réplique a un orateur (who), un texte (qui peut varier selon le caractère de l'orateur)
   et soit une suite (next), soit des choix, soit un tirage (roll), soit un combat (fight), soit une fin (end). */
import { QUAL, FLAW } from './data/traits.js';
import { clamp } from './util.js';

// Texte selon le caractère : la première qualité ou le premier défaut qui a une réplique dédiée l'emporte.
export function pickText(t,p){
 if(typeof t==='string')return t;
 if(p){for(const q of(p.qual||[]))if(t[q.k])return t[q.k];for(const f of(p.flaw||[]))if(t[f.k])return t[f.k];}
 return t.default;
}
export function fill(s,vars){return s.replace(/\{(\w+)\}/g,(m,k)=>vars[k]!=null?vars[k]:m);}

// Condition d'un choix : qualité, défaut, statistique minimale ou ressource à payer.
export function reqOk(req,k,S){
 if(!req)return true;
 if(req.qual)return(k.qual||[]).some(q=>req.qual.split('|').includes(q.k));
 if(req.flaw)return(k.flaw||[]).some(f=>req.flaw.split('|').includes(f.k));
 if(req.stat)return k.st[req.stat[0]]>=req.stat[1];
 if(req.res)return(S.res[req.res[0]]||0)>=req.res[1];
 if(req.survivor)return k.origin==='survivant';
 return true;
}
const STATN={fo:'Force',vi:'Vitesse',de:'Dextérité',en:'Endurance',ps:'Psychokinésie',co:'Cosmos'};
export function reqLabel(req){
 if(!req)return'';
 if(req.qual)return req.qual.split('|').map(q=>QUAL[q].n).join(' ou ');
 if(req.flaw)return req.flaw.split('|').map(f=>FLAW[f].n).join(' ou ');
 if(req.stat)return STATN[req.stat[0]]+' '+req.stat[1];
 if(req.res)return req.res[1]+' '+req.res[0];
 if(req.survivor)return'Survivant de la guerre sainte';
 return'';
}
// Chance d'un tirage : selon une statistique du chevalier (de 20 % à 90 %), ou fixe.
export function rollChance(roll,k){
 if(typeof roll.p==='number')return roll.p;
 const v=k.st[roll.stat]||0;return clamp(.2+v/(roll.scale||100),.2,.9);
}
