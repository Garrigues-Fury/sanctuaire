/* Sauvegardes nommées (demandées par Seba le 2026-10-25), rangées dans le navigateur à côté de la partie en cours.
   - Le joueur crée une sauvegarde en lui donnant un nom, puis peut la recharger, la supprimer ou copier son code.
   - Avant chaque mise à jour du jeu, une sauvegarde automatique est faite (les 3 dernières sont gardées).
   - Si la partie en cours ne peut pas être lue, elle est mise de côté au lieu d'être écrasée par une nouvelle partie. */
import { KEY, S } from './state.js';
import { exportCode, importCode, save } from './save.js';

const SK='sanctuaire-sauvegardes',VK='sanctuaire-version',MAX_AUTO=3,MAX_MANUAL=15;
export function listSlots(){try{return JSON.parse(localStorage.getItem(SK)||'[]');}catch(e){return[];}}
function store(L){try{localStorage.setItem(SK,JSON.stringify(L));return true;}catch(e){return false;}}
// Crée une sauvegarde de la partie en cours. Renvoie la sauvegarde, ou null si le navigateur manque de place.
export function saveSlot(name,auto=false){
 if(!S)return null;save();
 const day=Math.floor(S.gt/24)+1;
 const e={id:Date.now(),name:String(name||'').trim().slice(0,60)||'Partie du jour '+day,date:Date.now(),day,knights:S.knights.length,aps:S.aps.length,auto,code:exportCode(S)};
 let L=[e].concat(listSlots());
 const autos=L.filter(x=>x.auto),manual=L.filter(x=>!x.auto);
 L=L.filter(x=>x.auto?autos.indexOf(x)<MAX_AUTO:manual.indexOf(x)<MAX_MANUAL);
 return store(L)?e:null;
}
// Renvoie la partie de cette sauvegarde (mise à niveau), ou null.
export function slotGame(id){const e=listSlots().find(x=>x.id===id);return e?importCode(e.code):null;}
export function slotCode(id){const e=listSlots().find(x=>x.id===id);return e?e.code:'';}
export function deleteSlot(id){store(listSlots().filter(x=>x.id!==id));}
// Au démarrage : si la version du jeu a changé, sauvegarde automatique de la partie telle qu'elle était.
export function snapshotOnUpdate(version){
 try{const prev=localStorage.getItem(VK);if(prev&&prev!==version&&S)saveSlot('Avant la mise à jour ('+version+')',true);localStorage.setItem(VK,version);}catch(e){}
}
// Une partie illisible n'est jamais écrasée : on la met de côté (elle reste récupérable).
export function keepUnreadable(){
 try{const raw=localStorage.getItem(KEY);if(!raw)return false;localStorage.setItem(KEY+'-illisible-'+Date.now(),raw);return true;}catch(e){return false;}
}
