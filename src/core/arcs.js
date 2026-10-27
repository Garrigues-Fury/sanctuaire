/* Feuilletons (demandés par Seba le 2026-10-27, « comme dans Is it love ») : de longues histoires en épisodes
   entre deux chevaliers (parfois trois), qui se jouent sur plusieurs jours.
   - Un épisode à la fois ; le suivant arrive 18 à 30 h de jeu plus tard. Deux feuilletons au plus en même temps.
   - L'affection est cachée : aucun chiffre ne s'affiche, on la devine aux réactions. Les choix laissent des traces
     (drapeaux) que les épisodes suivants se rappellent ; l'enquête réunit des indices.
   - Le dénouement dépend de tout cela : couple, tendre amitié, respect, ou rien.
   - Romances : un homme et une femme adultes seulement (choix de Seba) ; jamais d'apprenti. */
import { ARCS } from './data/arcs.js';
import { NATS } from './data/countries.js';
import { canRomance, adult, isCouple, partnerOf, chem, rivalOf } from './romance.js';
import { compat } from './social.js';
import { S, emit, log } from './state.js';
import { G, mulberry32, pick } from './util.js';
import { COMPLEXES } from './character.js';
import { CX_LINES } from './data/lifescenes.js';

const r=()=>Math.random();
export const ARC_MAX=2;
export function ensureArcs(){if(!S.arcs)S.arcs=[];if(!S.arcsDone)S.arcsDone=[];if(S.arcAt==null)S.arcAt=S.gt+6;S.arcSeq=S.arcSeq||1;return S.arcs;}
const people=()=>S.knights.concat(S.guards||[]);
const busy=p=>S.arcs.some(a=>!a.done&&[a.k,a.k2,a.k3].includes(p.id));
// Les distributions possibles pour un feuilleton.
export function arcCast(key){
 const D=ARCS[key],P=people().filter(p=>adult(p)&&!busy(p)),out=[];
 if(D.once&&S.arcsDone.includes(key))return out;
 for(let i=0;i<P.length;i++)for(let j=0;j<P.length;j++){if(i===j)continue;const a=P[i],b=P[j];
  if(D.type==='romance'&&canRomance(a,b)&&!isCouple(a,b)&&!partnerOf(a)&&!partnerOf(b)&&(chem(a,b)>.5||compat(a,b).v>=1))out.push([a,b]);
  if(D.type==='rival'&&a.id<b.id&&(rivalOf(a,b)>=2||compat(a,b).v<=-1||Math.abs(a.lv-b.lv)<=4&&a.rank===b.rank&&chem(a,b)>.7))out.push([a,b]);
  if(D.type==='enquete'&&a.id<b.id)out.push([a,b]);}
 return out;
}
// De temps en temps (toutes les 30 à 48 h), un nouveau feuilleton commence s'il y a de la place.
export function tickArcs(sum){
 ensureArcs();if(S.gt<S.arcAt)return;S.arcAt=S.gt+30+r()*18;
 if(S.arcs.filter(a=>!a.done).length>=ARC_MAX)return;
 const keys=Object.keys(ARCS).filter(k=>arcCast(k).length);if(!keys.length)return;
 const key=pick(r,keys),A=newArc(key,pick(r,arcCast(key)));
 const m='Un nouveau feuilleton commence : « '+ARCS[key].n+' », avec '+A.names.join(' et ')+'.';log(m);sum?sum.ev.push(m):emit('social');S._dirty=true;
}
export function newArc(key,[a,b,c]){
 ensureArcs();const seed=(r()*2**31)|0;
 const A={id:S.arcSeq++,key,k:a.id,k2:b.id,k3:c?c.id:null,ep:0,at:S.gt,aff:0,flags:[],clues:[],done:false,seed,names:[a.name,b.name]};
 if(r()<.5&&ARCS[key].type!=='romance'){A.k=b.id;A.k2=a.id;A.names=[b.name,a.name];}
 S.arcs.push(A);return A;
}
export const arcById=id=>(S.arcs||[]).find(a=>a.id===id)||null;
export function arcReady(A){return!A.done&&S.gt>=A.at;}
export function readyArcs(){ensureArcs();return S.arcs.filter(arcReady).filter(A=>{const P=people();return P.some(p=>p.id===A.k)&&P.some(p=>p.id===A.k2);});}
export function episodeKey(A){return A.key+(A.ep+1);}
export function episodeTitle(A){return ARCS[A.key].eps[A.ep]||'';}

// Variables d'un épisode : noms, accords, pays, complexe, et les personnages secondaires (toujours les mêmes d'un épisode à l'autre).
export function arcVars(A,k,k2,k3){
 const R=mulberry32(A.seed>>>0),Nk=NATS[k.nat]||NATS['Grèce'],N2=NATS[k2.nat]||NATS['Grèce'];
 const v={k:k.name,e:G(k,'e'),il:k.sex==='F'?'elle':'il',Il:k.sex==='F'?'Elle':'Il',lui:k.sex==='F'?'elle':'lui',
  k2:k2.name,e2:G(k2,'e'),il2:k2.sex==='F'?'elle':'il',Il2:k2.sex==='F'?'Elle':'Il',lui2:k2.sex==='F'?'elle':'lui',
  pays:Nk.n,pays2:N2.n,d2:N2.d,ville2:N2.c,cx2:k2.cx?COMPLEXES[k2.cx.k].n.toLowerCase():'',cxline:k2.cx?CX_LINES[k2.cx.k]:'',
  k3:k3?k3.name:'',e3:k3?G(k3,'e'):''};
 v.archiviste=pick(R,['Théophane','Kostas','Lysandre','Damon']);v.servante=pick(R,['Ismène','Eudoxie','Phèdre','Mélina']);
 return v;
}
// L'épisode est fini : on range l'affection, les drapeaux et les indices, puis on prépare le suivant.
export function endEpisode(A,fx,out){
 fx.forEach(f=>{const [t,x]=f.split(':');
  if(t==='aff')A.aff+=(+x);
  if(t==='flag'&&!A.flags.includes(x))A.flags.push(x);
  if(t==='clue'&&!A.clues.includes(x)){A.clues.push(x);out.push('Indice : '+((ARCS[A.key].clues||{})[x]||x));}});
 A.ep++;
 const D=ARCS[A.key];
 if(A.ep>=D.eps.length||fx.includes('arcend')){A.done=true;if(!S.arcsDone.includes(A.key))S.arcsDone.push(A.key);out.push('Fin du feuilleton « '+D.n+' ».');log('Fin du feuilleton « '+D.n+' » ('+A.names.join(' et ')+').');}
 else{A.at=S.gt+18+r()*12;out.push('Épisode '+A.ep+' sur '+D.eps.length+' terminé. La suite dans quelques heures : « '+D.eps[A.ep]+' ».');}
 S._dirty=true;
}
// Conditions propres aux feuilletons : drapeau, absence de drapeau, affection minimale, nombre d'indices, romance possible, complexe.
export function arcCond(req,A,roles){
 if(!A)return true;
 if(req.flag&&!A.flags.includes(req.flag))return false;
 if(req.noflag&&A.flags.includes(req.noflag))return false;
 if(req.aff!=null&&A.aff<req.aff)return false;
 if(req.affMax!=null&&A.aff>req.affMax)return false;
 if(req.clues!=null&&A.clues.length<req.clues)return false;
 if(req.romance!=null&&!!(roles.k&&roles.k2&&canRomance(roles.k,roles.k2))!==!!req.romance)return false;
 if(req.cx2!=null&&!!(roles.k2&&roles.k2.cx)!==!!req.cx2)return false;
 return true;
}
