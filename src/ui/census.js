/* Recensement du Sanctuaire (demandé par Seba le 2026-10-27) : une vue d'ensemble de qui vit au Sanctuaire.
   Vue générale, éléments, signes, nationalités, et classements par compétence ou par statistique. */
import { NATS } from '../core/data/countries.js';
import { REGIONS, regionOf } from '../core/data/worldmap.js';
import { FAMILIES, SKILLS } from '../core/data/skills.js';
import { CONS_BY, EKEYS, ELEM, RANKS, SIGNS, armorName } from '../core/data/world.js';
import { elemScores, people, power, sanctPower } from '../core/rules.js';
import { skillLevel } from '../core/skills.js';
import { S } from '../core/state.js';
import { esc, fmt } from '../core/util.js';
import { bar, ptImg } from './app.js';
import { icon } from './icons.js';

export const CENSUS_VIEWS=[['general','Général'],['elements','Éléments'],['signes','Signes'],['nations','Nations'],['competences','Compétences'],['stats','Statistiques']];
const ST=[['lv','Niveau'],['power','Puissance'],['fo','Force'],['vi','Vitesse'],['de','Dextérité'],['en','Endurance'],['ps','Psychokinésie'],['co','Cosmos']];
let view='general',pick=null,skill='F1',stat='power';
export function setCensus(v,p){if(v==='view'){view=p;pick=null;}else if(v==='pick')pick=pick===p?null:p;else if(v==='skill')skill=p;else if(v==='stat')stat=p;}

// Grade d'un personnage, et ce qu'on affiche sur sa ligne.
const kindOf=p=>S.knights.includes(p)?'k':(S.guards||[]).includes(p)?'g':'a';
const rankOf=p=>kindOf(p)==='k'?p.rank:kindOf(p)==='g'?'garde':null;
const gradeN=p=>kindOf(p)==='k'?'Chevalier '+(p.rank==='or'?'d’or':p.rank==='argent'?'d’argent':'de bronze'):kindOf(p)==='g'?'Garde':'Apprenti'+(p.sex==='F'?'e':'');
const powOf=p=>power(p,rankOf(p))*(kindOf(p)==='a'?.5:1);
const ORDER={or:0,argent:1,bronze:2,garde:3};
const byRank=(a,b)=>(ORDER[rankOf(a)]??4)-(ORDER[rankOf(b)]??4)||b.lv-a.lv;
function row(p,right){
 const c=kindOf(p)==='k'?CONS_BY[p.cons]:null;
 return '<button class="cen-row" data-act="'+(kindOf(p)==='k'?'knight':kindOf(p)==='g'?'guard':'ap')+':'+p.id+'">'+ptImg(p,rankOf(p))+'<span class="main"><b>'+esc(p.name)+'</b><small>'+gradeN(p)+(c?' · '+esc(armorName(c)):'')+' · niv. '+p.lv+' · '+esc((NATS[p.nat]||{n:p.nat}).n)+'</small></span>'+(right!=null?'<b class="num cen-v">'+right+'</b>':'')+'</button>';
}
const list=L=>L.length?'<div class="cen-list">'+L.join('')+'</div>':'<div class="empty">Personne.</div>';
function counts(L){const k=L.filter(p=>kindOf(p)==='k');return{or:k.filter(p=>p.rank==='or').length,argent:k.filter(p=>p.rank==='argent').length,bronze:k.filter(p=>p.rank==='bronze').length,garde:L.filter(p=>kindOf(p)==='g').length,ap:L.filter(p=>kindOf(p)==='a').length};}
const countLine=c=>[c.or&&c.or+' or',c.argent&&c.argent+' argent',c.bronze&&c.bronze+' bronze',c.garde&&c.garde+' garde'+(c.garde>1?'s':''),c.ap&&c.ap+' apprenti'+(c.ap>1?'s':'')].filter(Boolean).join(' · ')||'personne';

/* ---------- vues ---------- */
function general(){
 const P=people(),c=counts(P),f=P.filter(p=>p.sex==='F').length,avg=P.length?P.reduce((t,p)=>t+p.lv,0)/P.length:0;
 const nat=new Set(P.map(p=>p.nat)).size,reg=new Set(P.map(p=>regionOf(p.nat))).size;
 const kp=(ic,l,v,s)=>'<div class="kpi">'+icon(ic,18)+'<div class="kv num">'+v+'</div><div class="kl">'+l+'</div>'+(s?'<div class="ks">'+s+'</div>':'')+'</div>';
 let h='<div class="kpis">'+kp('users','Habitants',P.length+S.workers.length,P.length+' combattants · '+S.workers.length+' villageois')+kp('sword','Chevaliers',c.or+c.argent+c.bronze,c.or+' or · '+c.argent+' argent · '+c.bronze+' bronze')+kp('cap','Apprentis',c.ap,S.pending.length?S.pending.length+' aux portes':'')+kp('shield','Gardes',c.garde,'')+
  kp('heart','Femmes et hommes',f+' / '+(P.length-f),'')+kp('star','Niveau moyen',avg.toFixed(1).replace('.',','),'')+kp('globe','Origines',nat+' pays',reg+' régions du monde')+kp('crown','Puissance',fmt(sanctPower()),'du Sanctuaire')+'</div>';
 const top=P.slice().sort((a,b)=>powOf(b)-powOf(a)).slice(0,5);
 h+='<div class="sec-h"><h2>Les plus puissants</h2></div>'+list(top.map(p=>row(p,fmt(powOf(p)))));
 return h;
}
// Un groupe (élément, signe, pays) : ses chiffres, et ses membres quand on le touche.
function groupCard(key,title,sub,L,extra){
 const open=pick===key,pw=L.reduce((t,p)=>t+powOf(p),0);
 return '<div class="cen-g'+(open?' open':'')+'"><button class="cen-gh" data-act="census:pick:'+key+'" aria-expanded="'+open+'">'+title+'<span class="main"><small>'+sub+'</small><small>'+countLine(counts(L))+'</small>'+(extra||'')+'</span><b class="num cen-v">'+fmt(pw)+'</b></button>'+(open?list(L.slice().sort(byRank).map(p=>row(p,fmt(powOf(p))))):'')+'</div>';
}
function elements(){
 const P=people(),E=elemScores(),tot=P.reduce((t,p)=>t+powOf(p),0)||1;
 let h='<p class="hint">Chaque personnage appartient à l’élément de son signe. Le score d’élément donne les gemmes de départ de la lecture des astres ; la puissance additionne celle des personnages. Touchez un élément pour voir qui le porte.</p>';
 EKEYS.forEach(e=>{const L=P.filter(p=>SIGNS[p.sign].el===e),pw=L.reduce((t,p)=>t+powOf(p),0);
  h+=groupCard('e-'+e,'<span class="chip el-'+e+'">'+ELEM[e]+'</span>','score des astres '+fmt(E[e])+' · '+Math.round(pw/tot*100)+' % de la puissance',L,bar(pw/tot*100,'','el-'+e));});
 return h;
}
function signes(){
 const P=people();let h='<p class="hint">Les douze signes du zodiaque. Un maître du même signe forme 1,5 fois plus vite ; la maison du signe ajoute 10 % par niveau.</p>';
 SIGNS.forEach((s,i)=>{const L=P.filter(p=>p.sign===i);h+=groupCard('s-'+i,'<span class="hs" style="color:var(--'+s.el+')">'+s.s+'</span>','<b>'+s.n+'</b> · '+ELEM[s.el].toLowerCase()+' · maison niv. '+S.houses[i],L);});
 return h;
}
function nations(){
 const P=people(),byReg={};P.forEach(p=>{const r=regionOf(p.nat);(byReg[r]=byReg[r]||[]).push(p);});
 const regs=Object.keys(byReg).sort((a,b)=>byReg[b].length-byReg[a].length);
 let h='<p class="hint">D’où viennent les chevaliers, les gardes et les apprentis, par région du monde puis par pays. Touchez un pays pour voir qui en vient.</p>';
 regs.forEach(r=>{const L=byReg[r],byNat={};L.forEach(p=>(byNat[p.nat]=byNat[p.nat]||[]).push(p));
  h+='<div class="sec-h"><h2>'+esc(REGIONS[r].n)+'</h2><span class="aside">'+L.length+' personne'+(L.length>1?'s':'')+'</span></div>';
  Object.keys(byNat).sort((a,b)=>byNat[b].length-byNat[a].length||a.localeCompare(b)).forEach(n=>{h+=groupCard('n-'+n,'<b class="num cen-n">'+byNat[n].length+'</b>','<b>'+esc(NATS[n].n)+'</b>',byNat[n]);});});
 return h;
}
function competences(){
 const P=people(),opts=Object.keys(FAMILIES).map(f=>'<optgroup label="'+esc(FAMILIES[f].n)+'">'+Object.values(SKILLS).filter(s=>s.fam===f).map(s=>'<option value="'+s.id+'"'+(s.id===skill?' selected':'')+'>'+esc(s.n)+'</option>').join('')+'</optgroup>').join('');
 const L=P.filter(p=>skillLevel(p,skill)>0).sort((a,b)=>skillLevel(b,skill)-skillLevel(a,skill)||b.lv-a.lv);
 let h='<label class="auto-add"><span>Compétence à comparer</span><select data-census="skill">'+opts+'</select></label>';
 h+='<p class="hint">'+esc((SKILLS[skill]||{}).d||'')+' '+L.length+' personne'+(L.length>1?'s la maîtrisent':' la maîtrise')+'.</p>';
 return h+list(L.map((p,i)=>row(p,'<span class="cen-rank">'+(i+1)+'</span>niv. '+skillLevel(p,skill))));
}
function stats(){
 const P=people(),val=p=>stat==='lv'?p.lv:stat==='power'?powOf(p):(p.st[stat]||0);
 const L=P.slice().sort((a,b)=>val(b)-val(a));
 let h='<label class="auto-add"><span>Statistique à comparer</span><select data-census="stat">'+ST.map(([k,n])=>'<option value="'+k+'"'+(k===stat?' selected':'')+'>'+n+'</option>').join('')+'</select></label>';
 return h+list(L.map((p,i)=>row(p,'<span class="cen-rank">'+(i+1)+'</span>'+fmt(val(p)))));
}
export function viewCensus(){
 const seg='<div class="seg cen-seg" role="tablist">'+CENSUS_VIEWS.map(([k,n])=>'<button role="tab" aria-selected="'+(view===k)+'" data-act="census:view:'+k+'">'+n+'</button>').join('')+'</div>';
 const body={general,elements,signes,nations,competences,stats}[view]||general;
 return '<section class="sec">'+seg+body()+'</section>';
}
