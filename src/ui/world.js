/* Onglet Monde : la mappemonde, les alertes et le choix du chevalier à envoyer. */
import { FOES, REGIONS, landPath } from '../core/data/worldmap.js';
import { RANKS } from '../core/data/world.js';
import { winChance } from '../core/combat.js';
import { EXP_E, ensureWorld, eventById } from '../core/expeditions.js';
import { S } from '../core/state.js';
import { dur, esc, mulberry32 } from '../core/util.js';
import { ptImg } from './app.js';

let LAND=null;
const stars=L=>'★'.repeat(L)+'☆'.repeat(5-L);
function evTitle(ev){return ev.type==='attack'?FOES[ev.foe].n+' attaquent '+ev.v:'Un enfant prodige à '+ev.v;}
function evPos(ev){const R=REGIONS[ev.region],r=mulberry32(ev.seed);return[R.x+(r()-.5)*22,R.y+(r()-.5)*14];}

function mapSvg(W){
 LAND=LAND||landPath();
 let s='<svg class="world" viewBox="0 12 360 138" role="img" aria-label="Mappemonde : touchez une alerte">';
 s+='<defs><radialGradient id="oc" cx="55%" cy="35%" r="80%"><stop offset="0" stop-color="#1d2a44"/><stop offset="1" stop-color="#0c1220"/></radialGradient></defs>';
 s+='<rect x="0" y="0" width="360" height="180" fill="url(#oc)"/>';
 for(let x=0;x<=360;x+=30)s+='<line x1="'+x+'" y1="0" x2="'+x+'" y2="180" class="grat"/>';
 for(let y=0;y<=180;y+=30)s+='<line x1="0" y1="'+y+'" x2="360" y2="'+y+'" class="grat"/>';
 s+='<path d="'+LAND+'" class="land"/>';
 // le Sanctuaire, en Grèce
 s+='<g class="home"><circle cx="203" cy="52" r="5" class="halo"/><circle cx="203" cy="52" r="2.2"/></g>';
 W.events.forEach(ev=>{const [x,y]=evPos(ev),atk=ev.type==='attack';
  s+='<g class="mk '+(atk?'atk':'rec')+'" data-act="event:'+ev.id+'" transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+')"><circle r="9" class="hit"/><circle r="6" class="pulse"/>'+
   (atk?'<path d="M-3.5 -3.5 L3.5 3.5 M3.5 -3.5 L-3.5 3.5" class="sw"/>':'<path d="M0 -4 L1.2 -1.2 L4 -1 L1.8 1 L2.5 4 L0 2.3 L-2.5 4 L-1.8 1 L-4 -1 L-1.2 -1.2 Z" class="st"/>')+'</g>';});
 return s+'</svg>';
}
export function viewMonde(){
 const W=ensureWorld();
 let h='';
 if(W.active)h+='<div class="banner info">Une scène est en cours. <button class="btn sm" data-act="scene:resume" style="margin-left:6px">Reprendre</button></div>';
 h+='<section class="sec"><div class="sec-h"><h2>Mappemonde</h2><span class="aside">'+W.events.length+' alerte'+(W.events.length>1?'s':'')+' · '+W.wins+' victoire'+(W.wins>1?'s':'')+'</span></div>';
 h+='<div class="world-wrap">'+mapSvg(W)+'</div>';
 h+='<p class="hint">Touchez une alerte : <span class="lg atk">✕</span> un village attaqué, <span class="lg rec">★</span> un enfant prometteur. Partir coûte '+EXP_E+' d’énergie au chevalier. Une alerte ignorée disparaît au bout de 3 jours, sans conséquence.</p></section>';
 h+='<section class="sec"><div class="list">';
 if(!W.events.length)h+='<div class="empty">Le monde est calme. De nouvelles alertes arrivent toutes les 6 à 10 heures.</div>';
 W.events.slice().sort((a,b)=>a.until-b.until).forEach(ev=>{
  h+='<div class="item tap" data-act="event:'+ev.id+'"><span class="evicon '+(ev.type==='attack'?'atk':'rec')+'">'+(ev.type==='attack'?'✕':'★')+'</span><div class="main"><div class="name">'+esc(evTitle(ev))+'</div><div class="sub">'+esc(ev.nat)+' · '+esc(REGIONS[ev.region].n)+'</div><div class="meta"><span class="danger">'+stars(ev.L)+'</span><span>disparaît dans <b data-until="'+ev.until+'">'+dur(ev.until-S.gt)+'</b></span></div></div><div class="right">›</div></div>';});
 return h+'</div></section>';
}
// Fenêtre d'une alerte : description, danger, chevaliers disponibles et chance estimée.
export function eventModal(id){return()=>{
 const ev=eventById(id);if(!ev)return '<p>Cette alerte a disparu.</p>';
 const F=FOES[ev.foe],busy=!!S.world.active;
 let h='<div><h2 class="mh">'+esc(evTitle(ev))+'</h2><p class="hint">'+esc(ev.nat)+' · '+esc(REGIONS[ev.region].n)+' · disparaît dans '+dur(ev.until-S.gt)+'</p></div>';
 h+='<div class="evhead"><span class="danger big">'+stars(ev.L)+'</span><span class="chip">'+esc(F.n)+'</span>'+(ev.boss?'<span class="chip warn">un chef les mène</span>':'')+'</div>';
 h+='<p class="hint">'+(ev.type==='attack'?'Des villageois appellent à l’aide. Une victoire rapporte des ressources, de l’expérience au chevalier, et parfois bien plus.':'Il paraît qu’un enfant d’ici fait des choses que personne n’explique. Il faudra peut-être convaincre sa famille… ou quelqu’un d’autre.')+' La suite dépendra de vos choix et du caractère de votre chevalier.</p>';
 if(busy)h+='<div class="banner">Une autre scène est en cours. Terminez-la d’abord.</div>';
 h+='<div class="sec-h"><h2>Qui envoyer ?</h2><span class="aside">'+EXP_E+' énergie</span></div><div class="list">';
 S.knights.slice().sort((a,b)=>b.lv-a.lv).forEach(k=>{
  const ch=Math.round(winChance(k,ev,{},40)*100),ok=k.nrg>=EXP_E&&!busy;
  const col=ch>=70?'ok':ch>=40?'warn':'bad';
  h+='<div class="item">'+ptImg(k,k.rank)+'<div class="main"><div class="name">'+esc(k.name)+' <span class="chip '+k.rank+'">'+RANKS[k.rank]+'</span></div><div class="meta"><span>niv. '+k.lv+'</span><span>⚡&#xFE0E; '+Math.floor(k.nrg)+'</span><span class="ch-'+col+'">combat ≈ '+ch+' %</span></div></div><button class="btn sm" data-act="go:'+ev.id+':'+k.id+'"'+(ok?'':' disabled')+'>'+(k.nrg<EXP_E?'Épuisé'+(k.sex==='F'?'e':''):'Envoyer')+'</button></div>';});
 return h+'</div><p class="hint">La chance de combat est une estimation, pour un affrontement sans aide. Vos choix dans les dialogues peuvent l’améliorer… ou l’empirer.</p>';
};}
