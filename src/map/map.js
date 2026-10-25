/* Carte animée du Sanctuaire, en Phaser.
   Le décor fixe vient de background.js ; les personnages et les étincelles sont redessinés à chaque image.
   Le canvas Phaser est créé une seule fois et déplacé dans l'onglet Sanctuaire à chaque rendu de l'interface. */
import Phaser from 'phaser';
import { ITEMS, RES, WORK } from '../core/data/economy.js';
import { DEPOT, HOUSE_PTS, SITES, VH, VW } from '../core/data/map.js';
import { S } from '../core/state.js';
import { clamp, mulberry32 } from '../core/util.js';
import { AG, SPARKS, busySite, updateAgents } from './agents.js';
import { hourOf, skyAt } from './ambience.js';
import { backgroundSig, drawBackground } from './background.js';

const R=Math.min(3,Math.max(2,Math.ceil(window.devicePixelRatio||1)));
const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let game=null,host=null,parking=null,onTap=()=>{},onHover=()=>{},bgSig='';

// '#rrggbb' → entier Phaser
const hex=s=>parseInt(s.slice(1),16);

class MapScene extends Phaser.Scene{
 constructor(){super('map');}
 create(){
  this.bg=this.textures.createCanvas('bg',VW*R,VH*R);
  this.add.image(0,0,'bg').setOrigin(0).setScale(1/R);
  this.fx=this.add.graphics();
  this.shade=this.add.graphics();                                  // voile du jour et de la nuit
  this.lights=this.add.graphics().setBlendMode(Phaser.BlendModes.ADD); // fenêtres, braseros, étoiles
  // Petite tache lumineuse qui sert de grain de cosmos
  const t=this.make.graphics({x:0,y:0},false);for(let r=8;r>0;r--){t.fillStyle(0xffffff,.12*(9-r)/8);t.fillCircle(8,8,r);}t.generateTexture('mote',16,16);t.destroy();
  this.emitters=[];this.cosmosSig='';
  this.stars=[];const rs=mulberry32(11);for(let i=0;i<60;i++)this.stars.push({x:rs()*VW,y:rs()*150,s:.5+rs()*1.1,p:rs()*6.28});
  this.cameras.main.setZoom(R).centerOn(VW/2,VH/2);
  let down=null,press=null,pressed=false;
  // Toucher : ouvre le site. Appui long (ou survol à la souris) : fiche du bâtiment.
  const ev=p=>p.event||{};
  this.input.on('pointerdown',p=>{down={x:p.x,y:p.y,t:p.downTime};pressed=false;clearTimeout(press);
   if(p.wasTouch)press=setTimeout(()=>{pressed=true;onHover(p.worldX,p.worldY,ev(p).clientX,ev(p).clientY,true);},450);});
  this.input.on('pointermove',p=>{if(down&&Math.hypot(p.x-down.x,p.y-down.y)>12*R)clearTimeout(press);if(!p.wasTouch)onHover(p.worldX,p.worldY,ev(p).clientX,ev(p).clientY,false);});
  this.input.on('pointerup',p=>{clearTimeout(press);if(!down)return;const moved=Math.hypot(p.x-down.x,p.y-down.y);down=null;if(pressed){setTimeout(()=>onHover(null),2200);return;}if(moved<12*R)onTap(p.worldX,p.worldY);});
  this.input.on('gameout',()=>onHover(null));
  bgSig='';
 }
 update(time,delta){
  const sig=backgroundSig();
  if(sig!==bgSig){bgSig=sig;drawBackground(this.bg.getContext(),R);this.bg.refresh();}
  if(!reduced)updateAgents(Math.min(.1,delta/1000));
  const g=this.fx;g.clear();
  if(S.b.forge>0){const rc=SITES.forge.r;const f=.6+.4*Math.sin(time/120)*Math.sin(time/330);g.fillStyle(0xff8c3c,.35+.35*f);g.fillCircle(rc[0]+rc[2]/2,rc[1]+rc[3]-18,5+2*f);
   g.fillStyle(0xc8c8d2,.18);for(let i=0;i<3;i++){const sy=(time/40+i*14)%40;g.fillCircle(rc[0]+rc[2]-18+Math.sin(time/600+i)*3,rc[1]-sy*.6,2+sy/12);}}
  drawWorks(g,time);
  AG.slice().sort((a,b)=>a.y-b.y).forEach(a=>drawFigure(g,a));
  SPARKS.forEach(s=>{const [r0,g0,b0]=s.c.split(',').map(Number);g.fillStyle((r0<<16)|(g0<<8)|b0,clamp(s.l*1.2,0,1));if(s.puff)g.fillCircle(s.x,s.y,1.6+(1.2-s.l)*2);else g.fillRect(s.x,s.y,1.2,1.2);});
  this.drawSky(time);
  if(!reduced)this.syncCosmos();
 }
 drawSky(time){
  const sky=skyAt(hourOf(S)),n=sky.lights;
  this.shade.clear();if(sky.alpha>.005){this.shade.fillStyle(sky.color,sky.alpha);this.shade.fillRect(0,0,VW,VH);}
  const L=this.lights;L.clear();if(n<.02)return;
  // étoiles qui scintillent
  this.stars.forEach(s=>{L.fillStyle(0xfff6e0,n*(.35+.35*Math.sin(time/700+s.p)));L.fillCircle(s.x,s.y,s.s*.6);});
  // maisons relevées : lueur des braseros
  S.houses.forEach((lv,i)=>{if(!lv)return;const [x,y]=HOUSE_PTS[i];const f=.75+.25*Math.sin(time/260+i);L.fillStyle(0xffa040,n*.25*f);L.fillCircle(x,y-4,7+lv);L.fillStyle(0xffc060,n*.55*f);L.fillCircle(x,y-4,2.5+lv*.4);});
  // palais du Pope, fenêtres des dortoirs et du village, forge
  if(S.knights.some(k=>k.role==='pope')){L.fillStyle(0xffe0a0,n*.3);L.fillCircle(180,24,14);L.fillStyle(0xfff0c0,n*.6);L.fillCircle(180,24,5);}
  const win=(id,k)=>{const rc=SITES[id].r;L.fillStyle(0xffb050,n*.85);for(let i=0;i<k;i++)L.fillRect(rc[0]+11+i*9,rc[1]+22,4,5);};
  win('dortoirs',Math.min(5,1+S.b.dortoirs));
  const rc=SITES.artisans.r;for(let i=0;i<Math.min(6,2+S.b.artisans);i++){L.fillStyle(0xffb050,n*.8);L.fillRect(rc[0]+6+(i%3)*15,rc[1]+15+Math.floor(i/3)*18,3,3);}
  if(S.b.forge>0){const r=SITES.forge.r;L.fillStyle(0xff7030,n*.35);L.fillCircle(r[0]+r[2]/2,r[1]+r[3]-18,12);}
 }
 // Grains de cosmos : dans l'arène quand des apprentis s'entraînent, autour des maisons gardées par un chevalier d'or, au palais du Pope.
 syncCosmos(){
  const spar=S.aps.filter(a=>!a.job).length,gold=S.knights.filter(k=>k.rank==='or').map(k=>k.sign),pope=S.knights.some(k=>k.role==='pope');
  const sig=spar+'|'+gold.join()+'|'+pope;if(sig===this.cosmosSig)return;this.cosmosSig=sig;
  this.emitters.forEach(e=>e.destroy());this.emitters=[];
  const mk=(zone,cfg)=>{const e=this.add.particles(0,0,'mote',Object.assign({emitZone:{type:'random',source:zone},blendMode:'ADD',lifespan:{min:1800,max:3200},speedY:{min:-12,max:-5},speedX:{min:-2,max:2},scale:{start:.55,end:0},alpha:{start:1,end:0}},cfg));this.emitters.push(e);};
  if(spar){const rc=SITES.arene.r;mk(new Phaser.Geom.Ellipse(rc[0]+rc[2]/2,rc[1]+rc[3]/2+2,rc[2]-20,rc[3]-22),{tint:0xffd27a,frequency:Math.max(60,300/spar)});}
  gold.forEach(i=>{const [x,y]=HOUSE_PTS[i];mk(new Phaser.Geom.Circle(x,y-4,7),{tint:0xffe7a6,frequency:260,scale:{start:.45,end:0}});});
  if(pope)mk(new Phaser.Geom.Circle(180,22,10),{tint:0xfff4d6,frequency:300,speedY:{min:-8,max:-3}});
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

// Chantiers en cours : échafaudages de bois, étincelles d'outils, barre d'avancement dorée.
function drawWorks(g,time){
 (S.jobs||[]).forEach(j=>{
  const p=Math.max(0,Math.min(1,(S.gt-j.start)/(j.end-j.start)));
  let x,y,w,h;
  if(/^h\d+$/.test(j.b)){const [hx,hy]=HOUSE_PTS[+j.b.slice(1)];x=hx-10;y=hy-16;w=20;h=16;}
  else if(SITES[j.b]){const r=SITES[j.b].r;x=r[0]+4;y=r[1]+2;w=r[2]-8;h=r[3]-12;}
  else if(j.b==='entrepot'){x=DEPOT[0]-12;y=DEPOT[1]-16;w=24;h=14;}
  else return;
  g.lineStyle(1.2,0x9a7348,.95);
  for(let k=0;k<=3;k++){const px=x+k*w/3;g.lineBetween(px,y+h,px,y);}
  for(let yy=y+h;yy>=y;yy-=6)g.lineBetween(x,yy,x+w,yy);
  g.lineStyle(.8,0x6e5233,.8);g.lineBetween(x,y+h,x+w/3,y);g.lineBetween(x+2*w/3,y+h,x+w,y);
  if(!reduced&&Math.sin(time/90+x)>.6){g.fillStyle(0xffe08a,.9);g.fillCircle(x+w*(.3+.4*Math.abs(Math.sin(time/700+x))),y+h*.4,1.1);}
  g.fillStyle(0x1c130e,.85);g.fillRect(x,y-5,w,3);g.fillStyle(0xf6d48a,1);g.fillRect(x,y-5,w*p,3);
 });
}
// La maison du zodiaque la plus proche d'un point de la colline.
export function houseAt(x,y){let best=-1,bd=12;HOUSE_PTS.forEach(([hx,hy],i)=>{const d=Math.hypot(x-hx,y-(hy-4));if(d<bd){bd=d;best=i;}});return best;}
// Zones touchables, comme dans le prototype : sommet = Pope, colline = maisons, sinon un site.
export function hitTest(x,y){
 if(y<46)return{type:'pope'};
 if(y<182)return{type:'houses'};
 for(const id in SITES){const r=SITES[id].r;if(x>=r[0]-4&&x<=r[0]+r[2]+4&&y>=r[1]-4&&y<=r[1]+r[3]+10)return{type:'site',id};}
 if(Math.hypot(x-DEPOT[0],y-DEPOT[1])<14)return{type:'site',id:'entrepot'};
 return null;
}
export function setMapTapHandler(fn){onTap=(x,y)=>{const h=hitTest(x,y);if(h)fn(h);};}
// Survol (souris) ou appui long (doigt) : fn(zone ou null, x, y à l'écran).
export function setMapHoverHandler(fn){onHover=(x,y,cx,cy,touch)=>{if(x==null){fn(null);return;}const h=hitTest(x,y);if(h&&h.type==='houses'){const i=houseAt(x,y);if(i>=0)h.house=i;}fn(h,cx,cy,touch);};}

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
