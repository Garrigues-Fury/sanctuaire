/* Carte animée du Sanctuaire, en Phaser.
   Le décor fixe vient de background.js ; les personnages et les étincelles sont redessinés à chaque image.
   Le canvas Phaser est créé une seule fois et déplacé dans l'onglet Sanctuaire à chaque rendu de l'interface. */
import Phaser from 'phaser';
import { ITEMS, RES, WORK } from '../core/data/economy.js';
import { DEPOT, SITES, VH, VW } from '../core/data/map.js';
import { S } from '../core/state.js';
import { clamp } from '../core/util.js';
import { AG, SPARKS, busySite, updateAgents } from './agents.js';
import { backgroundSig, drawBackground } from './background.js';

const R=Math.min(3,Math.max(2,Math.ceil(window.devicePixelRatio||1)));
const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let game=null,host=null,parking=null,onTap=()=>{},bgSig='';

// '#rrggbb' → entier Phaser
const hex=s=>parseInt(s.slice(1),16);

class MapScene extends Phaser.Scene{
 constructor(){super('map');}
 create(){
  this.bg=this.textures.createCanvas('bg',VW*R,VH*R);
  this.add.image(0,0,'bg').setOrigin(0).setScale(1/R);
  this.fx=this.add.graphics();
  this.cameras.main.setZoom(R).centerOn(VW/2,VH/2);
  let down=null;
  this.input.on('pointerdown',p=>{down={x:p.x,y:p.y,t:p.downTime};});
  this.input.on('pointerup',p=>{if(!down)return;const moved=Math.hypot(p.x-down.x,p.y-down.y);down=null;if(moved<12*R)onTap(p.worldX,p.worldY);});
  bgSig='';
 }
 update(time,delta){
  const sig=backgroundSig();
  if(sig!==bgSig){bgSig=sig;drawBackground(this.bg.getContext(),R);this.bg.refresh();}
  if(!reduced)updateAgents(Math.min(.1,delta/1000));
  const g=this.fx;g.clear();
  if(S.b.forge>0){const rc=SITES.forge.r;const f=.6+.4*Math.sin(time/120)*Math.sin(time/330);g.fillStyle(0xff8c3c,.35+.35*f);g.fillCircle(rc[0]+rc[2]/2,rc[1]+rc[3]-18,5+2*f);
   g.fillStyle(0xc8c8d2,.18);for(let i=0;i<3;i++){const sy=(time/40+i*14)%40;g.fillCircle(rc[0]+rc[2]-18+Math.sin(time/600+i)*3,rc[1]-sy*.6,2+sy/12);}}
  AG.slice().sort((a,b)=>a.y-b.y).forEach(a=>drawFigure(g,a));
  SPARKS.forEach(s=>{const [r0,g0,b0]=s.c.split(',').map(Number);g.fillStyle((r0<<16)|(g0<<8)|b0,clamp(s.l*1.2,0,1));if(s.puff)g.fillCircle(s.x,s.y,1.6+(1.2-s.l)*2);else g.fillRect(s.x,s.y,1.2,1.2);});
 }
}

function drawFigure(g,a){
 const walk=a.moving?Math.sin(a.ph):0,bob=(a.st==='work'||a.st==='still')&&!a.moving?Math.abs(Math.sin(a.ph*.6))*1.2:0;
 const x=a.x,y=a.y;
 let body='#8a6a4a';
 if(a.kind==='apworker'||a.kind==='spar')body='#e8dcc0';
 if(a.kind==='master')body={or:'#e8b84f',argent:'#d0d7e3',bronze:'#c9844f'}[a.p.rank];
 if(a.site==='herbo'&&a.kind==='worker')body='#7d6aa8';
 if(a.kind==='guard')body='#6d5a44';
 g.fillStyle(0x000000,.35);g.fillEllipse(x,y+1,6.4,2.4);
 g.lineStyle(1.3,0x2a221c,1);g.lineBetween(x-1,y-3,x-1-walk*1.6,y);g.lineBetween(x+1,y-3,x+1+walk*1.6,y);
 g.fillStyle(hex(body),1);g.fillRoundedRect(x-2.6,y-9-bob,5.2,6.5,1.6);
 if(a.kind==='apworker'||a.kind==='spar'){g.fillStyle(0xa8473a,1);g.fillRect(x-2.6,y-5.6-bob,5.2,1);}
 g.fillStyle(hex(a.skin),1);g.fillCircle(x,y-11.4-bob,2.4);
 g.fillStyle(a.kind==='guard'?0x9a8a70:hex(a.hair),1);g.beginPath();g.arc(x,y-12.2-bob,2.4,Math.PI,0,false);g.closePath();g.fillPath();
 if(a.kind==='guard'){g.lineStyle(.8,0xc9bfa8,1);g.lineBetween(x+3.5,y-1,x+3.5,y-16);}
 if(a.carry){const W=WORK[a.site];const col=W&&W.res?RES[W.res].c:W&&W.item?ITEMS[W.item].c:'#cccccc';g.fillStyle(hex(col),1);g.fillCircle(x+(a.fl?-3:3),y-8-bob,1.8);}
 if((a.site==='forge'||a.site==='atelier')&&a.kind!=='spar'&&busySite(a.site)){const hm=Math.sin(a.ph*1.4);g.lineStyle(1,0xcfc8bd,1);g.lineBetween(x+2.5,y-7,x+5,y-9+hm*2.5);}
 if(a.kind==='spar'){const hm=Math.sin(a.ph*1.7);g.lineStyle(1.2,hex(a.skin),1);g.lineBetween(x,y-7,x+(a.fl?-4:4),y-8+hm);}
}

// Zones touchables, comme dans le prototype : sommet = Pope, colline = maisons, sinon un site.
export function hitTest(x,y){
 if(y<46)return{type:'pope'};
 if(y<182)return{type:'houses'};
 for(const id in SITES){const r=SITES[id].r;if(x>=r[0]-4&&x<=r[0]+r[2]+4&&y>=r[1]-4&&y<=r[1]+r[3]+10)return{type:'site',id};}
 if(Math.hypot(x-DEPOT[0],y-DEPOT[1])<14)return{type:'site',id:'entrepot'};
 return null;
}
export function setMapTapHandler(fn){onTap=(x,y)=>{const h=hitTest(x,y);if(h)fn(h);};}

function boot(){
 host=document.createElement('div');host.id='mapHost';
 parking=document.createElement('div');parking.hidden=true;document.body.appendChild(parking);
 game=new Phaser.Game({
  type:Phaser.AUTO,parent:host,width:VW*R,height:VH*R,backgroundColor:'#0b0f1d',banner:false,
  scale:{mode:Phaser.Scale.WIDTH_CONTROLS_HEIGHT,autoCenter:Phaser.Scale.NO_CENTER},
  input:{touch:{capture:false},mouse:{preventDefaultWheel:false}},audio:{noAudio:true},
  scene:MapScene
 });
 if(import.meta.env.DEV)window.__game=game;
 // Les libellés utilisent la police du jeu : on redessine le décor une fois qu'elle est chargée.
 if(document.fonts)document.fonts.ready.then(()=>{bgSig='';});
}
// Place la carte dans l'emplacement prévu, ou la met en veille si l'onglet ne l'affiche pas.
export function mountMap(slot){
 if(!game)boot();
 if(!slot){if(host.parentNode!==parking){parking.appendChild(host);game.loop.sleep();}return;}
 if(host.parentNode!==slot){slot.appendChild(host);game.loop.wake();requestAnimationFrame(()=>game.scale.refresh());}
}
export function invalidateMap(){bgSig='';}
