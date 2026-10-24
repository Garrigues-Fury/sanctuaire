/* Décor fixe de la carte, dessiné en Canvas 2D comme dans le prototype, puis donné à Phaser comme texture. */
import { DEPOT, HOUSE_PTS, SITES, VH, VW } from '../core/data/map.js';
import { S } from '../core/state.js';
import { mulberry32, shade } from '../core/util.js';

function siteLabel(g,id,txt){const rc=SITES[id].r;g.font='600 8.5px "Alegreya Sans",system-ui,sans-serif';g.textAlign='center';g.fillStyle='rgba(28,18,14,.75)';const w=g.measureText(txt).width+8;g.fillRect(rc[0]+rc[2]/2-w/2,rc[1]+rc[3]-1,w,11);g.fillStyle='#ece6d8';g.fillText(txt,rc[0]+rc[2]/2,rc[1]+rc[3]+7.5);}
function ruins(g,rc){g.fillStyle='rgba(120,116,104,.35)';for(let i=0;i<5;i++){g.fillRect(rc[0]+10+i*(rc[2]-20)/5,rc[1]+rc[3]-14-(i%2)*6,5,8+(i%3)*4);}g.strokeStyle='rgba(236,230,216,.18)';g.setLineDash([3,3]);g.strokeRect(rc[0]+2,rc[1]+2,rc[2]-4,rc[3]-4);g.setLineDash([]);}
function temple(g,x,y,w,lv,gold){
 if(lv<=0){g.fillStyle='#6f6a60';g.fillRect(x-w/2,y,w,2.5);for(let i=0;i<4;i++){const h=3+((i*7)%5);g.fillRect(x-w/2+1.5+i*(w-3)/3.2,y-h,2,h);}return;}
 const h=5+lv*1.3;const c=gold?'#e9d7a8':'#d8d1c1';
 g.fillStyle=shade(c,-.25);g.fillRect(x-w/2-1,y,w+2,2.5);
 g.fillStyle=c;for(let i=0;i<5;i++)g.fillRect(x-w/2+1+i*(w-3)/4.5,y-h,1.8,h);
 g.fillRect(x-w/2-1,y-h-1.5,w+2,1.8);
 g.beginPath();g.moveTo(x-w/2-1.5,y-h-1.5);g.lineTo(x,y-h-1.5-w*.28);g.lineTo(x+w/2+1.5,y-h-1.5);g.closePath();g.fill();
 if(gold){g.fillStyle='rgba(243,213,141,.55)';g.beginPath();g.arc(x,y-h-3.5,1.6,0,7);g.fill();}
}
// Dessine le décor dans le contexte g (déjà effacé), à l'échelle R pixels par unité de carte.
export function drawBackground(g,R){
 g.setTransform(R,0,0,R,0,0);g.clearRect(0,0,VW,VH);
 const sky=g.createLinearGradient(0,0,0,190);sky.addColorStop(0,'#3b2440');sky.addColorStop(.55,'#b65d3c');sky.addColorStop(1,'#f0b469');g.fillStyle=sky;g.fillRect(0,0,VW,190);const sn=g.createRadialGradient(300,150,4,300,150,90);sn.addColorStop(0,'rgba(255,240,200,.95)');sn.addColorStop(.25,'rgba(255,210,140,.5)');sn.addColorStop(1,'rgba(255,190,120,0)');g.fillStyle=sn;g.fillRect(0,0,VW,190);
 const r=mulberry32(7);for(let i=0;i<40;i++){g.fillStyle='rgba(255,248,230,'+(.15+r()*.5)+')';g.fillRect(r()*VW,r()*60,r()<.1?1.4:.8,r()<.1?1.4:.8);}
 const hill=g.createLinearGradient(0,20,0,190);hill.addColorStop(0,'#5a3c35');hill.addColorStop(1,'#33241f');g.fillStyle=hill;
 g.beginPath();g.moveTo(0,188);g.quadraticCurveTo(110,120,150,40);g.quadraticCurveTo(180,4,210,40);g.quadraticCurveTo(250,120,VW,188);g.closePath();g.fill();
 const gr=g.createLinearGradient(0,180,0,VH);gr.addColorStop(0,'#4a3b28');gr.addColorStop(1,'#241c14');g.fillStyle=gr;g.fillRect(0,182,VW,VH-182);
 g.strokeStyle='rgba(216,209,193,.35)';g.lineWidth=2;g.beginPath();g.moveTo(180,184);HOUSE_PTS.forEach(p=>g.lineTo(p[0],p[1]+1));g.lineTo(180,30);g.stroke();
 HOUSE_PTS.forEach((p,i)=>{const guard=S.knights.some(k=>k.rank==='or'&&k.sign===i);temple(g,p[0],p[1],15,S.houses[i],guard);});
 temple(g,180,32,26,3,false);
 g.fillStyle='#d8d1c1';g.fillRect(178.5,6,3,13);g.beginPath();g.arc(180,5.5,2.2,0,7);g.fill();g.fillStyle='rgba(243,213,141,.5)';g.beginPath();g.arc(180,5.5,4.5,0,7);g.fill();
 const B=S.b;let rc;
 rc=SITES.carriere.r;g.fillStyle='#77746c';g.beginPath();g.moveTo(rc[0],rc[1]+rc[3]-4);g.lineTo(rc[0]+6,rc[1]+4);g.lineTo(rc[0]+rc[2]-20,rc[1]);g.lineTo(rc[0]+rc[2],rc[1]+rc[3]-4);g.closePath();g.fill();
 g.fillStyle='#9a968c';g.fillRect(rc[0]+12,rc[1]+10,rc[2]-36,10);g.fillStyle='#ece6d8';for(let i=0;i<Math.min(8,2+B.carriere);i++)g.fillRect(rc[0]+14+(i%4)*12,rc[1]+rc[3]-14-Math.floor(i/4)*7,9,5);
 rc=SITES.biblio.r;if(B.biblio>0){temple(g,rc[0]+rc[2]/2,rc[1]+rc[3]-6,rc[2]-24,Math.min(6,1+B.biblio),false);g.fillStyle='rgba(169,155,224,.35)';g.beginPath();g.arc(rc[0]+rc[2]/2,rc[1]+rc[3]-14,6,0,7);g.fill();}else ruins(g,rc);
 rc=SITES.dortoirs.r;g.fillStyle='#bcae92';g.fillRect(rc[0]+6,rc[1]+16,rc[2]-12,rc[3]-24);g.fillStyle='#8a4a36';g.beginPath();g.moveTo(rc[0]+2,rc[1]+17);g.lineTo(rc[0]+rc[2]/2,rc[1]+6);g.lineTo(rc[0]+rc[2]-2,rc[1]+17);g.closePath();g.fill();g.fillStyle='#2a2216';for(let i=0;i<Math.min(5,1+B.dortoirs);i++)g.fillRect(rc[0]+11+i*9,rc[1]+22,4,5);
 rc=SITES.mine.r;g.fillStyle='#4b4640';g.beginPath();g.moveTo(rc[0],rc[1]+rc[3]-4);g.lineTo(rc[0]+18,rc[1]);g.lineTo(rc[0]+rc[2]-4,rc[1]+6);g.lineTo(rc[0]+rc[2],rc[1]+rc[3]-4);g.closePath();g.fill();
 g.fillStyle='#0b0a09';g.beginPath();g.arc(rc[0]+rc[2]/2,rc[1]+rc[3]-10,9,Math.PI,0);g.fill();g.fillRect(rc[0]+rc[2]/2-9,rc[1]+rc[3]-10,18,6);
 rc=SITES.champs.r;g.fillStyle='#3a3a22';g.fillRect(rc[0]+3,rc[1]+4,rc[2]-6,rc[3]-10);g.strokeStyle='#4f4b2c';g.lineWidth=1;for(let y=rc[1]+10;y<rc[1]+rc[3]-8;y+=7){g.beginPath();g.moveTo(rc[0]+5,y);g.lineTo(rc[0]+rc[2]-5,y);g.stroke();}
 const trees=Math.min(14,3+B.champs*2);for(let i=0;i<trees;i++){const tx=rc[0]+10+(i%5)*18,ty=rc[1]+12+Math.floor(i/5)*16;g.fillStyle='#5a4630';g.fillRect(tx-.6,ty,1.4,5);g.fillStyle=i%2?'#6f8f4e':'#829f5a';g.beginPath();g.arc(tx,ty,4.5,0,7);g.fill();}
 rc=SITES.arene.r;g.fillStyle='#8f7a55';g.beginPath();g.ellipse(rc[0]+rc[2]/2,rc[1]+rc[3]/2+2,rc[2]/2-2,rc[3]/2-6,0,0,7);g.fill();g.fillStyle='#bba077';g.beginPath();g.ellipse(rc[0]+rc[2]/2,rc[1]+rc[3]/2+2,rc[2]/2-8,rc[3]/2-11,0,0,7);g.fill();
 rc=SITES.artisans.r;const hs=Math.min(6,2+B.artisans);for(let i=0;i<hs;i++){const hx=rc[0]+8+(i%3)*15,hy=rc[1]+12+Math.floor(i/3)*18;g.fillStyle='#cdbf9f';g.fillRect(hx-5,hy,10,8);g.fillStyle='#a0563c';g.beginPath();g.moveTo(hx-6.5,hy+.5);g.lineTo(hx,hy-5);g.lineTo(hx+6.5,hy+.5);g.closePath();g.fill();}
 rc=SITES.forge.r;if(B.forge>0){g.fillStyle='#6a5a48';g.fillRect(rc[0]+10,rc[1]+18,rc[2]-20,rc[3]-30);g.fillStyle='#3d3128';g.beginPath();g.moveTo(rc[0]+6,rc[1]+19);g.lineTo(rc[0]+rc[2]/2,rc[1]+8);g.lineTo(rc[0]+rc[2]-6,rc[1]+19);g.closePath();g.fill();g.fillStyle='#4a3e33';g.fillRect(rc[0]+rc[2]-22,rc[1]+2,7,14);g.fillStyle='#1a120c';g.fillRect(rc[0]+rc[2]/2-6,rc[1]+rc[3]-24,12,12);}else ruins(g,rc);
 rc=SITES.jardin.r;if(B.jardin>0){const cols=['#9a7fd0','#8fb08a','#e8d9a0','#c98aa0'];const beds=Math.min(8,2+B.jardin*2);for(let i=0;i<beds;i++){const bx=rc[0]+6+(i%4)*24,by=rc[1]+8+Math.floor(i/4)*20;g.fillStyle='#3d3424';g.fillRect(bx,by,20,13);g.fillStyle=cols[i%4];for(let j=0;j<6;j++){g.beginPath();g.arc(bx+3+(j%3)*7,by+3.5+Math.floor(j/3)*6,1.8,0,7);g.fill();}}}else ruins(g,rc);
 rc=SITES.herbo.r;if(B.herbo>0){g.fillStyle='#a89070';g.beginPath();g.ellipse(rc[0]+rc[2]/2,rc[1]+rc[3]-16,26,13,0,Math.PI,0);g.fill();g.fillRect(rc[0]+rc[2]/2-26,rc[1]+rc[3]-16,52,8);g.fillStyle='#5b4a6e';g.beginPath();g.moveTo(rc[0]+rc[2]/2-30,rc[1]+rc[3]-26);g.lineTo(rc[0]+rc[2]/2,rc[1]+6);g.lineTo(rc[0]+rc[2]/2+30,rc[1]+rc[3]-26);g.closePath();g.fill();g.fillStyle='#2b2230';g.beginPath();g.arc(rc[0]+rc[2]/2+18,rc[1]+rc[3]-10,5,0,Math.PI);g.fill();}else ruins(g,rc);
 rc=SITES.atelier.r;if(B.atelier>0){g.fillStyle='#7a6650';g.fillRect(rc[0]+8,rc[1]+16,rc[2]-40,rc[3]-26);g.fillStyle='#4f3f30';g.beginPath();g.moveTo(rc[0]+4,rc[1]+17);g.lineTo(rc[0]+(rc[2]-32)/2+4,rc[1]+5);g.lineTo(rc[0]+rc[2]-28,rc[1]+17);g.closePath();g.fill();g.fillStyle='#9b7a50';for(let i=0;i<4;i++)g.fillRect(rc[0]+rc[2]-26,rc[1]+18+i*5,20,3);g.fillStyle='#3a3836';g.fillRect(rc[0]+rc[2]-22,rc[1]+rc[3]-14,10,4);}else ruins(g,rc);
 g.fillStyle='#9c8a6a';g.fillRect(DEPOT[0]-9,DEPOT[1]-7,18,8);g.fillStyle='#b8705a';for(let i=0;i<3;i++){g.beginPath();g.ellipse(DEPOT[0]-6+i*6,DEPOT[1]-9,2.4,3.2,0,0,7);g.fill();}
 Object.keys(SITES).forEach(id=>{const l=S.b[id];siteLabel(g,id,SITES[id].n+(l?' '+l:id==='artisans'?'':' · ruines'));});
}
// Le décor ne change que si un bâtiment, une maison ou un gardien d'or change.
export function backgroundSig(){return JSON.stringify(S.b)+S.houses.join()+S.knights.filter(k=>k.rank==='or').map(k=>k.sign).join();}
