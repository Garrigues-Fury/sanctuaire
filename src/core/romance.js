/* Vie entre personnages (demandée par Seba le 2026-10-27) : amours, jalousies, disputes, rivalités, réconciliations, soutien.
   - Les romances ne concernent que des adultes, un homme et une femme (choix de Seba) ; jamais un apprenti.
   - L'attirance (0 à 10) monte au fil des scènes ; à 6, on peut avouer ses sentiments : un couple se forme, ou non.
   - La rivalité (0 à 10) monte dans les défis et les disputes, et baisse avec les réconciliations.
   - Les effets des scènes (fx) sont appliqués par applyLifeFx, appelé à la fin d'une scène au Sanctuaire. */
import { compat } from './social.js';
import { S, log } from './state.js';
import { clamp, mulberry32 } from './util.js';
import { COMPLEXES } from './character.js';

const key=(a,b)=>a<b?a+'-'+b:b+'-'+a;
export function ensureLove(){if(!S.love)S.love={};if(!S.couple)S.couple={};if(!S.rival)S.rival={};}
export const loveOf=(a,b)=>(S.love&&S.love[key(a.id,b.id)])||0;
export const rivalOf=(a,b)=>(S.rival&&S.rival[key(a.id,b.id)])||0;
export const friendOf=(a,b)=>(S.friend&&S.friend[key(a.id,b.id)])||0;
export const isCouple=(a,b)=>!!S.couple&&S.couple[key(a.id,b.id)]!=null;
// Le ou la partenaire d'un personnage, s'il est en couple.
export function partnerOf(p){
 if(!S.couple)return null;
 for(const k in S.couple){const [x,y]=k.split('-').map(Number);if(x===p.id||y===p.id){const o=x===p.id?y:x;return people().find(q=>q.id===o)||null;}}
 return null;
}
const people=()=>S.knights.concat(S.aps,S.guards||[]);
// Adulte : chevaliers et gardes de 18 ans ou plus. Les apprentis sont toujours exclus.
export function adult(p){return!!p&&!S.aps.includes(p)&&!(p.age!=null&&p.age<18);}
// Une alchimie propre à chaque paire, toujours la même (0 à 1).
export function chem(a,b){const r=mulberry32(((Math.min(a.seed||a.id,b.seed||b.id)*31)^(Math.max(a.seed||a.id,b.seed||b.id)*17)^0x6f1d)>>>0);r();return r();}
export function canRomance(a,b){return adult(a)&&adult(b)&&a.sex!==b.sex&&a.sex&&b.sex;}
// Une attirance possible : alchimie forte ou bonne entente, et personne n'est déjà en couple ailleurs.
function attracted(a,b){if(!canRomance(a,b)||isCouple(a,b))return false;if(partnerOf(a)||partnerOf(b))return false;return chem(a,b)>.62||compat(a,b).v>=2||loveOf(a,b)>0;}
const competitive=p=>(p.qual||[]).some(q=>['orgueilleux','fougueux','courageux'].includes(q.k))||(p.flaw||[]).some(f=>f.k==='arrogant');

/* Distribution des rôles : pour chaque besoin, la liste des castings possibles [k, k2, k3?].
   k est le personnage que joue le joueur ; k2 l'autre ; k3 le tiers (jalousie). */
export function castFor(need){
 ensureLove();const P=people().filter(p=>!S.pending.includes(p)),out=[];
 const each=f=>{for(let i=0;i<P.length;i++)for(let j=0;j<P.length;j++)if(i!==j)f(P[i],P[j]);};
 if(need==='attract')each((a,b)=>{if(a.id<b.id&&attracted(a,b)&&loveOf(a,b)<3)out.push([a,b]);});
 if(need==='date')each((a,b)=>{if(a.id<b.id&&attracted(a,b)&&loveOf(a,b)>=3&&loveOf(a,b)<6)out.push([a,b]);});
 if(need==='confess')each((a,b)=>{if(attracted(a,b)&&loveOf(a,b)>=6)out.push([a,b]);});
 if(need==='couple')each((a,b)=>{if(a.id<b.id&&isCouple(a,b))out.push([a,b]);});
 if(need==='jealous')each((a,b)=>{if(!isCouple(a,b))return;P.forEach(c=>{if(c!==a&&c!==b&&canRomance(b,c)&&(chem(b,c)>.55||friendOf(b,c)>=3||loveOf(b,c)>0))out.push([a,b,c]);});});
 if(need==='rival')each((a,b)=>{if(a.id<b.id&&a.rank===b.rank&&Math.abs((a.lv||1)-(b.lv||1))<=6&&(competitive(a)||competitive(b)||rivalOf(a,b)>=2))out.push([a,b]);});
 if(need==='cold')each((a,b)=>{if(a.id<b.id&&(rivalOf(a,b)>=3||compat(a,b).v<=-2)&&friendOf(a,b)<=2)out.push([a,b]);});
 if(need==='support')each((f,p)=>{if(p.cx&&(f.bon||0)>0&&friendOf(f,p)>=1&&!S.aps.includes(f))out.push([f,p]);});
 if(need==='prank')each((a,b)=>{if((a.ton==='deconneur'||a.ton==='taquin')&&!S.aps.includes(a)&&!S.aps.includes(b))out.push([a,b]);});
 return out;
}
export const LIFE_NEEDS=new Set(['attract','date','confess','couple','jealous','rival','cold','support','prank']);
// Chance qu'un aveu soit accepté : l'attirance, l'entente, le cœur.
export function acceptChance(a,b){return clamp(.2+loveOf(a,b)/12+compat(a,b).v*.05+((a.bon||0)>20?.05:0)+(b.ton==='tendre'?.05:0),.1,.95);}

/* ---------- effets des scènes ---------- */
const add=(T,a,b,n,max=10)=>{const k=key(a.id,b.id);T[k]=clamp((T[k]||0)+n,0,max);return T[k];};
// f : l'effet (« love:2 », « couple », « bon:k:-5 »…), roles : {k,k2,k3}, out : la liste des gains, en clair.
export function applyLifeFx(f,roles,out){
 ensureLove();const [t,x,y]=f.split(':'),{k,k2,k3}=roles;
 const who=w=>w==='k2'?k2:w==='k3'?k3:k;
 if(t==='love'&&k&&k2&&canRomance(k,k2)){const v=add(S.love,k,k2,+x);out.push('Attirance '+k.name+' – '+k2.name+' : '+v+'/10');}
 if(t==='couple'&&k&&k2&&canRomance(k,k2)){S.couple[key(k.id,k2.id)]=S.gt;add(S.friend,k,k2,2);const m=k.name+' et '+k2.name+' sont désormais en couple.';log(m);out.push(m);}
 if(t==='breakup'&&k&&k2&&isCouple(k,k2)){delete S.couple[key(k.id,k2.id)];S.love[key(k.id,k2.id)]=3;const m=k.name+' et '+k2.name+' se sont séparés.';log(m);out.push(m);}
 if(t==='rival'&&k&&k2){const v=add(S.rival,k,k2,+x);out.push('Rivalité '+k.name+' – '+k2.name+' : '+v+'/10');}
 if(t==='rival3'&&k&&k3){const v=add(S.rival,k,k3,+x);out.push('Rivalité '+k.name+' – '+k3.name+' : '+v+'/10');}
 if(t==='friend'&&k&&k2){const v=add(S.friend,k,k2,+x);out.push('Amitié '+k.name+' – '+k2.name+' : '+v+'/10');}
 if(t==='friend3'&&k&&k3){const v=add(S.friend,k,k3,+x);out.push('Amitié '+k.name+' – '+k3.name+' : '+v+'/10');}
 if(t==='friend23'&&k2&&k3){const v=add(S.friend,k2,k3,+x);out.push('Amitié '+k2.name+' – '+k3.name+' : '+v+'/10');}
 if(t==='bon'){const p=who(x);if(p&&p.bon!=null){p.bon=clamp(p.bon+(+y),-100,100);out.push(p.name+' : cœur '+(+y>0?'+':'')+y+' ('+p.bon+')');}}
 if(t==='conf'){const p=who(x);if(p&&p.cx){p.cx.conf=Math.min(100,p.cx.conf+(+y));if(p.cx.conf>=100){const m=p.name+' a cessé de douter de '+COMPLEXES[p.cx.k].n.toLowerCase()+'.';log(m);out.push(m);p.cx=null;}else out.push(p.name+' : confiance +'+y+' ('+Math.round(p.cx.conf)+'/100)');}}
}
