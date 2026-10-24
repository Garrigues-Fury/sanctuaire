/* État global de la partie (S), constantes de version et journal. */

export const KEY='sanctuaire-renaissant-v1';
export const VERSION=6;
export const POSEIDON_H=90*24, HADES_H=270*24;
export let S=null;
// Les autres modules lisent S directement mais ne peuvent pas le réaffecter : ils passent par setS.
export function setS(x){S=x;}
export function uid(){return S.idc++;}
// Petit bulletin d'événements (pour les sons, plus tard les animations). Ne change aucune règle.
const LISTEN=[];
export function onEvent(f){LISTEN.push(f);}
export function emit(type,data){for(const f of LISTEN){try{f(type,data);}catch(e){}}}
export function log(m){S.log.unshift({t:S.gt,m});if(S.log.length>150)S.log.length=150;}
