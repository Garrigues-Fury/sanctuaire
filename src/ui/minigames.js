/* Écran des mini-jeux, en plein écran, au doigt (règles et niveaux dans core/minigames.js). */
import { GAME_BY, MG_LEVELS } from '../core/data/minigames.js';
import { CONS_BY } from '../core/data/world.js';
import { levelOf, mgFail, mgOf, mgWin, slide } from '../core/minigames.js';
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
 const g=GAME_BY[cur.k];
 root.innerHTML='<div class="mg-top"><div><b>'+esc(g.n)+'</b><span>'+esc(CONS_BY[g.cons].n)+' · niveau '+cur.L+' / '+MG_LEVELS+'</span></div><button class="sc-x" data-mg="close" aria-label="Fermer">✕</button></div>'+
  '<p class="mg-help">'+esc(g.d)+'</p><div class="mg-status" id="mgStatus">'+(status||'')+'</div><div class="mg-body" id="mgBody">'+body+'</div><div class="mg-ctl" id="mgCtl"></div>';
}
const status=h=>{const e=$('#mgStatus');if(e)e.innerHTML=h;};
const ctl=h=>{const e=$('#mgCtl');if(e)e.innerHTML=h;};
function start(){if(stop)stop();stop=null;PLAY[cur.k](levelOf(cur.k,cur.L));}
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

const PLAY={fleche:playFleche,lyre:playLyre,horloge:playHorloge,burin:playBurin,fourneau:playFourneau,cameleon:playCameleon};
