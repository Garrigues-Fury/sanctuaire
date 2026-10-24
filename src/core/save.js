/* Sauvegarde locale, et code de sauvegarde compatible avec le prototype. */
import { migrate } from './migrate.js';
import { KEY, S, VERSION } from './state.js';

export function save(){try{S.lastReal=Date.now();localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
export function load(){try{const t=localStorage.getItem(KEY);if(t){const o=JSON.parse(t);if(o&&o.v>=1&&o.v<=VERSION)return migrate(o);}}catch(e){}return null;}
// Même encodage que le prototype : JSON → UTF-8 → base64.
export function exportCode(state){return btoa(unescape(encodeURIComponent(JSON.stringify(state))));}
// Renvoie la partie mise à niveau, ou null si le code n'est pas reconnu.
export function importCode(code){
 try{const o=JSON.parse(decodeURIComponent(escape(atob(String(code).replace(/\s+/g,'')))));if(!o||!(o.v>=1&&o.v<=VERSION))return null;return migrate(o);}catch(e){return null;}
}
