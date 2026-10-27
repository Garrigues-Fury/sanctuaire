/* Écran des mini-jeux, en plein écran, au doigt (règles et niveaux dans core/minigames.js).
   cur.k : la constellation ; son jeu (gameOf) dit quelle sorte de jeu afficher. */
import { MG_LEVELS, gameOf } from '../core/data/minigames.js';
import { CONS_BY } from '../core/data/world.js';
import { flows, levelOf, mgFail, mgOf, mgWin, rot, slide } from '../core/minigames.js';
import { save } from '../core/save.js';
import { esc } from '../core/util.js';
import { pluck, sfx } from '../audio/audio.js';
import { render } from './app.js';

let root=null,cur=null,stop=null;
const $=s=>root.querySelector(s);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

export function openMinigame(k,L){
 if(!root){root=document.createElement('div');root.id='mg';document.body.appendChild(root);root.addEventListener('click',onClick);}
 cur={k,L};root.hidden=false;start();
}
function close(){if(stop)stop();stop=null;root.hidden=true;cur=null;render();}
function frame(body,status){
 const g=gameOf(cur.k);
 root.innerHTML='<div class="mg-top"><div><b>'+esc(g.n)+'</b><span>'+esc(CONS_BY[g.cons].n)+' · '+esc(g.dom)+' · niveau '+cur.L+' / '+MG_LEVELS+'</span></div><button class="sc-x" data-mg="close" aria-label="Fermer">✕</button></div>'+
  '<p class="mg-help">'+esc(g.d)+'</p><div class="mg-status" id="mgStatus">'+(status||'')+'</div><div class="mg-body" id="mgBody">'+body+'</div><div class="mg-ctl" id="mgCtl"></div>';
}
const status=h=>{const e=$('#mgStatus');if(e)e.innerHTML=h;};
const ctl=h=>{const e=$('#mgCtl');if(e)e.innerHTML=h;};
function start(){if(stop)stop();stop=null;PLAY[gameOf(cur.k).mech](levelOf(cur.k,cur.L));}
function end(win){
 if(stop)stop();stop=null;
 let out=[];
 if(win){const first=cur.L===mgOf(cur.k).done+1;out=mgWin(cur.k,cur.L);if(!first)out=['Niveau déjà réussi : il ne rapporte plus rien, mais l’honneur est sauf.'];sfx('milestone');}
 else{mgFail(cur.k);sfx('lose');}
 save();
 const last=cur.L>=MG_LEVELS,nx=win&&!last;
 const panel='<div class="mg-end '+(win?'win':'ko')+'"><h2>'+(win?(last?'Épreuve terminée !':'Réussi !'):'Raté…')+'</h2>'+(out.length?'<ul>'+out.map(o=>'<li>'+esc(o)+'</li>').join('')+'</ul>':'')+
  '<div class="btns">'+(nx?'<button class="btn" data-mg="next">Niveau '+(cur.L+1)+' ▸</button>':'')+'<button class="btn'+(nx?' ghost':'')+'" data-mg="retry">'+(win?'Rejouer':'Recommencer')+'</button><button class="btn ghost" data-mg="close">Retour</button></div></div>';
 const b=$('#mgBody');if(b)b.insertAdjacentHTML('beforeend',panel);ctl('');
}
function onClick(e){
 const t=e.target.closest('[data-mg]');if(!t||t.disabled)return;
 const [a]=t.dataset.mg.split(':');
 if(a==='close'){sfx('close');close();}
 if(a==='retry'){sfx('tap');start();}
 if(a==='next'){sfx('tap');cur.L++;start();}
}
const SVG={
 star:'<svg viewBox="0 0 20 20"><path d="M10 1.5l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L10 13.9 5 16.7l1.2-5.6L2 7.3l5.6-.6z" fill="#ffe08a" stroke="#b8862b" stroke-width="1"/></svg>',
 target:'<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8.5" fill="#7a1f1f"/><circle cx="10" cy="10" r="6" fill="#f3e3c0"/><circle cx="10" cy="10" r="3.4" fill="#b3302b"/><circle cx="10" cy="10" r="1.2" fill="#f3e3c0"/></svg>',
 arrow:'<svg viewBox="0 0 20 20"><path d="M10 2l5 7h-3v9H8V9H5z" fill="#ffd36b" stroke="#6b4a12" stroke-width="1"/></svg>'
};

/* ---------- la Flèche ---------- */
function playFleche(lv){
 const rock=new Set(lv.rock),{w,h}=lv;let pos=lv.start,dir=0,moves=0,got=new Set(),busy=false;
 const cells=()=>{let s='';for(let i=0;i<w*h;i++){const c=rock.has(i)?'rock':'';s+='<div class="fc '+c+'" data-i="'+i+'">'+(i===lv.target?SVG.target:'')+(lv.stars.includes(i)&&!got.has(i)?'<span class="st">'+SVG.star+'</span>':'')+(i===pos?'<span class="ar" style="transform:rotate('+dir*90+'deg)">'+SVG.arrow+'</span>':'')+'</div>';}return s;};
 const draw=()=>{$('#mgBody').innerHTML='<div class="fgrid" style="grid-template-columns:repeat('+w+',1fr)">'+cells()+'</div>';status('Coups : <b>'+moves+'</b> / '+lv.limit+' · étoiles : <b>'+got.size+'</b> / '+lv.stars.length+' <span class="aside">(meilleur : '+lv.opt+')</span>');};
 frame('','');draw();
 ctl('<div class="pad"><button class="btn" data-dir="0" aria-label="Haut">▲</button><button class="btn" data-dir="3" aria-label="Gauche">◀</button><button class="btn" data-dir="2" aria-label="Bas">▼</button><button class="btn" data-dir="1" aria-label="Droite">▶</button></div><button class="btn ghost sm" data-mg="retry">Recommencer le niveau</button>');
 const go=async d=>{if(busy)return;const {end,path}=slide({w,h,rock},pos,d);dir=d;if(end===pos){sfx('tap');draw();return;}
  busy=true;moves++;sfx('tap');for(const c of path){pos=c;if(lv.stars.includes(c))got.add(c);draw();await wait(55);}busy=false;
  if(pos===lv.target&&got.size===lv.stars.length)return end_(true);
  if(moves>=lv.limit)return end_(false);};
 let end_=end;
 const onDir=e=>{const b=e.target.closest('[data-dir]');if(b)go(+b.dataset.dir);};
 let sx=0,sy=0;const down=e=>{sx=e.clientX;sy=e.clientY;},up=e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;if(!e.target.closest('#mgBody'))return;go(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0));};
 const key=e=>{const m={ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3}[e.key];if(m!=null){e.preventDefault();go(m);}};
 root.addEventListener('click',onDir);root.addEventListener('pointerdown',down);root.addEventListener('pointerup',up);addEventListener('keydown',key);
 stop=()=>{root.removeEventListener('click',onDir);root.removeEventListener('pointerdown',down);root.removeEventListener('pointerup',up);removeEventListener('keydown',key);};
}

/* ---------- la Lyre ---------- */
const NOTES=[262,294,330,392,440],NOTE_C=['#e9c46a','#f4a261','#e76f51','#7fb7be','#a29bfe'];
function playLyre(lv){
 let i=0,phase='listen',alive=true;
 frame('<div class="lyre">'+NOTES.map((f,k)=>'<button class="str" data-n="'+k+'" style="--c:'+NOTE_C[k]+'" aria-label="Corde '+(k+1)+'"><i></i></button>').join('')+'</div>','');
 const flash=k=>{const b=$('.str[data-n="'+k+'"]');if(b){b.classList.add('on');setTimeout(()=>b.classList.remove('on'),Math.min(260,lv.ms*.6));}pluck(NOTES[k]);};
 const listen=async()=>{phase='listen';status('Écoute… ('+lv.seq.length+' notes)');ctl('');await wait(600);for(const n of lv.seq){if(!alive)return;flash(n);await wait(lv.ms);}if(!alive)return;phase='play';i=0;status('À toi ! Note <b>1</b> / '+lv.seq.length);ctl('<button class="btn ghost sm" data-mg="retry">Réécouter (recommence)</button>');};
 const tap=e=>{const b=e.target.closest('.str');if(!b||phase!=='play')return;const n=+b.dataset.n;flash(n);
  if(n!==lv.seq[i]){phase='done';return end(false);}
  i++;if(i>=lv.seq.length){phase='done';return setTimeout(()=>end(true),300);}status('À toi ! Note <b>'+(i+1)+'</b> / '+lv.seq.length);};
 root.addEventListener('click',tap);stop=()=>{alive=false;root.removeEventListener('click',tap);};
 listen();
}

/* ---------- l'Horloge ---------- */
function playHorloge(lv){
 let ang=0,sens=1,lives=lv.lives,zones=lv.zones.map(z=>({...z})),raf=0,last=performance.now(),turns=0,maxTurns=zones.length*2+2;
 const arc=(c,w)=>{const r=110,a0=(c-w/2-90)*Math.PI/180,a1=(c+w/2-90)*Math.PI/180;return 'M'+(130+r*Math.cos(a0))+' '+(130+r*Math.sin(a0))+' A'+r+' '+r+' 0 0 1 '+(130+r*Math.cos(a1))+' '+(130+r*Math.sin(a1));};
 frame('<svg class="dial" viewBox="0 0 260 260" data-hit="1"><circle cx="130" cy="130" r="122" fill="#1f1714" stroke="#6b5130" stroke-width="3"/><g id="zones"></g><line id="needle" x1="130" y1="130" x2="130" y2="22" stroke="#f6e6c8" stroke-width="4" stroke-linecap="round"/><circle cx="130" cy="130" r="8" fill="#d9ab4f"/></svg>','');
 const drawZ=()=>{$('#zones').innerHTML=zones.map(z=>'<path d="'+arc(z.c,z.w)+'" stroke="#e8b84a" stroke-width="16" fill="none" stroke-linecap="round" opacity=".9"/>').join('');status('Zones : <b>'+zones.length+'</b> · vies : '+'♥'.repeat(lives)+' · tours restants : '+Math.max(0,Math.ceil(maxTurns-turns)));};
 drawZ();ctl('<button class="btn big" data-hit="1">Frapper !</button>');
 const loop=t=>{const dt=Math.min(.05,(t-last)/1000);last=t;const d=360*lv.speed*dt;ang=(ang+sens*d+360)%360;turns+=d/360;const n=$('#needle');if(n)n.setAttribute('transform','rotate('+ang+' 130 130)');
  if(turns>maxTurns){cancelAnimationFrame(raf);return end(false);}raf=requestAnimationFrame(loop);};
 raf=requestAnimationFrame(loop);
 const hit=e=>{if(!e.target.closest('[data-hit]'))return;const z=zones.find(z=>Math.abs(((ang-z.c+540)%360)-180)<=z.w/2+3);
  if(z){zones=zones.filter(x=>x!==z);sfx('confirm');if(lv.reverse)sens=-sens;if(!zones.length){cancelAnimationFrame(raf);drawZ();return end(true);}}
  else{lives--;sfx('hurt');if(lives<=0){cancelAnimationFrame(raf);drawZ();return end(false);}}drawZ();};
 root.addEventListener('pointerdown',hit);stop=()=>{cancelAnimationFrame(raf);root.removeEventListener('pointerdown',hit);};
}

/* ---------- le Burin ---------- */
function playBurin(lv){
 const want=new Set(lv.cells),got=new Set();let cracks=0,phase='show';
 const draw=()=>{let s='';for(let i=0;i<lv.n*lv.n;i++){const c=phase==='show'&&want.has(i)?'lit':got.has(i)?'cut':'';s+='<button class="bc '+c+'" data-c="'+i+'" aria-label="Pierre '+(i+1)+'"></button>';}$('#mgBody').innerHTML='<div class="bgrid" style="grid-template-columns:repeat('+lv.n+',1fr)">'+s+'</div>';};
 frame('','Retiens le motif…');draw();
 const tm=setTimeout(()=>{phase='play';draw();status('Taille : <b>0</b> / '+want.size+' · fissures : 0 / '+lv.cracks);},lv.showMs);
 const tap=e=>{const b=e.target.closest('.bc');if(!b||phase!=='play')return;const i=+b.dataset.c;if(got.has(i))return;
  if(want.has(i)){got.add(i);sfx('tap');b.classList.add('cut');if(got.size===want.size){phase='done';return end(true);}}
  else{cracks++;sfx('hurt');b.classList.add('crack');if(cracks>=lv.cracks){phase='done';return end(false);}}
  status('Taille : <b>'+got.size+'</b> / '+want.size+' · fissures : '+cracks+' / '+lv.cracks);};
 root.addEventListener('click',tap);stop=()=>{clearTimeout(tm);root.removeEventListener('click',tap);};
}

/* ---------- le Fourneau ---------- */
function playFourneau(lv){
 let T=20,inside=0,el=0,press=false,raf=0,last=performance.now();
 frame('<div class="forge"><div class="gauge"><i class="band"></i><i class="temp"></i></div><div class="fire" id="fire"></div></div>','');
 ctl('<button class="btn big" id="blow">Souffler (maintenir)</button>');
 const B=$('.band'),M=$('.temp'),F=$('#fire');
 const loop=t=>{const dt=Math.min(.05,(t-last)/1000);last=t;el+=dt;
  const c=lv.moving?50+22*Math.sin(el*.5):55,lo=c-lv.band/2,hi=c+lv.band/2;
  T+=(press?40:-26)*dt+Math.sin(el*2.3+lv.seed)*lv.drift*dt*20;T=Math.max(0,Math.min(100,T));
  if(T>=lo&&T<=hi)inside+=dt;
  B.style.bottom=lo+'%';B.style.height=lv.band+'%';M.style.bottom=T+'%';F.style.opacity=.3+T/140;M.classList.toggle('in',T>=lo&&T<=hi);
  status('Dans la bande : <b>'+inside.toFixed(1)+'</b> / '+lv.need.toFixed(1)+' s · temps : '+Math.max(0,lv.limit-el).toFixed(0)+' s');
  if(inside>=lv.need)return end(true);if(el>=lv.limit)return end(false);raf=requestAnimationFrame(loop);};
 raf=requestAnimationFrame(loop);
 const dn=e=>{if(e.target.closest('#blow,.forge')){press=true;e.preventDefault();}},upf=()=>{press=false;};
 root.addEventListener('pointerdown',dn);addEventListener('pointerup',upf);addEventListener('pointercancel',upf);
 stop=()=>{cancelAnimationFrame(raf);root.removeEventListener('pointerdown',dn);removeEventListener('pointerup',upf);removeEventListener('pointercancel',upf);};
}

/* ---------- le Caméléon ---------- */
function playCameleon(lv){
 let round=0,miss=0,odd=0;
 const draw=()=>{const hue=(lv.hue+round*47)%360,n=lv.n;odd=Math.floor(Math.random()*n*n);const up=Math.random()<.5;let s='';
  for(let i=0;i<n*n;i++){const l=i===odd?(up?45+lv.delta:45-lv.delta):45;s+='<button class="cc" data-c="'+i+'" style="background:hsl('+hue+' 50% '+l+'%)" aria-label="Pierre '+(i+1)+'"></button>';}
  $('#mgBody').innerHTML='<div class="cgrid" style="grid-template-columns:repeat('+n+',1fr)">'+s+'</div>';status('Manche <b>'+(round+1)+'</b> / '+lv.rounds+' · erreurs : '+miss+' / '+lv.mistakes);};
 frame('','');draw();
 const tap=e=>{const b=e.target.closest('.cc');if(!b)return;
  if(+b.dataset.c===odd){sfx('confirm');round++;if(round>=lv.rounds)return end(true);draw();}
  else{miss++;sfx('hurt');b.classList.add('wrong');if(miss>lv.mistakes)return end(false);status('Manche <b>'+(round+1)+'</b> / '+lv.rounds+' · erreurs : '+miss+' / '+lv.mistakes);}};
 root.addEventListener('click',tap);stop=()=>root.removeEventListener('click',tap);
}

/* ---------- les canaux de l'Éridan ---------- */
function pipeSvg(m,wet){const c=wet?'#5cc0ff':'#9b8a74',seg=[[1,'20,20 20,0'],[2,'20,20 40,20'],[4,'20,20 20,40'],[8,'20,20 0,20']].filter(([b])=>m&b).map(([,p])=>'<polyline points="'+p+'" stroke="'+c+'" stroke-width="11" fill="none"/>').join('');return '<svg viewBox="0 0 40 40">'+seg+'<circle cx="20" cy="20" r="6.5" fill="'+c+'"/></svg>';}
function playCanal(lv){
 const {n,rs,re}=lv,rots=lv.rots.slice();let turns=0,over=false;
 const draw=()=>{const f=flows(lv,rots);let s='';
  for(let y=0;y<n;y++){s+='<div class="cn-edge">'+(y===rs?'<span class="src">≈</span>':'')+'</div>';
   for(let x=0;x<n;x++){const i=y*n+x;s+='<button class="cn" data-t="'+i+'" aria-label="Tuyau">'+pipeSvg(f.cur[i],f.wet.has(i))+'</button>';}
   s+='<div class="cn-edge">'+(y===re?'<span class="fnt">◉</span>':'')+'</div>';}
  $('#mgBody').innerHTML='<div class="cgrid canal" style="grid-template-columns:22px repeat('+n+',1fr) 22px">'+s+'</div>';status('Tours de tuyaux : <b>'+turns+'</b> · touche un tuyau pour le tourner');return f.ok;};
 frame('','');draw();
 const tap=e=>{const b=e.target.closest('.cn');if(!b||over)return;rots[+b.dataset.t]=(rots[+b.dataset.t]+1)%4;turns++;sfx('tap');if(draw()){over=true;setTimeout(()=>end(true),450);}};
 root.addEventListener('click',tap);stop=()=>root.removeEventListener('click',tap);
}

/* ---------- relier les étoiles ---------- */
function playEtoiles(lv){
 let next=0,left=lv.time,hidden=false,over=false;const t0=performance.now();
 const draw=()=>{const P=lv.pts;let lines='';for(let i=1;i<next;i++)lines+='<line x1="'+P[i-1].x*100+'" y1="'+P[i-1].y*100+'" x2="'+P[i].x*100+'" y2="'+P[i].y*100+'" stroke="#ffd36b" stroke-width=".8"/>';
  $('#mgBody').innerHTML='<div class="sky"><svg viewBox="0 0 100 100" preserveAspectRatio="none">'+lines+'</svg>'+P.map((p,i)=>'<button class="star'+(i<next?' on':'')+'" data-s="'+i+'" style="left:'+p.x*100+'%;top:'+p.y*100+'%">'+(i<next||!hidden?i+1:'')+'</button>').join('')+'</div>';};
 frame('','');draw();
 const tick=setInterval(()=>{if(over)return;const el=(performance.now()-t0)/1000;left=lv.time-el;if(lv.hide&&!hidden&&el>=lv.hide){hidden=true;draw();}
  status('Étoile suivante : <b>'+(next+1)+'</b> / '+lv.pts.length+' · temps : '+Math.max(0,left).toFixed(1)+' s'+(lv.hide&&!hidden?' · mémorise les numéros !':''));if(left<=0){over=true;end(false);}},100);
 const tap=e=>{const b=e.target.closest('.star');if(!b||over)return;const i=+b.dataset.s;if(i<next)return;
  if(i===next){next++;sfx('tap');draw();if(next>=lv.pts.length){over=true;setTimeout(()=>end(true),300);}}else{sfx('hurt');b.classList.add('wrong');setTimeout(()=>b.classList.remove('wrong'),300);}};
 root.addEventListener('click',tap);stop=()=>{clearInterval(tick);root.removeEventListener('click',tap);};
}

/* ---------- le juste poids ---------- */
function playBalance(lv){
 let r=0,on=new Set(),over=false;const t0=performance.now();
 const draw=()=>{const R=lv.rounds[r],sum=[...on].reduce((t,i)=>t+R.w[i],0),tilt=Math.max(-14,Math.min(14,(sum-R.target)/R.target*14));
  $('#mgBody').innerHTML='<div class="bal"><div class="beam" style="transform:rotate('+tilt+'deg)"><div class="plate l"><b>'+R.target+'</b></div><div class="plate r"><b>'+sum+'</b></div></div><div class="pillar"></div>'+
   '<div class="weights">'+R.w.map((w,i)=>'<button class="wt'+(on.has(i)?' on':'')+'" data-w="'+i+'">'+w+'</button>').join('')+'</div></div>';return sum===R.target;};
 frame('','');draw();
 const tick=setInterval(()=>{if(over)return;const left=lv.time-(performance.now()-t0)/1000;status('Pesée <b>'+(r+1)+'</b> / 3 · temps : '+Math.max(0,left).toFixed(0)+' s');if(left<=0){over=true;end(false);}},200);
 const tap=e=>{const b=e.target.closest('.wt');if(!b||over)return;const i=+b.dataset.w;if(on.has(i))on.delete(i);else on.add(i);sfx('tap');
  if(draw()){sfx('confirm');r++;on=new Set();if(r>=3){over=true;setTimeout(()=>end(true),300);return;}setTimeout(draw,350);}};
 root.addEventListener('click',tap);stop=()=>{clearInterval(tick);root.removeEventListener('click',tap);};
}

/* ---------- les paires du zodiaque ---------- */
function playMemoire(lv){
 const C=lv.cards,found=new Set();let open=[],miss=0,lock=false;
 const draw=()=>{const n=C.length,cols=n<=16?4:6;$('#mgBody').innerHTML='<div class="cgrid" style="grid-template-columns:repeat('+cols+',1fr)">'+C.map((s,i)=>'<button class="card'+(found.has(i)||open.includes(i)?' up':'')+'" data-c="'+i+'">'+(found.has(i)||open.includes(i)?s:'')+'</button>').join('')+'</div>';status('Paires : <b>'+found.size/2+'</b> / '+n/2+' · erreurs : '+miss+' / '+lv.mistakes);};
 frame('','');draw();
 const tap=e=>{const b=e.target.closest('.card');if(!b||lock)return;const i=+b.dataset.c;if(found.has(i)||open.includes(i))return;open.push(i);sfx('tap');draw();
  if(open.length===2){const [a,c]=open;if(C[a]===C[c]){found.add(a);found.add(c);open=[];sfx('confirm');draw();if(found.size===C.length)setTimeout(()=>end(true),300);}
   else{miss++;lock=true;setTimeout(()=>{open=[];lock=false;draw();if(miss>lv.mistakes)end(false);},700);}}};
 root.addEventListener('click',tap);stop=()=>root.removeEventListener('click',tap);
}

/* ---------- le labyrinthe ---------- */
function playLabyrinthe(lv){
 const {n,open}=lv;let pos=0,steps=0,over=false;const t0=performance.now(),exit=n*n-1;
 const draw=()=>{const px=pos%n,py=Math.floor(pos/n);let s='';
  for(let i=0;i<n*n;i++){const x=i%n,y=Math.floor(i/n),o=open[i],far=lv.fog&&Math.max(Math.abs(x-px),Math.abs(y-py))>lv.fog;
   s+='<div class="mz'+(far?' fog':'')+'" style="border-top-width:'+(o&1?0:2)+'px;border-right-width:'+(o&2?0:2)+'px;border-bottom-width:'+(o&4?0:2)+'px;border-left-width:'+(o&8?0:2)+'px">'+(i===pos?'<i class="me"></i>':i===exit&&!far?'<i class="ex"></i>':'')+'</div>';}
  $('#mgBody').innerHTML='<div class="maze" style="grid-template-columns:repeat('+n+',1fr)">'+s+'</div>';};
 frame('','');draw();
 ctl('<div class="pad"><button class="btn" data-dir="0" aria-label="Haut">▲</button><button class="btn" data-dir="3" aria-label="Gauche">◀</button><button class="btn" data-dir="2" aria-label="Bas">▼</button><button class="btn" data-dir="1" aria-label="Droite">▶</button></div>');
 const tick=setInterval(()=>{if(over)return;const left=lv.time-(performance.now()-t0)/1000;status('Pas : <b>'+steps+'</b> · temps : '+Math.max(0,left).toFixed(0)+' s'+(lv.fog?' · la brume cache le chemin':''));if(left<=0){over=true;end(false);}},250);
 const go=d=>{if(over)return;const bit=[1,2,4,8][d];if(!(open[pos]&bit)){sfx('tap');return;}pos+=[-n,1,n,-1][d];steps++;draw();if(pos===exit){over=true;sfx('confirm');setTimeout(()=>end(true),250);}};
 const onDir=e=>{const b=e.target.closest('[data-dir]');if(b)go(+b.dataset.dir);};
 let sx=0,sy=0;const down=e=>{sx=e.clientX;sy=e.clientY;},up=e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<24||!e.target.closest('#mgBody'))return;go(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0));};
 const key=e=>{const m={ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3}[e.key];if(m!=null){e.preventDefault();go(m);}};
 root.addEventListener('click',onDir);root.addEventListener('pointerdown',down);root.addEventListener('pointerup',up);addEventListener('keydown',key);
 stop=()=>{clearInterval(tick);root.removeEventListener('click',onDir);root.removeEventListener('pointerdown',down);root.removeEventListener('pointerup',up);removeEventListener('keydown',key);};
}

/* ---------- la sentinelle ---------- */
function playSentinelle(lv){
 const holes=new Array(lv.holes).fill(null);let hits=0,miss=0,raf=0,last=performance.now(),acc=0,el=0;
 const draw=()=>{$('#mgBody').innerHTML='<div class="cgrid sent" style="grid-template-columns:repeat('+(lv.holes===12?4:3)+',1fr)">'+holes.map((h,i)=>'<button class="hole'+(h?' '+h.t:'')+'" data-h="'+i+'">'+(h?(h.t==='foe'?'<b>✦</b><small>ennemi</small>':'<b>☺︎</b><small>villageois</small>'):'')+'</button>').join('')+'</div>';};
 const st=()=>status('Ennemis frappés : <b>'+hits+'</b> / '+lv.need+' · erreurs : '+miss+' / '+lv.misses+' · temps : '+Math.max(0,lv.time-el).toFixed(0)+' s');
 frame('','');draw();
 const loop=t=>{const dt=Math.min(.05,(t-last)/1000);last=t;el+=dt;acc+=dt;let ch=false;
  holes.forEach((h,i)=>{if(h&&(h.ttl-=dt)<=0){if(h.t==='foe')miss++;holes[i]=null;ch=true;}});
  if(acc>=lv.spawn){acc=0;const free=holes.map((h,i)=>h?null:i).filter(i=>i!=null);if(free.length){holes[free[Math.floor(Math.random()*free.length)]]={t:Math.random()<lv.ally?'ally':'foe',ttl:lv.show};ch=true;}}
  if(ch)draw();st();
  if(hits>=lv.need)return end(true);if(miss>=lv.misses||el>=lv.time)return end(false);raf=requestAnimationFrame(loop);};
 raf=requestAnimationFrame(loop);
 const tap=e=>{const b=e.target.closest('.hole');if(!b)return;const i=+b.dataset.h,h=holes[i];if(!h)return;holes[i]=null;if(h.t==='foe'){hits++;sfx('hit');}else{miss++;sfx('hurt');}draw();};
 root.addEventListener('pointerdown',tap);stop=()=>{cancelAnimationFrame(raf);root.removeEventListener('pointerdown',tap);};
}

/* ---------- la pluie de pierres ---------- */
function playEsquive(lv){
 let lane=Math.floor(lv.lanes/2),lives=lv.lives,el=0,acc=0,raf=0,last=performance.now(),rocks=[],hitT=0;
 frame('<div class="rain" id="rain"><i class="hero" id="hero"></i></div>','');
 ctl('<div class="btns"><button class="btn big" data-mv="-1" aria-label="Gauche">◀</button><button class="btn big" data-mv="1" aria-label="Droite">▶</button></div>');
 const box=$('#rain'),hero=$('#hero');
 const place=()=>{hero.style.left=((lane+.5)/lv.lanes*100)+'%';};place();
 const loop=t=>{const dt=Math.min(.05,(t-last)/1000);last=t;el+=dt;acc+=dt;
  if(acc>=lv.spawn){acc=0;const d=document.createElement('i');d.className='rock';const l=Math.floor(Math.random()*lv.lanes);d.style.left=((l+.5)/lv.lanes*100)+'%';box.appendChild(d);rocks.push({l,y:0,d});}
  rocks.forEach(r=>{r.y+=dt*.42*lv.speed;r.d.style.top=(r.y*100)+'%';if(!r.hit&&r.y>.82&&r.y<.95&&r.l===lane&&el>hitT){r.hit=true;lives--;hitT=el+.6;sfx('hurt');hero.classList.add('ouch');setTimeout(()=>hero.classList.remove('ouch'),300);}});
  rocks=rocks.filter(r=>{if(r.y>1.05){r.d.remove();return false;}return true;});
  status('Tiens bon : <b>'+Math.max(0,lv.time-el).toFixed(0)+'</b> s · vies : '+'♥'.repeat(Math.max(0,lives)));
  if(lives<=0)return end(false);if(el>=lv.time)return end(true);raf=requestAnimationFrame(loop);};
 raf=requestAnimationFrame(loop);
 const mv=d=>{lane=Math.max(0,Math.min(lv.lanes-1,lane+d));place();};
 const tap=e=>{const b=e.target.closest('[data-mv]');if(b){mv(+b.dataset.mv);return;}if(e.target.closest('#rain')){const r=box.getBoundingClientRect();mv(e.clientX<r.left+r.width/2?-1:1);}};
 const key=e=>{if(e.key==='ArrowLeft'){e.preventDefault();mv(-1);}if(e.key==='ArrowRight'){e.preventDefault();mv(1);}};
 root.addEventListener('pointerdown',tap);addEventListener('keydown',key);
 stop=()=>{cancelAnimationFrame(raf);root.removeEventListener('pointerdown',tap);removeEventListener('keydown',key);};
}

/* ---------- les questions du Pope ---------- */
function playQuiz(lv){
 let i=0,miss=0,lock=false;
 const draw=()=>{const Q=lv.qs[i];$('#mgBody').innerHTML='<div class="quiz"><p class="qq">'+esc(Q.q)+'</p>'+Q.a.map((a,j)=>'<button class="btn ghost qa" data-a="'+j+'">'+esc(a)+'</button>').join('')+'</div>';status('Question <b>'+(i+1)+'</b> / '+lv.qs.length+' · erreurs permises : '+(lv.mistakes-miss));};
 frame('','');draw();
 const tap=e=>{const b=e.target.closest('.qa');if(!b||lock)return;const Q=lv.qs[i],good=Q.a.indexOf(Q.good),ok=+b.dataset.a===good;lock=true;
  root.querySelectorAll('.qa').forEach(x=>{if(+x.dataset.a===good)x.classList.add('good');});if(!ok){b.classList.add('bad');miss++;sfx('hurt');}else sfx('confirm');
  setTimeout(()=>{lock=false;if(miss>lv.mistakes)return end(false);i++;if(i>=lv.qs.length)return end(true);draw();},ok?600:1400);};
 root.addEventListener('click',tap);stop=()=>root.removeEventListener('click',tap);
}

/* ---------- les mots du Sanctuaire ---------- */
function playMots(lv){
 let w=0,used=[],err=0;
 const draw=()=>{const W=lv.words[w],built=used.map(i=>W.s[i]).join('');
  $('#mgBody').innerHTML='<div class="words"><div class="slots">'+W.w.split('').map((_,i)=>'<i>'+(built[i]||'')+'</i>').join('')+'</div>'+(lv.hint?'<p class="hint">Indice : le mot commence par « '+W.w[0]+' »</p>':'')+
   '<div class="letters">'+W.s.split('').map((ch,i)=>'<button class="lt" data-l="'+i+'"'+(used.includes(i)?' disabled':'')+'>'+ch+'</button>').join('')+'</div></div>';
  status('Mot <b>'+(w+1)+'</b> / '+lv.words.length+' · erreurs : '+err+' / '+lv.errors);};
 frame('','');draw();ctl('<button class="btn ghost" data-clear="1">Effacer</button>');
 const tap=e=>{if(e.target.closest('[data-clear]')){used=[];draw();return;}const b=e.target.closest('.lt');if(!b||b.disabled)return;used.push(+b.dataset.l);sfx('tap');
  const W=lv.words[w];if(used.length<W.w.length){draw();return;}
  const built=used.map(i=>W.s[i]).join('');
  if(built===W.w){sfx('confirm');w++;used=[];if(w>=lv.words.length)return end(true);draw();}
  else{err++;sfx('hurt');used=[];if(err>=lv.errors)return end(false);draw();}};
 root.addEventListener('click',tap);stop=()=>root.removeEventListener('click',tap);
}

const PLAY={fleche:playFleche,lyre:playLyre,horloge:playHorloge,burin:playBurin,fourneau:playFourneau,cameleon:playCameleon,canal:playCanal,etoiles:playEtoiles,balance:playBalance,memoire:playMemoire,labyrinthe:playLabyrinthe,sentinelle:playSentinelle,esquive:playEsquive,quiz:playQuiz,mots:playMots};

