/* Après la scène d'investiture : la transformation (l'apprenti dans la lumière, un éclair, le chevalier en armure),
   puis la photo souvenir (le Pope, le maître, les amis autour du nouveau chevalier), rangée dans l'album. */
import { CONS_BY, RANKS, armorName } from '../core/data/world.js';
import { SANCT_VIEWS } from '../core/data/art.js';
import { photoTitle } from '../core/ceremony.js';
import { byId } from '../core/rules.js';
import { S } from '../core/state.js';
import { esc } from '../core/util.js';
import { sfx } from '../audio/audio.js';
import { fullBody } from './portraits.js';
import { render } from './app.js';

let root=null;
const rankOf=p=>S.knights.includes(p)?p.rank:(S.guards||[]).includes(p)?'garde':null;
const fig=(p,cls)=>p?'<img class="ph-fig '+cls+'" src="'+fullBody(p,rankOf(p))+'" alt="'+esc(p.name)+'">':'';
// La photo souvenir. small : vignette pour l'album.
export function photoHtml(ph,small){
 const k=byId(ph.kid),m=ph.master!=null?byId(ph.master):null,pope=ph.pope!=null?byId(ph.pope):null,fr=(ph.friends||[]).map(byId).filter(Boolean);
 const bg=SANCT_VIEWS[(ph.kid||0)%SANCT_VIEWS.length].src;
 return '<figure class="photo'+(small?' small':'')+'"><div class="ph-frame" style="--bg:url('+bg+')">'+fig(m,'back left')+fig(pope,'back right')+fig(fr[0],'front left')+fig(fr[1],'front right')+fig(k,'hero')+'</div>'+
  '<figcaption><b>'+esc(photoTitle(ph))+'</b><span>Jour '+(Math.floor(ph.t/24)+1)+(ph.names&&ph.names.length?' · avec '+esc(ph.names.join(', ')):'')+'</span></figcaption></figure>';
}
export function openInvestiture(c,ph){
 const k=byId(c.kid);if(!k)return;
 if(!root){root=document.createElement('div');root.id='ceremony';document.body.appendChild(root);root.addEventListener('click',onClick);}
 const cons=CONS_BY[c.cons],old=c.old?CONS_BY[c.old]:null;
 const before=old?fullBody(Object.assign({},k,{cons:old.k,rank:old.rank}),old.rank):fullBody(Object.assign({},k,{cons:null,rank:null}),null,{outfit:'apprentice'});
 const title=old?k.name+' est promu'+(k.sex==='F'?'e':'')+' chevalier '+(cons.rank==='or'?'d’or':'d’argent')+' !':k.name+' devient chevalier '+({bronze:'de bronze',argent:'d’argent',or:'d’or'})[cons.rank]+' !';
 root.dataset.step='1';root.hidden=false;root._ph=ph;
 root.innerHTML='<div class="cer-card"><div class="cer-stage"><div class="cer-rays"></div><img class="cer-before" src="'+before+'" alt=""><img class="cer-after" src="'+fullBody(k,k.rank)+'" alt="'+esc(k.name)+'"><div class="cer-flash"></div></div>'+
  '<div class="cer-text"><h2>'+esc(title)+'</h2><p>'+esc(armorName(cons))+(old?' · après l’'+esc(armorName(old).replace(/^A/,'a')):'')+'</p><button class="btn" data-cer="photo">La photo souvenir ›</button></div></div>';
 sfx('milestone');setTimeout(()=>sfx('milestone'),1700);
}
function onClick(e){
 const b=e.target.closest('[data-cer]');if(!b)return;
 if(b.dataset.cer==='photo'){sfx('confirm');root.dataset.step='2';root.innerHTML='<div class="cer-card photo-step"><h2>Photo souvenir</h2>'+photoHtml(root._ph)+'<p class="hint">Elle rejoint l’album : dans la fiche du chevalier et dans Personnages › Collection.</p><button class="btn" data-cer="close">Terminer</button></div>';}
 if(b.dataset.cer==='close'){sfx('close');root.hidden=true;render();}
}
