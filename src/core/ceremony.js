/* Cérémonie d'investiture (demandée par Seba le 2026-10-28) : quand un apprenti obtient son armure, ou qu'un chevalier
   est promu, une scène réunit le Grand Pope, le maître, les amis et l'armure ; puis la transformation, puis une photo
   souvenir rangée dans l'album (S.album). La scène est dans data/ceremony.js, l'écran dans ui/ceremony.js. */
import { CONS_BY } from './data/world.js';
import { S } from './state.js';

export function ensureCeremonies(){if(!S.ceremonies)S.ceremonies=[];if(!S.album)S.album=[];}
// Un nouveau chevalier (kid) reçoit l'armure cons ; promo : il en quittait une autre (old) ; master : son maître d'apprenti.
export function queueCeremony(o){
 ensureCeremonies();if(S.ceremonies.some(c=>c.kid===o.kid&&c.cons===o.cons))return;
 S.ceremonies.push(Object.assign({t:S.gt},o));if(S.ceremonies.length>6)S.ceremonies.shift();
}
const fk=(a,b)=>a<b?a+'-'+b:b+'-'+a;
// Les présents : le Pope, le maître (ou le dernier chevalier qui l'a formé), ses deux meilleurs amis.
export function ceremonyCast(c){
 const P=S.knights.concat(S.guards||[],S.aps),k=S.knights.find(x=>x.id===c.kid);if(!k)return null;
 const pope=S.knights.find(x=>x.role==='pope'&&x.id!==k.id)||null;
 const mid=c.master!=null?c.master:(k.mentors||[]).slice(-1)[0];
 const master=mid!=null?S.knights.find(x=>x.id===mid&&x.id!==k.id)||null:null;
 const friends=P.filter(x=>x.id!==k.id&&x!==master&&x!==pope&&(S.friend[fk(k.id,x.id)]||0)>=1)
  .sort((a,b)=>(S.friend[fk(k.id,b.id)]||0)-(S.friend[fk(k.id,a.id)]||0)).slice(0,2);
 return{k,pope,master,friends};
}
export function pendingCeremonies(){ensureCeremonies();return S.ceremonies.filter(c=>S.knights.some(k=>k.id===c.kid));}
// Fin de la cérémonie : la photo rejoint l'album, la cérémonie quitte la file.
export function closeCeremony(c,cast){
 ensureCeremonies();S.ceremonies=S.ceremonies.filter(x=>x!==c&&!(x.kid===c.kid&&x.cons===c.cons));
 const photo={t:S.gt,kid:c.kid,name:cast.k.name,cons:c.cons,promo:!!c.promo,old:c.old||null,
  pope:cast.pope&&cast.pope.id,master:cast.master&&cast.master.id,friends:cast.friends.map(f=>f.id),
  names:[cast.pope&&cast.pope.name,cast.master&&cast.master.name].concat(cast.friends.map(f=>f.name)).filter(Boolean)};
 S.album.push(photo);S._dirty=true;return photo;
}
export function photosOf(kid){ensureCeremonies();return S.album.filter(p=>p.kid===kid);}
export function photoTitle(p){const c=CONS_BY[p.cons];return(p.promo?'Promotion de ':'Investiture de ')+p.name+(c?' · '+c.n:'');}
