/* Échelle des statistiques par rang (demandée par Seba le 2026-10-27, « cf. Saint Seiya ») :
   - un chevalier de bronze a 3 à 7 fois les statistiques d'un apprenti ; un apprenti qui devient bronze voit
     chaque statistique multipliée par 3 à 10, selon son profil et ses compétences ;
   - un argent a 5 à 15 fois celles d'un bronze ; un or 5 à 30 fois celles d'un argent ;
   - chaque point gagné (niveau, séance, programme) est multiplié par le coefficient du rang :
     +1 sur un chevalier d'or à plusieurs dizaines de milliers ne servirait à rien.
   Les formules réglées à l'échelle d'un apprenti (combat, cosmos du Pope, recrutement, épreuves…) lisent
   la statistique « ramenée » : valeur ÷ coefficient. */
import { profileOf } from './armor.js';
import { FUND } from './data/skills.js';
import { CONS_BY } from './data/world.js';
import { skillLevel } from './skills.js';
import { S, log } from './state.js';
import { clamp, mulberry32 } from './util.js';

export const STATS6=['fo','vi','de','en','ps','co'];
// Coefficient de chaque rang (moyennes des fourchettes de Seba : ×5, puis ×10, puis ×15).
export const RANK_COEF={bronze:5,argent:50,or:750};
// Multiplicateurs d'une promotion, statistique par statistique.
export const PROMO={bronze:[3,10],argent:[5,15],or:[5,30]};
// Fourchette d'un chevalier tiré au sort (survivant, disciple venu d'ailleurs) par rapport au rang du dessous.
const BORN={bronze:[3,7],argent:[5,15],or:[5,30]};
const ORDER=['bronze','argent','or'];

export function coefOf(p){if(p&&p.scale!=null)return p.scale;return(p&&RANK_COEF[p.rank])||1;}
// Statistique ramenée à l'échelle d'un apprenti.
export function norm(p,k){return((p.st&&p.st[k])||0)/coefOf(p);}
// Gagner n points dans une statistique, au coefficient du rang.
export function gainStat(p,k,n=1){p.st[k]=(p.st[k]||0)+Math.round(n*coefOf(p));}

// Profil d'une statistique pour une armure : 0 à 1 (qualité maîtresse, point fort du personnage, compétences).
function profileScore(p,c,k,r){
 const mean=STATS6.reduce((t,x)=>t+(p.st[x]||0),0)/6||1;
 const master=c&&profileOf(c).includes(k)?1:0;
 const strong=clamp(((p.st[k]||0)/mean-.7)/.8,0,1);
 const fund=FUND.reduce((t,s)=>t+skillLevel(p,s.id),0)/FUND.length/10;
 return clamp(.4*master+.3*strong+.25*fund+.1*(r()-.5),0,1);
}
// Une promotion vers le rang `to` : chaque statistique est multipliée selon le profil. Renvoie les multiplicateurs.
export function promoteStats(p,c,to){
 const [a,b]=PROMO[to],r=mulberry32(((p.seed||p.id||1)*2654435761^ORDER.indexOf(to))>>>0),out={};
 STATS6.forEach(k=>{const m=a+(b-a)*profileScore(p,c,k,r);out[k]=m;p.st[k]=Math.max(1,Math.round((p.st[k]||0)*m));});
 return out;
}
// Statistiques d'un chevalier tiré au sort : base d'apprenti, puis un multiplicateur par rang franchi.
export function bornStats(base,rank,cons,r){
 const c=CONS_BY[cons],keys=c?profileOf(c):[],st={};
 STATS6.forEach(k=>{let v=base[k];for(const rk of ORDER){const [a,b]=BORN[rk];const t=clamp(r()*.75+(keys.includes(k)?.3:0),0,1);v*=a+(b-a)*t;if(rk===rank)break;}st[k]=Math.round(v);});
 return st;
}
// Anciennes parties : les chevaliers passent à la nouvelle échelle une fois pour toutes.
// Leurs statistiques d'avant étaient déjà plus hautes selon le rang : on les ramène d'abord à une base d'apprenti.
export const OLD={bronze:1,argent:1.8,or:3.4};
// Valeur à l'ancienne échelle (celle des seuils écrits dans les scènes : « Force 40 »…).
export function legacy(p,k){return norm(p,k)*(OLD[p.rank]||1);}
export function migrateScale(){
 if(!S||S.scaleV>=1)return;
 S.knights.forEach(k=>{const r=mulberry32(((k.seed||k.id)^0x51ed27)>>>0),base={};STATS6.forEach(x=>base[x]=(k.st[x]||0)/(OLD[k.rank]||1));k.st=bornStats(base,k.rank,k.cons,r);});
 S.scaleV=1;
 if(S.knights.length)log('Les chevaliers révèlent leur vraie mesure : un chevalier de bronze vaut plusieurs apprentis, un chevalier d’argent dix bronzes, un chevalier d’or quinze argents.');
}
