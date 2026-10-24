/* Les petits personnages de la carte : qui va où. */
import { looks } from '../core/appearance.js';
import { DEPOT, SITES, guardPt, rectPt } from '../core/data/map.js';
import { knightsWith } from '../core/rules.js';
import { S } from '../core/state.js';

export let AG=[],SPARKS=[];
export function syncAgents(){
 const want=[];
 S.workers.forEach(w=>{if(w.job)want.push({id:'w'+w.id,kind:'worker',site:w.job,p:w});else want.push({id:'i'+w.id,kind:'idle',site:'artisans',p:w});});
 S.aps.forEach(a=>{if(a.job)want.push({id:'a'+a.id,kind:'apworker',site:a.job,p:a});else want.push({id:'s'+a.id,kind:'spar',site:'arene',p:a});});
 knightsWith('maitre').forEach(k=>want.push({id:'m'+k.id,kind:'master',site:'arene',p:k}));
 (S.guards||[]).forEach(g=>{if(g.post)want.push({id:'g'+g.id+g.post,kind:'guard',site:g.post,p:g});});
 const old={};AG.forEach(a=>old[a.id]=a);
 AG=want.map(wn=>{const o=old[wn.id];if(o&&o.site===wn.site&&o.kind===wn.kind){o.p=wn.p;return o;}const r=Math.random;const pt=wn.kind==='guard'?guardPt(wn.site,wn.p):rectPt(SITES[wn.site].r,r);const L=looks(wn.p);
  return Object.assign(wn,{x:pt[0],y:pt[1],tx:pt[0],ty:pt[1],st:'work',t:r()*2,carry:false,ph:r()*6,skin:L.skin,hair:L.hair,ang:r()*6.28});});
}
export const STILL={forge:1,biblio:1,herbo:1,atelier:1};
export function busySite(s){return s==='forge'?!!S.forgeJob:(s==='herbo'||s==='atelier')?S.craft[s].length>0:true;}
export function updateAgents(dt){
 AG.forEach(a=>{
  a.ph+=dt*8;if(a.kind==='guard'){a.st='still';moveTo(a,dt,10);return;}const rc=SITES[a.site].r;
  if(a.kind==='spar'||a.kind==='master'||a.kind==='idle'){
   const cx=rc[0]+rc[2]/2,cy=rc[1]+rc[3]/2+3;
   if(a.kind==='spar'){a.ang+=dt*(1.2+(a.p.id%3)*.3);const R=14+(a.p.id%4)*4;a.tx=cx+Math.cos(a.ang)*R;a.ty=cy+Math.sin(a.ang)*R*.55;}
   else if(a.kind==='master'){a.tx=cx+(a.p.id%2?-28:28);a.ty=cy-14+(a.p.id%3)*8;}
   else{a.t-=dt;if(a.t<=0){const pt=rectPt(rc,Math.random);a.tx=pt[0];a.ty=pt[1];a.t=2+Math.random()*4;}}
   moveTo(a,dt,a.kind==='spar'?60:12);return;}
  if(STILL[a.site]){if(a.st!=='still'){const pt=rectPt(rc,Math.random);a.tx=pt[0];a.ty=pt[1];a.st='still';}moveTo(a,dt,14);
   if((a.site==='forge'||a.site==='atelier')&&busySite(a.site)&&Math.random()<dt*2.2)for(let i=0;i<4;i++)SPARKS.push({x:a.x+3,y:a.y-4,vx:(Math.random()-.5)*40,vy:-20-Math.random()*30,l:.5+Math.random()*.4,c:'255,200,90'});
   if(a.site==='herbo'&&busySite('herbo')&&Math.random()<dt*1.2)SPARKS.push({x:a.x+(Math.random()-.5)*6,y:a.y-8,vx:(Math.random()-.5)*6,vy:-12,l:1.2,c:'190,160,240',puff:1});
   return;}
  if(a.st==='work'){a.t-=dt;if(a.t<=0){a.st='toDepot';a.carry=true;a.tx=DEPOT[0]+(Math.random()-.5)*10;a.ty=DEPOT[1]+(Math.random()-.5)*6;}}
  else if(a.st==='toDepot'){if(moveTo(a,dt,22)){a.carry=false;a.st='toSite';const pt=rectPt(rc,Math.random);a.tx=pt[0];a.ty=pt[1];}}
  else if(a.st==='toSite'){if(moveTo(a,dt,22)){a.st='work';a.t=2.5+Math.random()*3.5;}}
 });
 SPARKS.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;if(!s.puff)s.vy+=80*dt;s.l-=dt;});SPARKS=SPARKS.filter(s=>s.l>0);
}
export function moveTo(a,dt,sp){const dx=a.tx-a.x,dy=a.ty-a.y,d=Math.hypot(dx,dy);a.moving=d>.6;if(d<.6)return true;const m=Math.min(d,sp*dt);a.x+=dx/d*m;a.y+=dy/d*m;a.fl=dx<0;return false;}
