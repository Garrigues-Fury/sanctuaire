/* Portraits procéduraux (générateur de secours). */
import { looks } from '../core/appearance.js';
import { dataUrl, specOf, svgBust, svgFull } from '../art/character.js';
import { SIGNS } from '../core/data/world.js';
import { mulberry32, shade } from '../core/util.js';

export const PC=new Map();
export const ARMC={bronze:['#7a4420','#c98547','#f0c08a'],argent:['#6c7486','#c4ccd8','#f6f8fb'],or:['#8f6112','#e0ac3c','#fbe7a6'],garde:['#3a2e24','#7a6247','#b49770']};
export function strand(g,x0,y0,x1,y1,w,bend){g.beginPath();g.moveTo(x0-w/2,y0);g.quadraticCurveTo((x0+x1)/2+bend-w/3,(y0+y1)/2,x1,y1);g.quadraticCurveTo((x0+x1)/2+bend+w/3,(y0+y1)/2,x0+w/2,y0);g.closePath();g.fill();}
// Portrait par le générateur anime (src/art). opts.faction pour un ennemi, opts.elder pour un ancien.
const PC2=new Map();
export function portrait(p,rank,opts={}){
 const key=p.seed+'|'+(rank||'')+'|'+p.nat+'|'+p.sex+'|'+(p.cons||'')+'|'+(opts.faction||'')+'|'+(p.age!=null&&p.age<17?'c':'');
 if(PC2.has(key))return PC2.get(key);
 const s=specOf(p,{rank:rank&&rank!=='garde'?rank:null,faction:opts.faction||(rank==='garde'?'bandits':undefined),elder:opts.elder,child:!rank&&!opts.faction&&(p.age!=null?p.age<17:!!p.child)});
 const url=dataUrl(svgBust(s,{size:256}));PC2.set(key,url);return url;
}
export function fullBody(p,rank,opts={}){return dataUrl(svgFull(specOf(p,{rank:rank||null,faction:opts.faction}),{w:300,h:675}));}
// Ancien générateur (gardé en secours).
export function portraitOld(p,rank){
 const key=p.seed+'|'+(rank||'')+'|'+p.nat+'|'+p.sex;if(PC.has(key))return PC.get(key);
 const W=256,c=document.createElement('canvas');c.width=c.height=W;const g=c.getContext('2d');
 const L=looks(p),r=L.r,F=p.sex==='F';const skin=L.skin,shadeSk=shade(skin,-.18),hair=L.hair,hairHi=shade(hair,L.hk==='noir'?.22:.28),hairLo=shade(hair,-.3);
 const elc={feu:'#e2804f',eau:'#62a6d8',air:'#dfe6f0',terre:'#c49b5c'}[SIGNS[p.sign].el];
 // ciel du couchant et ruines
 const sky=g.createLinearGradient(0,0,0,W);sky.addColorStop(0,'#f4d593');sky.addColorStop(.45,'#de9a5a');sky.addColorStop(1,'#4e2a24');g.fillStyle=sky;g.fillRect(0,0,W,W);
 const sun=g.createRadialGradient(196,78,4,196,78,120);sun.addColorStop(0,'rgba(255,244,214,.95)');sun.addColorStop(.3,'rgba(255,222,160,.45)');sun.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=sun;g.fillRect(0,0,W,W);
 g.fillStyle='rgba(120,70,50,.35)';g.beginPath();g.moveTo(0,170);g.lineTo(40,130);g.lineTo(80,150);g.lineTo(130,118);g.lineTo(190,152);g.lineTo(256,124);g.lineTo(256,256);g.lineTo(0,256);g.fill();
 g.fillStyle='rgba(70,38,32,.55)';const ru=mulberry32(p.seed&255);for(let i=0;i<5;i++){const x=6+i*13+ru()*4,h=40+ru()*50;g.fillRect(x,190-h,7,h+70);}g.fillRect(2,128,70,8);
 g.fillRect(212,90,22,160);g.beginPath();g.moveTo(206,92);g.lineTo(223,64);g.lineTo(240,92);g.fill();
 g.fillStyle=elc;g.globalAlpha=.13;g.fillRect(0,0,W,W);g.globalAlpha=1;
 for(let i=0;i<24;i++){g.fillStyle='rgba(255,236,190,'+(.15+ru()*.4)+')';g.beginPath();g.arc(ru()*W,ru()*W,ru()*1.4+.4,0,7);g.fill();}
 g.save();g.translate(128,250);g.scale(1.2,1.2);g.translate(-128,-250);
 const cx=128,hw=F?37:40,chin=F?168:172,crown=60;
 const long=F?r()<.72:r()<.18,pony=r()<(F?.25:.12);
 // cheveux arrière
 if(L.curly){g.fillStyle=hairLo;for(let i=0;i<26;i++){const a=Math.PI*(.95+i/25*1.1),rr=hw+12+r()*8;g.beginPath();g.arc(cx+Math.cos(a)*rr,108+Math.sin(a)*rr*1.05,11+r()*6,0,7);g.fill();}if(F&&r()<.5){for(let i=0;i<7;i++){g.fillRect(cx-hw-6+i*((hw*2+12)/6)-3,108,7,95+r()*25);}}}
 else if(long){const lg=g.createLinearGradient(0,70,0,240);lg.addColorStop(0,hair);lg.addColorStop(1,hairLo);g.fillStyle=lg;g.beginPath();g.moveTo(cx-hw-10,92);g.quadraticCurveTo(cx-hw-26,190,cx-hw-14,236);g.lineTo(cx+hw+14,236);g.quadraticCurveTo(cx+hw+26,190,cx+hw+10,92);g.closePath();g.fill();}
 if(pony&&!L.curly){g.fillStyle=hair;g.save();g.translate(cx+20,60);g.rotate(.5);for(let i=0;i<7;i++){strand(g,0,0,40+r()*30,(i-3)*14+20,16,8);}g.restore();g.fillStyle=hairLo;g.beginPath();g.arc(cx+18,58,9,0,7);g.fill();}
 // buste et vêtements
 g.fillStyle=shadeSk;g.beginPath();g.moveTo(cx-17,150);g.lineTo(cx+17,150);g.lineTo(cx+21,200);g.lineTo(cx-21,200);g.closePath();g.fill();
 g.fillStyle='rgba(60,30,20,.25)';g.beginPath();g.ellipse(cx,166,20,9,0,0,7);g.fill();
 const sh=(fill)=>{g.fillStyle=fill;g.beginPath();g.moveTo(14,256);g.bezierCurveTo(22,214,52,198,cx-24,188);g.lineTo(cx+24,188);g.bezierCurveTo(204,198,234,214,242,256);g.closePath();g.fill();};
 if(!rank){
  const tg=g.createLinearGradient(30,190,230,256);tg.addColorStop(0,'#f4ecdb');tg.addColorStop(1,'#bfb196');sh(tg);
  g.fillStyle='#2e2621';g.beginPath();g.moveTo(cx-22,190);g.lineTo(cx,236);g.lineTo(cx+22,190);g.closePath();g.fill();
  g.fillStyle=shadeSk;g.beginPath();g.moveTo(cx-16,190);g.lineTo(cx,218);g.lineTo(cx+16,190);g.closePath();g.fill();
  g.strokeStyle='#a99a7c';g.lineWidth=3;g.beginPath();g.moveTo(cx-26,188);g.lineTo(cx+8,256);g.moveTo(cx+26,188);g.lineTo(cx-4,248);g.stroke();
  g.fillStyle='#5b3a5e';g.fillRect(40,244,176,12);
  g.strokeStyle='rgba(120,100,80,.45)';g.lineWidth=1.5;for(let i=0;i<4;i++){g.beginPath();g.moveTo(44+i*14,222+i*4);g.quadraticCurveTo(60+i*14,236,52+i*12,256);g.stroke();}
 }else{
  const [d,m,l]=ARMC[rank];
  sh('#231c1a');
  g.fillStyle='#2f2724';g.beginPath();g.moveTo(cx-22,188);g.lineTo(cx,206);g.lineTo(cx+22,188);g.lineTo(cx+20,200);g.lineTo(cx,214);g.lineTo(cx-20,200);g.closePath();g.fill();
  if(rank==='garde'){
   g.strokeStyle='#8a6440';g.lineWidth=9;g.beginPath();g.moveTo(cx-60,200);g.lineTo(cx+50,256);g.stroke();
   g.fillStyle='#c9a46a';g.fillRect(cx-8,224,14,11);g.fillStyle='#231c1a';g.fillRect(cx-4,227,6,5);
   const pg=g.createLinearGradient(170,190,240,240);pg.addColorStop(0,l);pg.addColorStop(1,d);g.fillStyle=pg;g.beginPath();g.ellipse(196,212,34,22,-.35,0,7);g.fill();
   g.strokeStyle=d;g.lineWidth=2;g.beginPath();g.ellipse(196,212,26,15,-.35,Math.PI*1.1,Math.PI*1.9);g.stroke();
  }else{
   const cg=g.createLinearGradient(cx-50,200,cx+50,256);cg.addColorStop(0,l);cg.addColorStop(.45,m);cg.addColorStop(1,d);g.fillStyle=cg;
   g.beginPath();g.moveTo(cx-48,212);g.lineTo(cx-16,204);g.lineTo(cx,216);g.lineTo(cx+16,204);g.lineTo(cx+48,212);g.lineTo(cx+54,256);g.lineTo(cx-54,256);g.closePath();g.fill();
   g.strokeStyle=shade(d,-.3);g.lineWidth=1.6;g.beginPath();g.moveTo(cx,216);g.lineTo(cx,256);for(let i=0;i<2;i++){g.moveTo(cx-46,228+i*14);g.quadraticCurveTo(cx,238+i*14,cx+46,228+i*14);}g.stroke();
   g.fillStyle=elc;g.beginPath();g.arc(cx,226,4.5,0,7);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(cx-1.4,224.6,1.4,0,7);g.fill();
   for(const s of[-1,1]){for(let k=2;k>=0;k--){const px=cx+s*(70+k*4),py=200+k*13;const pg=g.createLinearGradient(px-30,py-20,px+30,py+20);pg.addColorStop(0,s<0?l:m);pg.addColorStop(1,d);g.fillStyle=pg;g.beginPath();g.ellipse(px,py,38-k*3,17,s*-.3,Math.PI*(s<0?.95:1.05)-.6,Math.PI*(s<0?2.05:1.95)+.6);g.fill();g.strokeStyle=shade(d,-.35);g.lineWidth=1.3;g.stroke();
     g.fillStyle=l;for(let q=-1;q<=1;q++){g.beginPath();g.arc(px+q*14,py+4+Math.abs(q)*2,1.8,0,7);g.fill();}}
    g.fillStyle=l;g.beginPath();g.moveTo(cx+s*58,188);g.lineTo(cx+s*66,166);g.lineTo(cx+s*72,190);g.closePath();g.fill();}
  }
 }
 // oreilles et visage
 g.fillStyle=skin;g.beginPath();g.ellipse(cx-hw+1,118,6,10,-.15,0,7);g.fill();g.beginPath();g.ellipse(cx+hw-1,118,6,10,.15,0,7);g.fill();
 g.beginPath();g.moveTo(cx-hw,96);g.bezierCurveTo(cx-hw,132,cx-hw*.58,(F?156:160),cx,chin);g.bezierCurveTo(cx+hw*.58,(F?156:160),cx+hw,132,cx+hw,96);g.bezierCurveTo(cx+hw,52,cx-hw,52,cx-hw,96);g.closePath();g.fill();
 g.save();g.clip();const fs=g.createLinearGradient(cx-hw,0,cx+hw,0);fs.addColorStop(0,'rgba(90,40,30,.28)');fs.addColorStop(.55,'rgba(90,40,30,0)');fs.addColorStop(1,'rgba(255,220,170,.18)');g.fillStyle=fs;g.fillRect(0,0,W,W);g.restore();
 if(F){g.fillStyle='rgba(230,110,100,.18)';g.beginPath();g.ellipse(cx-24,140,9,5,0,0,7);g.fill();g.beginPath();g.ellipse(cx+24,140,9,5,0,0,7);g.fill();}
 // tatouages
 if(L.tattoo){g.strokeStyle='rgba(30,22,26,.75)';g.lineWidth=2.4;g.lineCap='round';const side=r()<.5?-1:1;g.beginPath();g.moveTo(cx+side*8,174);g.quadraticCurveTo(cx+side*20,182,cx+side*12,194);g.moveTo(cx+side*14,178);g.arc(cx+side*16,186,5,-1.5,2.6);g.stroke();if(r()<.5){g.beginPath();g.moveTo(cx+side*30,128);g.lineTo(cx+side*34,146);g.moveTo(cx+side*25,131);g.lineTo(cx+side*28,145);g.stroke();}}
 // yeux
 const ey=121,ew=F?14:13,eh=(F?9:7.5)*(L.mono?.78:1);
 for(const s of[-1,1]){const ex=cx+s*19;
  g.save();g.beginPath();g.moveTo(ex-ew,ey+1);g.bezierCurveTo(ex-ew*.5,ey-eh*1.3,ex+ew*.5,ey-eh*1.3,ex+ew,ey-(L.mono?2:0));g.bezierCurveTo(ex+ew*.5,ey+eh*.95,ex-ew*.5,ey+eh*.95,ex-ew,ey+1);g.closePath();g.fillStyle='#fffaf2';g.fill();g.clip();
  const ig=g.createLinearGradient(0,ey-eh,0,ey+eh);ig.addColorStop(0,shade(L.eye,-.55));ig.addColorStop(.55,L.eye);ig.addColorStop(1,shade(L.eye,.35));g.fillStyle=ig;g.beginPath();g.ellipse(ex+s*-1,ey+1,7.4,eh*1.05,0,0,7);g.fill();
  g.fillStyle='#120c0c';g.beginPath();g.ellipse(ex+s*-1,ey+1,3.2,eh*.55,0,0,7);g.fill();
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(ex-ew,ey-eh,ew*2,3);
  g.fillStyle='#fff';g.beginPath();g.arc(ex+s*-1+2.6,ey-2.2,2.3,0,7);g.fill();g.beginPath();g.arc(ex+s*-1-2.4,ey+3.6,1.1,0,7);g.fill();g.restore();
  g.strokeStyle='#1a1214';g.lineCap='round';g.lineWidth=F?3.4:2.8;g.beginPath();g.moveTo(ex-s*ew,ey+(s<0?1:1));g.bezierCurveTo(ex-s*ew*.5,ey-eh*1.3,ex+s*ew*.5,ey-eh*1.3,ex+s*ew,ey-(L.mono?2:0));g.stroke();
  if(F){g.lineWidth=2.2;g.beginPath();g.moveTo(ex+s*ew,ey-(L.mono?2:0));g.lineTo(ex+s*(ew+5),ey-5);g.stroke();}
  g.lineWidth=1;g.strokeStyle='rgba(60,30,30,.6)';g.beginPath();g.moveTo(ex-ew*.6,ey+eh*.85);g.quadraticCurveTo(ex,ey+eh*1.05,ex+ew*.6,ey+eh*.85);g.stroke();
  const bi=L.fierce?-1:1;g.strokeStyle=hairLo;g.lineWidth=F?2.4:3.6;g.beginPath();g.moveTo(cx+s*8,ey-eh-8+(L.fierce?3:0));g.quadraticCurveTo(cx+s*19,ey-eh-13+(bi>0?0:1),cx+s*31,ey-eh-8-(L.fierce?2:0));g.stroke();}
 // nez et bouche
 g.strokeStyle=shade(skin,-.32);g.lineWidth=1.6;g.beginPath();g.moveTo(cx+2,136);g.lineTo(cx-1,143);g.stroke();g.fillStyle='rgba(90,40,30,.18)';g.beginPath();g.ellipse(cx,144,4,1.6,0,0,7);g.fill();
 if(L.smile){g.fillStyle='#5a1f22';g.beginPath();g.moveTo(cx-9,152);g.quadraticCurveTo(cx,163,cx+9,152);g.closePath();g.fill();g.fillStyle='#fff';g.fillRect(cx-7,152,14,2.2);}
 else{g.strokeStyle=F?'#a24f55':shade(skin,-.42);g.lineWidth=2;g.beginPath();g.moveTo(cx-8,153);g.quadraticCurveTo(cx,155.5,cx+8,153);g.stroke();g.fillStyle='rgba(120,50,50,.15)';g.beginPath();g.ellipse(cx,157.5,5,1.8,0,0,7);g.fill();}
 // boucles d’oreilles
 if(L.earring){g.strokeStyle='#e9c46a';g.lineWidth=2;g.beginPath();g.arc(cx-hw+1,131,3.5,0,7);g.stroke();g.beginPath();g.arc(cx+hw-1,131,3.5,0,7);g.stroke();}
 // cheveux avant
 const hg=g.createLinearGradient(cx-hw,40,cx+hw,120);hg.addColorStop(0,hairHi);hg.addColorStop(.6,hair);hg.addColorStop(1,hairLo);g.fillStyle=hg;
 if(L.curly){for(let i=0;i<22;i++){const a=Math.PI*(1.02+i/21*.96),rr=hw+3+r()*4;g.beginPath();g.arc(cx+Math.cos(a)*rr,100+Math.sin(a)*rr*1.1,10+r()*5,0,7);g.fill();}g.beginPath();g.ellipse(cx,72,hw+4,20,0,0,7);g.fill();}
 else{
  g.beginPath();g.ellipse(cx,88,hw+5,32,0,Math.PI,0);g.fill();g.beginPath();g.ellipse(cx,80,hw+2,26,0,0,7);g.fill();
  const style=Math.floor(L.style*(F?4:4));
  const n=F?7:6,sp=(hw*2+10)/n;
  if(!F&&style===0){for(let i=0;i<9;i++){const x0=cx-hw+i*(hw*2)/8;strand(g,x0,70,x0+(i-4)*4+(r()-.5)*10,44+r()*12+Math.abs(i-4)*3,15,(r()-.5)*8);}}
  for(let i=0;i<n;i++){const x0=cx-hw-2+sp*(i+.5);const tip=(style===2?108:style===3&&F?96:102)+r()*(style===2?4:14);const bend=(style===1?10:style===3?-12:0)+(r()-.5)*8;strand(g,x0,70,x0+bend*.8,tip,sp*1.25,bend);}
  const sideLen=long?205:F?162:(style===2?150:126);
  strand(g,cx-hw+2,84,cx-hw-2+(r()-.5)*6,sideLen,16,-6);strand(g,cx+hw-2,84,cx+hw+2+(r()-.5)*6,sideLen,16,6);
  if(L.wavy){g.strokeStyle=hairLo;g.lineWidth=2;for(let i=0;i<4;i++){g.beginPath();g.moveTo(cx-hw+i*20,76);g.bezierCurveTo(cx-hw+i*20+6,84,cx-hw+i*20-4,92,cx-hw+i*20+3,100);g.stroke();}}
  g.strokeStyle='rgba(255,236,200,'+(L.hk==='noir'?.32:.42)+')';g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.moveTo(cx-24+i*14,62+i);g.quadraticCurveTo(cx-18+i*14,70,cx-20+i*14,82);g.stroke();}
 }
 g.strokeStyle='rgba(255,210,140,.45)';g.lineWidth=2.5;g.beginPath();g.arc(cx,92,hw+6,-1.3,-.15);g.stroke();
 // diadème
 if(rank==='or'||rank==='argent'){const [d,m,l]=ARMC[rank];g.strokeStyle=m;g.lineWidth=4;g.beginPath();g.ellipse(cx,84,hw+3,11,0,Math.PI*1.06,Math.PI*1.94);g.stroke();g.fillStyle=l;g.beginPath();g.moveTo(cx,64);g.lineTo(cx+7,73);g.lineTo(cx,82);g.lineTo(cx-7,73);g.closePath();g.fill();g.fillStyle=elc;g.beginPath();g.arc(cx,73,2.6,0,7);g.fill();}
 g.restore();
 // vignette
 const vg=g.createRadialGradient(cx,120,90,cx,128,190);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(30,12,8,.45)');g.fillStyle=vg;g.fillRect(0,0,W,W);
 const url=c.toDataURL('image/jpeg',.88);PC.set(key,url);return url;
}
