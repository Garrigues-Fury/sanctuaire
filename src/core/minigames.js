/* Règles des mini-jeux (sans affichage ; l'écran est dans ui/minigames.js).
   - Chaque constellation a son jeu (data/minigames.js) : une sorte de jeu, avec ses propres niveaux, tirés d'une graine fixe.
   - Réussir un niveau pour la première fois rapporte des heures d'entraînement à la réserve (à répartir sur qui on veut)
     et des points de statistique au porteur de l'armure. Les niveaux déjà réussis ne rapportent plus rien.
   - Gains limités par jour : au-delà de 4 niveaux réussis dans la journée, ils ne valent plus qu'un quart. */
import { MG_LEVELS, gameOf } from './data/minigames.js';
import { QUIZ, WORDS, ZODIAC } from './data/mgdata.js';
import { gainStat } from './scale.js';
import { trainHours } from './training.js';
import { S, log } from './state.js';
import { clamp, mulberry32 } from './util.js';

export const DAY_FULL=4;
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
export function ensureMG(){if(!S.mg)S.mg={};if(S.xpPool==null)S.xpPool=0;if(!S.mgDay||S.mgDay.d!==today())S.mgDay={d:today(),n:0};return S.mg;}
export function mgOf(k){ensureMG();return S.mg[k]||(S.mg[k]={done:0,tries:0});}
// Le porteur de l'armure : sans lui, le jeu de cette constellation reste fermé.
export function bearerOf(consK){return S.knights.find(k=>k.cons===consK)||null;}
export function mgUnlocked(k){return gameOf(k)?bearerOf(k):null;}
export function dayFactor(){ensureMG();return S.mgDay.n<DAY_FULL?1:.25;}
export function poolHours(L){return 2+L*.5;}
const STN={fo:'force',vi:'vitesse',de:'dextérité',en:'endurance',ps:'psychokinésie',co:'cosmos'};

// Victoire au niveau L du jeu de la constellation k : renvoie la liste des gains, en clair.
export function mgWin(k,L){
 const g=gameOf(k),st=mgOf(k),out=[];
 if(!g||L!==st.done+1)return out;
 st.done=L;const f=dayFactor();S.mgDay.n++;
 const h=Math.round(poolHours(L)*f*10)/10;S.xpPool=Math.round((S.xpPool+h)*10)/10;out.push('+'+h+' h d’entraînement dans la réserve');
 const b=bearerOf(k);
 if(b)g.st.forEach(s=>{const v0=b.st[s]||0;gainStat(b,s,f<1?.25:1);out.push(b.name+' : +'+Math.round((b.st[s]||0)-v0)+' '+STN[s]);});
 if(f<1)out.push('Au-delà de '+DAY_FULL+' niveaux par jour, les gains ne valent plus qu’un quart.');
 if(L===MG_LEVELS){const m=g.n+' : les '+MG_LEVELS+' niveaux sont réussis.';log(m);out.push(m);}
 S._dirty=true;return out;
}
export function mgFail(k){mgOf(k).tries++;}
// Répartir la réserve : h heures d'entraînement pour le personnage p.
export function givePool(p,h){ensureMG();h=Math.min(h,S.xpPool);if(!p||h<=0)return 0;S.xpPool=Math.round((S.xpPool-h)*10)/10;trainHours(p,h);return h;}

/* ---------- les niveaux ---------- */
const rngFor=(k,L,a=0)=>{let h=2166136261;for(const ch of k+'|'+L+'|'+a)h=Math.imul(h^ch.charCodeAt(0),16777619);return mulberry32(h>>>0);};
const shuffle=(a,r)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];

// La Flèche : glisse jusqu'à un rocher ou au bord ; étoiles à ramasser ; il faut s'arrêter sur la cible.
export function slide(lv,pos,d){
 const {w,h,rock}=lv;let x=pos%w,y=Math.floor(pos/w);const path=[];
 for(;;){const nx=x+DIRS[d][0],ny=y+DIRS[d][1];if(nx<0||ny<0||nx>=w||ny>=h||rock.has(ny*w+nx))break;x=nx;y=ny;path.push(y*w+x);}
 return{end:y*w+x,path};
}
function solveFleche(lv){
 const all=(1<<lv.stars.length)-1,starIdx=new Map(lv.stars.map((s,i)=>[s,i]));
 const seen=new Set([lv.start*16]),q=[[lv.start,0,0]];
 while(q.length){const [p,m,dist]=q.shift();if(p===lv.target&&m===all)return dist;
  for(let d=0;d<4;d++){const {end,path}=slide(lv,p,d);if(end===p)continue;let mm=m;path.forEach(c=>{if(starIdx.has(c))mm|=1<<starIdx.get(c);});const key=end*16+mm;if(!seen.has(key)){seen.add(key);q.push([end,mm,dist+1]);}}}
 return -1;
}
export function genFleche(L,key='fleche'){
 const size=Math.min(10,5+Math.floor((L-1)/4)),nStars=L<3?0:L<8?1:L<14?2:3,want=3+Math.floor(L/2.5),slack=3-Math.floor(Math.min(L,20)/7);
 let best=null;
 for(let a=0;a<600;a++){
  const r=rngFor(key,L,a),w=size,h=size+(L>10?1:0),rock=new Set(),free=[];
  for(let i=0;i<w*h;i++){if(r()<.13+.008*L)rock.add(i);else free.push(i);}
  if(free.length<nStars+4)continue;
  const pick=()=>free.splice(Math.floor(r()*free.length),1)[0];
  const lv={w,h,rock,start:pick(),target:pick(),stars:[]};for(let i=0;i<nStars;i++)lv.stars.push(pick());
  const opt=solveFleche(lv);if(opt<0)continue;
  const score=Math.abs(opt-want);if(!best||score<best.score)best={lv,opt,score};
  if(opt>=want&&opt<=want+2)break;
 }
 const {lv,opt}=best;return Object.assign(lv,{opt,limit:opt+Math.max(1,slack),rock:[...lv.rock]});
}
export function genLyre(L,key='lyre'){const r=rngFor(key,L),n=3+Math.round(L*.55),seq=[];for(let i=0;i<n;i++)seq.push(Math.floor(r()*5));return{seq,ms:Math.max(300,720-L*20)};}
export function genHorloge(L,key='horloge'){
 const r=rngFor(key,L),n=1+Math.floor(L/4),w=Math.max(12,70-L*3),zones=[];
 for(let i=0;i<n;i++){let c,ok=false;for(let t=0;t<40&&!ok;t++){c=r()*360;ok=zones.every(z=>Math.abs(((c-z.c+540)%360)-180)>w+8);}zones.push({c,w});}
 return{zones,speed:.35+L*.05,reverse:L>=8,lives:3};
}
export function genBurin(L,key='burin'){
 const r=rngFor(key,L),n=Math.min(7,3+Math.floor(L/5)),k=Math.min(Math.floor(n*n*.55),3+Math.floor(L*.55)),cells=new Set();
 while(cells.size<k)cells.add(Math.floor(r()*n*n));
 return{n,cells:[...cells],showMs:Math.max(800,2600-L*80),cracks:L>=12?2:3};
}
export function genFourneau(L){return{band:Math.max(9,34-L*1.2),need:4+L*.35,limit:Math.round((4+L*.35)*2.3),drift:.5+L*.08,moving:L>=6,seed:L};}
export function genCameleon(L,key='cameleon'){const r=rngFor(key,L);return{n:Math.min(8,2+Math.floor(L/3)),delta:Math.max(2.5,26-L*1.15),rounds:5,mistakes:2,hue:Math.floor(r()*360)};}
// Les canaux : tuyaux à tourner (N=1, E=2, S=4, W=8) pour relier la source (à gauche) à la fontaine (à droite).
export const rot=m=>((m<<1)|(m>>3))&15;
export function flows(lv,rots){
 const {n,rs,re,tiles}=lv,cur=tiles.map((m,i)=>{let x=m;for(let t=0;t<rots[i];t++)x=rot(x);return x;});
 const start=rs*n;if(!(cur[start]&8))return{ok:false,wet:new Set(),cur};
 const wet=new Set([start]),q=[start];
 while(q.length){const c=q.shift(),x=c%n,y=Math.floor(c/n);[[1,0,-1],[2,1,0],[4,0,1],[8,-1,0]].forEach(([b,dx,dy])=>{if(!(cur[c]&b))return;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=n||ny>=n)return;const o=ny*n+nx,ob=b<4?b<<2:b>>2;if(cur[o]&ob&&!wet.has(o)){wet.add(o);q.push(o);}});}
 const end=re*n+n-1;return{ok:wet.has(end)&&!!(cur[end]&2),wet,cur};
}
export function genCanal(L,key='canal'){
 const n=Math.min(8,4+Math.floor(L/5));
 for(let a=0;;a++){
  const r=rngFor(key,L,a),rs=Math.floor(r()*n),re=Math.floor(r()*n),seen=new Set(),path=[];
  const dfs=(x,y)=>{const c=y*n+x;seen.add(c);path.push(c);if(x===n-1&&y===re)return true;
   for(const [dx,dy] of shuffle([[1,0],[0,-1],[0,1],[-1,0],[1,0]],r)){const nx=x+dx,ny=y+dy,o=ny*n+nx;if(nx<0||ny<0||nx>=n||ny>=n||seen.has(o))continue;if(dfs(nx,ny))return true;}
   path.pop();return false;};
  if(!dfs(0,rs)||path.length<n+Math.floor(L/3)&&a<40)continue;
  const tiles=new Array(n*n).fill(0),dirOf=(c,o)=>{const dx=o%n-c%n,dy=Math.floor(o/n)-Math.floor(c/n);return dx===1?2:dx===-1?8:dy===1?4:1;};
  path.forEach((c,i)=>{if(i===0)tiles[c]|=8;if(i===path.length-1)tiles[c]|=2;if(i>0)tiles[c]|=dirOf(c,path[i-1]);if(i<path.length-1)tiles[c]|=dirOf(c,path[i+1]);});
  const DEC=[5,10,3,6,12,9,7,11,13,14];for(let i=0;i<n*n;i++)if(!tiles[i])tiles[i]=r()<.25+.02*L?DEC[Math.floor(r()*DEC.length)]:DEC[Math.floor(r()*6)];
  const rots=tiles.map(()=>Math.floor(r()*4));if(flows({n,rs,re,tiles},rots).ok)rots[path[0]]=(rots[path[0]]+1)%4;
  return{n,rs,re,tiles,rots};
 }
}
// Relier les étoiles : positions (0 à 1), temps, numéros qui s'effacent plus loin.
export function genEtoiles(L,key='etoiles'){
 const r=rngFor(key,L),N=Math.min(20,5+Math.floor(L*.6)),pts=[];
 while(pts.length<N){const p={x:.08+r()*.84,y:.08+r()*.84};if(pts.every(q=>Math.hypot(q.x-p.x,q.y-p.y)>.13))pts.push(p);}
 return{pts,time:Math.round(6+N*1.6-L*.25),hide:L>=12?2.5:0};
}
// Le juste poids : trois pesées ; la cible est toujours une somme de poids disponibles.
export function genBalance(L,key='balance'){
 const r=rngFor(key,L),rounds=[];
 for(let i=0;i<3;i++){const k=Math.min(10,4+Math.floor(L/4)),max=5+L*2,w=[];for(let j=0;j<k;j++)w.push(1+Math.floor(r()*max));
  const pick=shuffle(w.map((_,j)=>j),r).slice(0,Math.min(k,2+Math.floor(L/5)+Math.floor(r()*2)));rounds.push({w,target:pick.reduce((t,j)=>t+w[j],0)});}
 return{rounds,time:Math.max(35,75-L*2)};
}
export function genMemoire(L,key='memoire'){const r=rngFor(key,L),pairs=Math.min(12,3+Math.floor(L/2.5)),sym=shuffle(ZODIAC.slice(),r).slice(0,pairs);return{cards:shuffle(sym.concat(sym),r),mistakes:Math.max(2,pairs+6-Math.floor(L/3))};}
// Le labyrinthe : creusé au hasard (parcours en profondeur) ; murs N=1, E=2, S=4, W=8 ouverts.
export function genLabyrinthe(L,key='labyrinthe'){
 const r=rngFor(key,L),n=Math.min(15,5+Math.floor(L/2)),open=new Array(n*n).fill(0),seen=new Set([0]),st=[0];
 while(st.length){const c=st[st.length-1],x=c%n,y=Math.floor(c/n);const nb=shuffle([[1,0,-1],[2,1,0],[4,0,1],[8,-1,0]],r).filter(([,dx,dy])=>{const nx=x+dx,ny=y+dy;return nx>=0&&ny>=0&&nx<n&&ny<n&&!seen.has(ny*n+nx);});
  if(!nb.length){st.pop();continue;}const [b,dx,dy]=nb[0],o=(y+dy)*n+x+dx;open[c]|=b;open[o]|=b<4?b<<2:b>>2;seen.add(o);st.push(o);}
 return{n,open,fog:L>=10?2:0,time:Math.round(n*n*.55+20)};
}
export function genSentinelle(L){return{holes:L>=10?12:9,spawn:Math.max(.38,1-L*.03),show:Math.max(.5,1.3-L*.04),ally:Math.min(.4,.18+.01*L),need:10+L,misses:5,time:30};}
export function genEsquive(L){return{lanes:L<8?3:L<15?4:5,time:15+L,speed:1+L*.08,spawn:Math.max(.32,.9-L*.025),lives:3};}
export function genQuiz(L,key='quiz'){
 const r=rngFor(key,L),tier=L<=6?1:L<=13?2:3,pool=QUIZ.filter(q=>q.t===tier||(tier>1&&q.t===tier-1&&r()<.25));
 return{qs:shuffle(pool.slice(),r).slice(0,5).map(q=>({q:q.q,good:q.a[0],a:shuffle(q.a.slice(),r)})),mistakes:L<10?1:0};
}
export function genMots(L,key='mots'){
 const r=rngFor(key,L),len=L<=4?[4,5]:L<=9?[6,7]:L<=15?[8,8]:[9,10],pool=WORDS.filter(w=>w.length>=len[0]&&w.length<=len[1]);
 return{words:shuffle(pool.slice(),r).slice(0,3).map(w=>{let s;do{s=shuffle(w.split(''),r).join('');}while(s===w);return{w,s};}),hint:L<8,errors:3};
}
export const GEN={fleche:genFleche,lyre:genLyre,horloge:genHorloge,burin:genBurin,fourneau:genFourneau,cameleon:genCameleon,canal:genCanal,etoiles:genEtoiles,balance:genBalance,memoire:genMemoire,labyrinthe:genLabyrinthe,sentinelle:genSentinelle,esquive:genEsquive,quiz:genQuiz,mots:genMots};
// Le niveau L du jeu de la constellation k : l'argent et l'or partent de plus haut.
export function levelOf(k,L){const g=gameOf(k);if(!g)return null;return GEN[g.mech](clamp(L,1,MG_LEVELS)+g.off,k);}
