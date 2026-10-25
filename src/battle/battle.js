/* Scène de combat animée (Phaser) : décor peint, personnages animés en trois calques,
   ruées, impacts, projectiles d'élément, garde, coup ultime avec encart, chiffres de dégâts, secousses.
   La logique (qui touche, combien) reste dans core/combat.js ; ici on ne fait que la mise en scène. */
import Phaser from 'phaser';
import { dataUrl, specOf, svgBust, svgFull, svgLayer, layersOf } from '../art/character.js';
import { beastKind, svgBeast } from '../art/beast.js';
import { NATS } from '../core/data/countries.js';
import { rng } from '../art/geom.js';

const W=720,H=960;
const ELC={feu:0xff7a2a,eau:0x46b0ff,air:0xe6f6ff,terre:0xb0d860};
// Position et échelle des ennemis : ceux du fond un peu plus petits, pour la profondeur.
const FOE_POS=[[[525,905,1]],[[460,880,.95],[628,935,1]],[[430,850,.86],[622,872,.9],[528,958,1.02]]];
const tw=(scene,cfg)=>new Promise(res=>scene.tweens.add(Object.assign({},cfg,{onComplete:()=>res()})));
const wait=(scene,ms)=>new Promise(res=>scene.time.delayedCall(ms,res));
const hexn=s=>parseInt(s.slice(1),16);

function loadTex(scene,key,svg){
 return new Promise(res=>{if(scene.textures.exists(key)){res();return;}const img=new Image();img.onload=()=>{scene.textures.addImage(key,img);res();};img.onerror=()=>res();img.src=dataUrl(svg);});
}
// Décor : ciel du couchant aux couleurs de la région, montagnes, ruines, dalles, brume.
function paintBackground(g,c1,c2,seed){
 const r=rng(seed);
 const sky=g.createLinearGradient(0,0,0,600);sky.addColorStop(0,c2);sky.addColorStop(.55,c1);sky.addColorStop(1,'#ffd99a');g.fillStyle=sky;g.fillRect(0,0,W,H);
 const sun=g.createRadialGradient(470,430,10,470,430,320);sun.addColorStop(0,'rgba(255,244,210,.95)');sun.addColorStop(.25,'rgba(255,214,150,.5)');sun.addColorStop(1,'rgba(255,190,120,0)');g.fillStyle=sun;g.fillRect(0,0,W,H);
 const ridge=(y0,amp,col,step)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,H);let y=y0;for(let x=0;x<=W+step;x+=step){y=y0-r()*amp;g.lineTo(x,y);}g.lineTo(W,H);g.closePath();g.fill();};
 ridge(520,90,'rgba(90,50,60,.55)',60);ridge(570,60,'rgba(60,32,40,.7)',45);
 // ruines : colonnes brisées
 for(let i=0;i<7;i++){const x=20+i*105+r()*30,h=120+r()*170,w=26+r()*10,base=640;
  const cg=g.createLinearGradient(x,0,x+w,0);cg.addColorStop(0,'#3e2a26');cg.addColorStop(.35,'#a88a74');cg.addColorStop(1,'#2a1c1a');g.fillStyle=cg;g.globalAlpha=.75;
  g.fillRect(x,base-h,w,h);g.fillRect(x-6,base-h-10,w+12,12);g.globalAlpha=1;}
 // sol en dalles
 const gr=g.createLinearGradient(0,620,0,H);gr.addColorStop(0,'#6a4c38');gr.addColorStop(1,'#1e140e');g.fillStyle=gr;g.fillRect(0,620,W,H-620);
 g.strokeStyle='rgba(20,10,6,.45)';g.lineWidth=2;
 for(let k=0;k<7;k++){const y=640+k*k*7;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
 for(let k=-8;k<=8;k++){g.beginPath();g.moveTo(W/2+k*40,630);g.lineTo(W/2+k*190,H);g.stroke();}
 const fog=g.createLinearGradient(0,560,0,720);fog.addColorStop(0,'rgba(255,220,170,0)');fog.addColorStop(.5,'rgba(255,220,170,.28)');fog.addColorStop(1,'rgba(255,220,170,0)');g.fillStyle=fog;g.fillRect(0,560,W,160);
 const vg=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(10,4,2,.6)');g.fillStyle=vg;g.fillRect(0,0,W,H);
 for(let i=0;i<40;i++){g.fillStyle='rgba(255,236,190,'+(.2+r()*.5)+')';g.beginPath();g.arc(r()*W,r()*560,r()*1.8+.4,0,7);g.fill();}
}

class BattleScene extends Phaser.Scene{
 constructor(){super('battle');}
 init(data){this.ctx=data;}
 create(){this.build().catch(e=>console.error(e));}
 async build(){
  const C=this.ctx,b=C.battle;
  const bg=this.textures.createCanvas('bbg',W,H);paintBackground(bg.getContext(),C.colors[0],C.colors[1],b.rs>>>0);bg.refresh();this.add.image(0,0,'bbg').setOrigin(0);
  // petites textures pour les particules
  const mk=(key,draw)=>{const t=this.make.graphics({x:0,y:0},false);draw(t);t.generateTexture(key,32,32);t.destroy();};
  mk('mote',t=>{for(let r=16;r>0;r--){t.fillStyle(0xffffff,.09*(17-r)/16);t.fillCircle(16,16,r);}});
  mk('spark',t=>{t.fillStyle(0xffffff,1);t.fillTriangle(16,0,20,16,12,16);t.fillTriangle(16,32,20,16,12,16);t.fillStyle(0xffffff,.6);t.fillCircle(16,16,4);});
  mk('ring',t=>{t.lineStyle(3,0xffffff,1);t.strokeCircle(16,16,13);});
  // personnages
  const hs=specOf(C.knight,{rank:C.knight.rank});
  this.heroSpec=hs;const L=layersOf(hs);
  await Promise.all([loadTex(this,'h_back',svgLayer(hs,'back')),loadTex(this,'h_body',svgLayer(hs,'body')),loadTex(this,'h_arm',svgLayer(hs,'arm')),loadTex(this,'h_bust',svgBust(hs,{size:512,transparent:true}))]);
  const foeSpecs=b.foes.map((f,i)=>{
   // duel pour une armure : l'adversaire est un vrai personnage (disciple ou chevalier)
   if(C.foePeople&&C.foePeople[i]){const p=C.foePeople[i];return{spec:specOf(p,{rank:p.rank&&p.rank!=='garde'?p.rank:null})};}
   if(C.faction==='betes')return{beast:beastKind(f.n)};
   const r=rng((b.rs^(i*7919+17))>>>0),nat=Object.keys(NATS)[Math.floor(r()*193)];
   return{spec:specOf({seed:(b.rs^(i*104729+3))>>>0,sex:r()<.5?'F':'M',nat,sign:Math.floor(r()*12)},{faction:C.faction,boss:f.boss})};});
  await Promise.all(foeSpecs.map((fs,i)=>loadTex(this,'f'+i,fs.beast?svgBeast(fs.beast,(b.rs^i)>>>0,{boss:b.foes[i].boss}):svgFull(fs.spec))));
  // rig du héros : cape et cheveux derrière, corps, bras qui frappe (pivot à l'épaule)
  const sc=.58;this.heroHome=[175,940];
  const hero=this.add.container(this.heroHome[0],this.heroHome[1]).setScale(sc);
  this.shadow(hero,150);
  const back=this.add.image(0,205-876,'h_back').setOrigin(.5,205/900);
  const body=this.add.image(0,0,'h_body').setOrigin(.5,876/900);
  const [sx,sy]=L.shoulder;const arm=this.add.image(sx-200,sy-876,'h_arm').setOrigin(sx/400,sy/900);
  hero.add([back,body,arm]);this.hero=hero;this.heroParts={back,body,arm};this.heroScale=sc;
  this.tweens.add({targets:hero,scaleY:sc*1.012,duration:1400,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  this.tweens.add({targets:back,angle:{from:-1.4,to:1.4},duration:1900,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  this.tweens.add({targets:arm,angle:{from:-2,to:2},duration:1600,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  // aura de cosmos
  this.aura=this.add.particles(0,0,'mote',{x:{min:this.heroHome[0]-90,max:this.heroHome[0]+90},y:{min:this.heroHome[1]-480,max:this.heroHome[1]-40},speedY:{min:-60,max:-20},lifespan:1400,scale:{start:.9,end:0},alpha:{start:.7,end:0},tint:ELC[b.hero.el],blendMode:'ADD',frequency:200});
  // ennemis
  const pos=FOE_POS[Math.min(3,b.foes.length)-1];this.foes=[];
  b.foes.forEach((f,i)=>{const [x,y,depth]=pos[i];const fsc=(f.boss?.56:.5)*(foeSpecs[i].beast?1.05:1)*depth;
   const c=this.add.container(x,y).setScale(fsc);this.shadow(c,140);const im=this.add.image(0,0,'f'+i).setOrigin(.5,876/900);c.add(im);
   im.setInteractive(new Phaser.Geom.Rectangle(80,150,240,740),Phaser.Geom.Rectangle.Contains);im.on('pointerdown',()=>C.onTarget&&C.onTarget(i));
   this.tweens.add({targets:c,y:y-6,duration:1200+i*180,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
   this.foes.push({c,im,home:[x,y],scale:fsc,warn:null});});
  this.foes.slice().sort((a,b2)=>a.home[1]-b2.home[1]).forEach((f,i)=>f.c.setDepth(10+i));hero.setDepth(20);
  this.bars=this.add.graphics().setDepth(40);this.marker=this.add.triangle(0,0,0,0,24,0,12,18,0xff6a5a).setDepth(41);
  this.tweens.add({targets:this.marker,alpha:{from:1,to:.4},duration:500,yoyo:true,repeat:-1});
  this.overlay=this.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(60);
  this.ready=true;this.drawBars();C.onReady&&C.onReady(this);
 }
 shadow(c,rx){const s=this.add.ellipse(0,0,rx*2,40,0x000000,.38);c.add(s);}
 heroChest(){return[this.hero.x+20,this.hero.y-300];}
 foeChest(i){const f=this.foes[i];return[f.c.x,f.c.y-230*(f.scale/.5)];}
 // Barres de vie au-dessus des ennemis et marqueur de cible.
 drawBars(){
  if(!this.ready)return;const b=this.ctx.battle,g=this.bars;g.clear();
  b.foes.forEach((f,i)=>{const F=this.foes[i];if(!F)return;const x=F.home[0],y=F.home[1]-470*(F.scale/.5);
   if(f.hp<=0)return;g.fillStyle(0x000000,.6);g.fillRoundedRect(x-70,y,140,12,5);g.fillStyle(f.boss?0xff5040:0xe0604a,1);g.fillRoundedRect(x-68,y+2,136*f.hp/f.max,8,4);
   if(f.charge){g.lineStyle(3,0xffb020,1);g.strokeRoundedRect(x-72,y-2,144,16,6);}});
  const t=this.ctx.getTarget&&this.ctx.getTarget(),F=t!=null&&this.foes[t];
  if(F&&b.foes[t].hp>0){this.marker.setVisible(true);this.marker.setPosition(F.home[0]+12,F.home[1]-500*(F.scale/.5));}else this.marker.setVisible(false);
  this.aura.frequency=Math.max(40,260-b.hero.cos*22);
 }
 flash(images,color=0xffffff,ms=90){images.forEach(im=>im.setTint(color).setTintMode(Phaser.TintModes.FILL));return wait(this,ms).then(()=>images.forEach(im=>im.clearTint().setTintMode(Phaser.TintModes.MULTIPLY)));}
 number(x,y,txt,color,big){
  const t=this.add.text(x,y,txt,{fontFamily:'"Marcellus SC", Georgia, serif',fontSize:big?64:46,color,stroke:'#1a0a04',strokeThickness:8}).setOrigin(.5).setDepth(80).setScale(.4);
  this.tweens.add({targets:t,scale:1,duration:160,ease:'Back.easeOut'});
  this.tweens.add({targets:t,y:y-90,alpha:0,delay:450,duration:600,onComplete:()=>t.destroy()});
 }
 burst(x,y,tint,count=24,speed=380){const e=this.add.particles(x,y,'spark',{speed:{min:speed*.4,max:speed},angle:{min:0,max:360},lifespan:{min:300,max:600},scale:{start:1.1,end:0},rotate:{min:0,max:360},tint,blendMode:'ADD',emitting:false}).setDepth(70);e.explode(count);this.time.delayedCall(900,()=>e.destroy());}
 banner(txt,color='#f6d48a'){const t=this.add.text(W/2,H*.36,txt,{fontFamily:'"Marcellus SC", Georgia, serif',fontSize:78,color,stroke:'#1a0a04',strokeThickness:10}).setOrigin(.5).setDepth(90).setAlpha(0).setScale(1.6);
  return tw(this,{targets:t,alpha:1,scale:1,duration:260,ease:'Back.easeOut'}).then(()=>wait(this,700)).then(()=>tw(this,{targets:t,alpha:0,duration:300})).then(()=>t.destroy());}

 /* ---------- actions du héros ---------- */
 async strike(i,entry){
  const F=this.foes[i],[hx,hy]=this.heroHome,arm=this.heroParts.arm;
  await tw(this,{targets:this.hero,x:F.home[0]-200,y:F.home[1]+10,duration:170,ease:'Cubic.easeIn'});
  this.tweens.add({targets:arm,angle:-80,duration:80,yoyo:true,hold:90,ease:'Quad.easeOut'});
  await wait(this,70);await this.impact(i,entry,0xffe9a0);
  await tw(this,{targets:this.hero,x:hx,y:hy,duration:240,ease:'Cubic.easeOut'});
 }
 async impact(i,entry,tint,big){
  const F=this.foes[i],[x,y]=this.foeChest(i);
  if(entry&&entry.miss){await tw(this,{targets:F.c,x:F.home[0]+50,duration:110,yoyo:true,ease:'Quad.easeOut'});this.number(x,y-40,'Esquive','#e8f0ff');return;}
  this.burst(x,y,tint,big?40:22,big?520:380);this.cameras.main.shake(big?260:120,big?.016:.007);
  this.flash([F.im]);this.tweens.add({targets:F.c,x:F.home[0]+28,duration:70,yoyo:true});
  if(entry)this.number(x,y-30,String(entry.dmg),'#ffe9a0',big);
  if(this.ctx.battle.foes[i].hp<=0)this.kill(i);
  this.drawBars();
 }
 kill(i){const F=this.foes[i];this.tweens.killTweensOf(F.c);this.burst(F.c.x,F.c.y-150,0x998877,30,220);F.im.disableInteractive();
  this.tweens.add({targets:F.c,alpha:0,y:F.home[1]+30,duration:650,ease:'Quad.easeIn'});if(F.warn){F.warn.destroy();F.warn=null;}}
 async technique(i,entry){
  const el=this.ctx.battle.hero.el,col=ELC[el],[hx,hy]=this.heroChest(),F=this.foes[i],[tx,ty]=this.foeChest(i);
  const ring=this.add.image(hx,hy,'ring').setTint(col).setBlendMode('ADD').setDepth(50).setScale(.5);
  this.tweens.add({targets:ring,scale:9,alpha:0,duration:420,onComplete:()=>ring.destroy()});
  this.flash(Object.values(this.heroParts),col,120);
  await tw(this,{targets:this.heroParts.arm,angle:-70,duration:140,ease:'Quad.easeOut'});
  const orb=this.add.image(hx+90,hy-20,'mote').setTint(col).setBlendMode('ADD').setScale(3.5).setDepth(55);
  const trail=this.add.particles(0,0,'mote',{follow:orb,lifespan:350,scale:{start:2.2,end:0},alpha:{start:.8,end:0},tint:col,blendMode:'ADD',frequency:12}).setDepth(54);
  await tw(this,{targets:orb,x:tx,y:ty,duration:300,ease:'Quad.easeIn'});
  orb.destroy();trail.stop();this.time.delayedCall(400,()=>trail.destroy());
  this.tweens.add({targets:this.heroParts.arm,angle:0,duration:200});
  await this.impact(i,entry,col,true);
 }
 async ultimate(entries){
  const b=this.ctx.battle,col=ELC[b.hero.el];
  // encart : le héros traverse l'écran sur un bandeau doré, le nom de la technique s'affiche en grand
  await tw(this,{targets:this.overlay,fillAlpha:.72,duration:180});
  const band=this.add.graphics().setDepth(62);band.fillStyle(0xf6c94f,.9);band.fillPoints([{x:0,y:H*.30},{x:W,y:H*.22},{x:W,y:H*.56},{x:0,y:H*.64}],true);band.fillStyle(0x1a0a04,.55);band.fillPoints([{x:0,y:H*.33},{x:W,y:H*.25},{x:W,y:H*.53},{x:0,y:H*.61}],true);
  const lines=this.add.graphics().setDepth(63);const r=rng(7);for(let k=0;k<26;k++){const y=H*.24+r()*H*.38;lines.lineStyle(2+r()*3,0xfff4d0,.6);lines.lineBetween(0,y,W,y-60);}
  this.tweens.add({targets:lines,x:{from:300,to:-300},duration:700});
  const bust=this.add.image(-260,H*.43,'h_bust').setDepth(64).setScale(.78);
  const name=this.add.text(W*.62,H*.47,'« '+b.hero.sig+' »',{fontFamily:'"Marcellus SC", Georgia, serif',fontSize:50,color:'#fff4d0',stroke:'#6b3a08',strokeThickness:9,align:'center',wordWrap:{width:380}}).setOrigin(.5).setDepth(65).setAlpha(0);
  await tw(this,{targets:bust,x:W*.27,duration:260,ease:'Cubic.easeOut'});
  this.tweens.add({targets:name,alpha:1,x:W*.66,duration:240});
  await wait(this,700);
  await tw(this,{targets:[bust,name],alpha:0,duration:180});
  band.destroy();lines.destroy();bust.destroy();name.destroy();
  this.cameras.main.flash(160,255,240,200);
  await tw(this,{targets:this.overlay,fillAlpha:0,duration:120});
  // onde de cosmos sur tous les ennemis
  const [hx,hy]=this.heroChest();const ring=this.add.image(hx,hy,'ring').setTint(col).setBlendMode('ADD').setDepth(50).setScale(1);
  this.tweens.add({targets:ring,scale:40,alpha:0,duration:600,onComplete:()=>ring.destroy()});
  await wait(this,180);
  for(const e of entries){if(e.target==null)continue;await this.impact(e.target,e,col,true);await wait(this,90);}
 }
 async guard(entry){
  const col=ELC[this.ctx.battle.hero.el],[hx,hy]=this.heroChest();
  const dome=this.add.image(hx-20,hy+60,'mote').setTint(col).setBlendMode('ADD').setDepth(30).setScale(.5).setAlpha(.9);
  await tw(this,{targets:dome,scale:22,duration:260,ease:'Back.easeOut'});
  this.number(hx,hy-120,entry&&entry.m.match(/\+(\d+) PV/)?'+'+entry.m.match(/\+(\d+) PV/)[1]+' PV':'Garde','#9ff0b0');
  this.guardDome=dome;this.tweens.add({targets:dome,alpha:.35,duration:500});
 }
 clearGuard(){if(this.guardDome){const d=this.guardDome;this.guardDome=null;this.tweens.add({targets:d,alpha:0,duration:250,onComplete:()=>d.destroy()});}}

 /* ---------- actions des ennemis ---------- */
 async foeAct(e){
  const i=e.src;if(i==null)return;const F=this.foes[i];if(!F||F.c.alpha<.5)return;
  if(e.warn){if(!F.warn){F.warn=this.add.particles(F.home[0],F.home[1]-200,'mote',{x:{min:-90,max:90},y:{min:-220,max:200},speedY:{min:-80,max:-30},lifespan:900,scale:{start:1.4,end:0},alpha:{start:.8,end:0},tint:0xff3a20,blendMode:'ADD',frequency:40}).setDepth(F.c.depth-1);}
   this.number(F.home[0],F.home[1]-520,'!','#ffb020',true);await wait(this,500);this.drawBars();return;}
  const [hx,hy]=this.heroHome;
  await tw(this,{targets:F.c,x:hx+190,y:hy-12,duration:e.big?240:180,ease:'Cubic.easeIn'});
  if(e.miss){this.tweens.add({targets:this.hero,x:hx-60,duration:110,yoyo:true});this.number(hx,hy-420,'Esquive','#e8f0ff');}
  else{this.flash(Object.values(this.heroParts),0xff5a4a,100);this.tweens.add({targets:this.hero,x:hx-26,duration:80,yoyo:true});
   this.burst(hx+30,hy-300,0xff6a4a,e.big?36:16,e.big?480:300);this.cameras.main.shake(e.big?320:120,e.big?.02:.006);this.number(hx+10,hy-340,'-'+e.dmg,'#ff7a6a',e.big);}
  if(e.big&&F.warn){F.warn.destroy();F.warn=null;}
  await tw(this,{targets:F.c,x:F.home[0],y:F.home[1],duration:260,ease:'Cubic.easeOut'});
  this.drawBars();
 }
 async victory(){this.aura.frequency=30;this.tweens.add({targets:this.hero,y:this.heroHome[1]-60,duration:260,yoyo:true,ease:'Quad.easeOut'});const [hx,hy]=this.heroChest();this.burst(hx,hy,0xffd27a,60,520);await this.banner('Victoire !');}
 async defeat(){this.aura.stop();this.tweens.killTweensOf(this.hero);await tw(this,{targets:this.hero,angle:-8,y:this.heroHome[1]+20,alpha:.55,duration:600});await this.banner('Défaite…','#ff8a7a');}
}

/* ---------- interface publique ---------- */
// Monte la scène dans un élément et renvoie un contrôleur : play(action, entrées du journal) rejoue un tour animé.
export function mountBattle(parent,ctx){
 let scene=null;const ready=new Promise(res=>{ctx.onReady=s=>{scene=s;res(s);};});
 const game=new Phaser.Game({type:Phaser.AUTO,parent,width:W,height:H,backgroundColor:'#120c0a',banner:false,audio:{noAudio:true},
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},input:{touch:{capture:false}},scene:[]});
 game.scene.add('battle',BattleScene,true,ctx);
 return{
  ready,
  async play(act,entries){
   const s=await ready;
   const heroE=entries.filter(e=>e.t==='hero'),foeE=entries.filter(e=>e.t==='foe'),info=entries.filter(e=>e.t==='info');
   if(act!=='guard')s.clearGuard();
   if(act==='strike'&&heroE[0])await s.strike(heroE[0].target,heroE[0]);
   else if(act==='tech'&&heroE[0])await s.technique(heroE[0].target,heroE[0]);
   else if(act==='sig')await s.ultimate(heroE.filter(e=>e.target!=null));
   else if(act==='guard')await s.guard(heroE[0]);
   for(const e of foeE){await s.foeAct(e);await wait(s,80);}
   const b=ctx.battle;
   if(b.over){if(b.result==='win')await s.victory();else if(b.result==='lose')await s.defeat();else await s.banner('Égalité','#e8f0ff');}
   else if(info.length)s.drawBars();
   s.drawBars();
  },
  refresh(){if(scene)scene.drawBars();},
  destroy(){game.destroy(true);}
 };
}
