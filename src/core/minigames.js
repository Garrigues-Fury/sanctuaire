/* Règles des mini-jeux (sans affichage ; l'écran est dans ui/minigames.js).
   - Chaque niveau est tiré d'une graine fixe : le niveau 7 de la Flèche est toujours le même.
   - Réussir un niveau pour la première fois rapporte des heures d'entraînement à la réserve (à répartir sur qui on veut)
     et des points de statistique au porteur de l'armure. Les niveaux déjà réussis ne rapportent plus rien.
   - Gains limités par jour : au-delà de 4 niveaux réussis dans la journée, ils ne valent plus qu'un quart. */
import { CONS_BY } from './data/world.js';
import { GAME_BY, MG_LEVELS } from './data/minigames.js';
import { gainStat } from './scale.js';
import { trainHours } from './training.js';
import { S, log } from './state.js';
import { clamp, mulberry32 } from './util.js';

export const DAY_FULL=4;
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
export function ensureMG(){if(!S.mg)S.mg={};if(S.xpPool==null)S.xpPool=0;if(!S.mgDay||S.mgDay.d!==today())S.mgDay={d:today(),n:0};return S.mg;}
export function mgOf(k){ensureMG();return S.mg[k]||(S.mg[k]={done:0,tries:0});}
// Le porteur de l'armure du jeu : sans lui, le jeu reste fermé.
export function bearerOf(consK){return S.knights.find(k=>k.cons===consK)||null;}
export function mgUnlocked(k){const g=GAME_BY[k];return g?bearerOf(g.cons):null;}
export function dayFactor(){ensureMG();return S.mgDay.n<DAY_FULL?1:.25;}
export function poolHours(L){return 2+L*.5;}

// Victoire au niveau L : renvoie la liste des gains, en clair.
export function mgWin(k,L){
 const g=GAME_BY[k],st=mgOf(k),out=[];
 if(L!==st.done+1)return out;
 st.done=L;const f=dayFactor();S.mgDay.n++;
 const h=Math.round(poolHours(L)*f*10)/10;S.xpPool=Math.round((S.xpPool+h)*10)/10;out.push('+'+h+' h d’entraînement dans la réserve');
 const b=bearerOf(g.cons);
 if(b)g.st.forEach(s=>{const n=f<1?.25:1,v0=b.st[s]||0;gainStat(b,s,n);const v=(b.st[s]||0)-v0;out.push(b.name+' : +'+Math.round(v)+' '+({fo:'force',vi:'vitesse',de:'dextérité',en:'endurance',ps:'psychokinésie',co:'cosmos'})[s]);});
 if(f<1)out.push('Au-delà de '+DAY_FULL+' niveaux par jour, les gains ne valent plus qu’un quart.');
 if(L===MG_LEVELS){const m=g.n+' : les '+MG_LEVELS+' niveaux sont réussis.';log(m);out.push(m);}
 S._dirty=true;return out;
}
export function mgFail(k){mgOf(k).tries++;}
// Répartir la réserve : h heures d'entraînement pour le personnage p.
export function givePool(p,h){ensureMG();h=Math.min(h,S.xpPool);if(!p||h<=0)return 0;S.xpPool=Math.round((S.xpPool-h)*10)/10;trainHours(p,h);return h;}

/* ---------- les niveaux ---------- */
const rngFor=(k,L,a=0)=>mulberry32((((k.length*7919)^(L*104729)^(a*15485863))+k.charCodeAt(0)*131)>>>0);
const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];

// La Flèche : glisse jusqu'à un rocher ou au bord ; étoiles à ramasser ; il faut s'arrêter sur la cible.
export function slide(lv,pos,d){
 const {w,h,rock}=lv;let x=pos%w,y=Math.floor(pos/w);const path=[];
 for(;;){const nx=x+DIRS[d][0],ny=y+DIRS[d][1];if(nx<0||ny<0||nx>=w||ny>=h||rock.has(ny*w+nx))break;x=nx;y=ny;path.push(y*w+x);}
 return{end:y*w+x,path};
}
function solveFleche(lv){
 const all=(1<<lv.stars.length)-1,starIdx=new Map(lv.stars.map((s,i)=>[s,i]));
 const seen=new Map(),q=[[lv.start,0,0]];seen.set(lv.start*16,0);
 while(q.length){const [p,m,dist]=q.shift();if(p===lv.target&&m===all)return dist;
  for(let d=0;d<4;d++){const {end,path}=slide(lv,p,d);if(end===p)continue;let mm=m;path.forEach(c=>{if(starIdx.has(c))mm|=1<<starIdx.get(c);});const key=end*16+mm;if(!seen.has(key)){seen.set(key,dist+1);q.push([end,mm,dist+1]);}}}
 return -1;
}
export function genFleche(L){
 const size=5+Math.floor((L-1)/4),nStars=L<3?0:L<8?1:L<14?2:3,want=3+Math.floor(L/2.5),slack=3-Math.floor(L/7);
 let best=null;
 for(let a=0;a<600;a++){
  const r=rngFor('fleche',L,a),w=size,h=size+(L>10?1:0),rock=new Set(),free=[];
  for(let i=0;i<w*h;i++){if(r()<.13+.008*L)rock.add(i);else free.push(i);}
  if(free.length<nStars+4)continue;
  const pick=()=>free.splice(Math.floor(r()*free.length),1)[0];
  const lv={w,h,rock,start:pick(),target:pick(),stars:[]};for(let i=0;i<nStars;i++)lv.stars.push(pick());
  const opt=solveFleche(lv);if(opt<0)continue;
  const score=Math.abs(opt-want);if(!best||score<best.score){best={lv,opt,score};}
  if(opt>=want&&opt<=want+2)break;
 }
 const {lv,opt}=best;return Object.assign(lv,{opt,limit:opt+Math.max(1,slack),rock:[...lv.rock]});
}
// La Lyre : une mélodie de plus en plus longue et rapide sur 5 cordes.
export function genLyre(L){const r=rngFor('lyre',L),n=3+Math.round(L*.55),seq=[];for(let i=0;i<n;i++)seq.push(Math.floor(r()*5));return{seq,ms:Math.max(320,720-L*20)};}
// L'Horloge : zones à toucher au passage de l'aiguille.
export function genHorloge(L){
 const r=rngFor('horloge',L),n=1+Math.floor(L/4),w=Math.max(14,70-L*3),zones=[];
 for(let i=0;i<n;i++){let c,ok=false;for(let t=0;t<40&&!ok;t++){c=r()*360;ok=zones.every(z=>Math.abs(((c-z.c+540)%360)-180)>w+8);}zones.push({c,w});}
 return{zones,speed:.35+L*.05,reverse:L>=8,lives:3};
}
// Le Burin : un motif à mémoriser puis à tailler.
export function genBurin(L){
 const r=rngFor('burin',L),n=3+Math.floor(L/5),k=Math.min(Math.floor(n*n*.55),3+Math.floor(L*.55)),cells=new Set();
 while(cells.size<k)cells.add(Math.floor(r()*n*n));
 return{n,cells:[...cells],showMs:Math.max(900,2600-L*80),cracks:L>=12?2:3};
}
// Le Fourneau : garder la chaleur dans la bande.
export function genFourneau(L){return{band:Math.max(10,34-L*1.2),need:4+L*.35,limit:Math.round((4+L*.35)*2.3),drift:.5+L*.08,moving:L>=6,seed:L};}
// Le Caméléon : trouver la pierre différente.
export function genCameleon(L){const r=rngFor('cameleon',L);return{n:Math.min(8,2+Math.floor(L/3)),delta:Math.max(3,26-L*1.15),rounds:5,mistakes:2,hue:Math.floor(r()*360)};}
export const GEN={fleche:genFleche,lyre:genLyre,horloge:genHorloge,burin:genBurin,fourneau:genFourneau,cameleon:genCameleon};
export function levelOf(k,L){return GEN[k](clamp(L,1,MG_LEVELS));}
export function gameName(k){const g=GAME_BY[k];return g?g.n+' ('+CONS_BY[g.cons].n+')':k;}
