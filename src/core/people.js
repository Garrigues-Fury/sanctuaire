/* Création des personnages et d’une nouvelle partie. */
import { NATS, NAT_KEYS, OCC, ZONES } from './data/countries.js';
import { EVENTS2, GOALS2, PARENTS2, VET_EVENTS2, VET_GOALS2, regionOf } from './data/bios.js';
import { SIG_WORDS, genTraits } from './data/traits.js';
import { CONS, CONS_BY, de } from './data/world.js';
import { emax, fkey } from './rules.js';
import { S, VERSION, log, setS, uid } from './state.js';
import { G, mulberry32, pick } from './util.js';
import { bornStats } from './scale.js';

export function rollStats(r,base,spread){return{fo:Math.round(base+r()*spread),vi:Math.round(base+r()*spread),en:Math.round(base+r()*spread),co:Math.round(base+r()*spread),de:Math.round(base+r()*spread),ps:Math.round(base+r()*spread)};}
export function fillG(t,p){return t.replace(/\{e\}/g,G(p,'e')).replace(/\{il\}/g,p.sex==='F'?'elle':'il').replace(/\{lui\}/g,p.sex==='F'?'elle':'lui');}
export function makeBio(p,r,vet){
 const N=NATS[p.nat],R=regionOf(N.z),ch=p.sex==='F'?'fille ':'fils ';
 const par=fillG(R&&r()<.35?pick(r,R.p):pick(r,PARENTS2),p),f=r();
 const l1=f<.45?'Né'+G(p,'e')+' '+(r()<.55?'à '+N.c:'dans un village '+N.d)+' ('+N.n+'), '+ch+par+'.'
  :f<.75?(p.sex==='F'?'Fille ':'Fils ')+par+', né'+G(p,'e')+' dans un village '+N.d+'.'
  :'Grandi'+G(p,'e')+' à '+N.c+' ('+N.n+'), '+ch+par+'.';
 const ev=vet?VET_EVENTS2:(R&&r()<.3?R.e:EVENTS2);
 return[l1,fillG(pick(r,ev),p),fillG(pick(r,vet?VET_GOALS2:GOALS2),p)];
}
// Prénoms déjà portés au Sanctuaire (chevaliers, apprentis, gardes, candidats, villageois).
export function takenNames(){if(!S)return new Set();return new Set([].concat(S.knights||[],S.aps||[],S.guards||[],S.pending||[],S.workers||[]).map(p=>p.name));}
// Un prénom libre de la liste ; si toute la liste est prise, deux prénoms composés (« Eleni-Sofia »).
export function freeName(r,list,taken){
 const free=list.filter(n=>!taken.has(n));if(free.length)return pick(r,free);
 for(let i=0;i<60;i++){const a=pick(r,list),b=pick(r,list),n=a+'-'+b;if(a!==b&&!taken.has(n))return n;}
 return pick(r,list)+' '+(taken.size+1);
}
// Doublons des anciennes parties : le plus récent reçoit un autre prénom de son pays (demande de Seba du 2026-10-27).
export function renameDuplicates(){
 const all=[].concat(S.knights||[],S.aps||[],S.guards||[],S.pending||[],S.workers||[]).sort((a,b)=>a.id-b.id),seen=new Set(),out=[];
 all.forEach(p=>{if(!seen.has(p.name)){seen.add(p.name);return;}const old=p.name,r=mulberry32((p.seed^0x9e3779b9)>>>0);
  p.name=freeName(r,p.nat==='France'&&r()<.3?OCC[p.sex]:ZONES[(NATS[p.nat]||NATS['Grèce']).z][p.sex],seen);seen.add(p.name);out.push(old+' → '+p.name);
  log('Deux personnes portaient le prénom '+old+' : la plus récemment arrivée se fait désormais appeler '+p.name+'.');});
 return out;
}
export function makePerson(seed,natPref,sexPref){
 const r=mulberry32(seed);const sx=r()<.5?'F':'M',sex=sexPref||sx;
 const nat=natPref||(r()<.25?'Grèce':pick(r,NAT_KEYS));
 const t=genTraits(r);
 return{seed,sex,nat,name:freeName(r,nat==='France'&&r()<.3?OCC[sex]:ZONES[NATS[nat].z][sex],takenNames()),sign:Math.floor(r()*12),qual:t.qual,flaw:t.flaw,sp:0};
}
// natPref : pays imposé (recrue trouvée en expédition). boost (0 à 1) : rapproche d'un fort potentiel.
// Équilibre filles et garçons : si l'un des deux sexes en compte 2 de plus parmi les apprentis et les candidats,
// la recrue suivante est le plus souvent de l'autre sexe (demande de Seba du 2026-10-25).
function wantedSex(){const L=(S.aps||[]).concat(S.pending||[]);const f=L.filter(a=>a.sex==='F').length,m=L.length-f;return Math.abs(f-m)>=2&&Math.random()<.75?(f>m?'M':'F'):null;}
export function makeApprentice(natPref,boost=0){
 const seed=(Math.random()*2**31)|0;const p=makePerson(seed,natPref,wantedSex());const r=mulberry32(seed^0x5bd1e995);
 const u=r()*(1-boost);const pot=u<.01?93+r()*7:u<.2?65+r()*28:25+r()*40;
 const fp=pot+(r()-.5)*18;const imp=fp<45?'Ordinaire':fp<65?'Solide':fp<86?'Prometteur':'Exceptionnel';
 const a=Object.assign(p,{id:uid(),age:8+Math.floor(r()*9),pot:Math.round(pot),imp,st:rollStats(r,3,9),lv:1,xp:0,master:null,tech:[],awk:false,cd:0,job:null,wacc:0,bio:makeBio(p,r,false)});
 a.nrg=emax(a);return a;
}
export function makeKnight(rank,cons,lv){
 const seed=(Math.random()*2**31)|0;const p=makePerson(seed);const r=mulberry32(seed^0x1234);
 if(rank==='or')p.sign=CONS_BY[cons].sign;
 // base d'apprenti selon l'expérience, puis l'échelle des rangs (×3 à 7 pour le bronze, ×5 à 15 de plus pour l'argent, ×5 à 30 pour l'or)
 const k=Object.assign(p,{id:uid(),rank,cons,lv,xp:0,st:bornStats(rollStats(r,14,12),rank,cons,r),role:null,tech:[pick(r,SIG_WORDS)+' '+(rank==='or'?'d’or':de(CONS_BY[cons].n))],origin:'survivant',pot:90,bio:makeBio(p,r,true)});
 k.nrg=emax(k);return k;
}
export function makeWorker(job){
 const seed=(Math.random()*2**31)|0;const p=makePerson(seed,Math.random()<.75?'Grèce':null);
 return{id:uid(),seed,sex:p.sex,nat:p.nat,name:p.name,sign:p.sign,job:job||null,skill:1,sxp:0};
}
// Difficulté choisie au début d'une partie (demande de Seba du 2026-10-25) : nombre de survivants par rang.
// Chaque chevalier mange 2 vivres par heure : les champs et les villageois du départ suivent, pour éviter une famine d'entrée.
export const DIFFS={
 facile:{n:'Facile',or:4,argent:6,bronze:10,champs:2,artisans:1,fields:4,res:{vivres:600,marbre:400,metal:140,savoir:40}},
 moyen:{n:'Moyen',or:3,argent:4,bronze:8,champs:2,artisans:0,fields:2,res:{vivres:450,marbre:300,metal:100,savoir:20}},
 dur:{n:'Difficile',or:2,argent:3,bronze:5,champs:1,artisans:0,fields:3,res:{vivres:320,marbre:220,metal:60,savoir:0}}
};
const NUM=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix'];
export function newGame(diff='moyen'){
 const D=DIFFS[diff]||DIFFS.moyen;
 setS({v:VERSION,idc:1,created:Date.now(),lastReal:Date.now(),gt:0,speed:1,diff:DIFFS[diff]?diff:'moyen',scaleV:1,
  res:Object.assign({},D.res),items:{herbes:10},
  b:{champs:D.champs,carriere:1,mine:1,biblio:0,jardin:0,herbo:0,atelier:0,arene:1,dortoirs:1,entrepot:1,forge:0,artisans:D.artisans},
  houses:new Array(12).fill(0),tools:{},craft:{herbo:[],atelier:[]},friend:{},fp:3,fpAcc:0,guards:[],
  jobs:[],forgeJob:null,knights:[],aps:[],pending:[],workers:[],recruitAcc:0,armors:{},log:[],flags:{},tab:'sanctuaire'});
 CONS.forEach(c=>S.armors[c.k]='brisee');
 const shuf=a=>a.slice().sort(()=>Math.random()-.5);
 const golds=shuf(CONS.filter(c=>c.rank==='or')),silvers=shuf(CONS.filter(c=>c.rank==='argent')),bronzes=shuf(CONS.filter(c=>c.rank==='bronze'));
 const lv=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
 golds.slice(0,D.or).forEach(c=>S.knights.push(makeKnight('or',c.k,lv(32,40))));
 silvers.slice(0,D.argent).forEach(c=>S.knights.push(makeKnight('argent',c.k,lv(17,24))));
 bronzes.slice(0,D.bronze).forEach(c=>S.knights.push(makeKnight('bronze',c.k,lv(8,14))));
 S.knights.forEach(k=>{S.armors[k.cons]='portee';if(k.rank==='or')S.houses[CONS_BY[k.cons].sign]=1;});
 // compagnons d'armes : les survivants se connaissent deux à deux
 for(let i=0;i+1<S.knights.length;i+=2)S.friend[fkey(S.knights[i].id,S.knights[i+1].id)]=2+(i===0?1:0);
 const found=bronzes.slice(D.bronze,D.bronze+2);found.forEach(c=>S.armors[c.k]='restauree');
 const jobs=new Array(D.fields).fill('champs').concat(['carriere','carriere','mine']);
 jobs.forEach(j=>S.workers.push(makeWorker(j)));
 S.pending.push(makeApprentice(),makeApprentice());S.perm=[];S.artefacts=[];S.faveur=0;S.gods={};S.duel={lastDate:'',lastGt:-999};S.match=null;
 const n=S.knights.length,say=x=>NUM[x]||String(x);
 log('La guerre sainte est finie. Le Sanctuaire n’est plus que ruines, et '+n+' chevaliers seulement ont survécu : '+say(D.or)+' d’or, '+say(D.argent)+' d’argent, '+say(D.bronze)+' de bronze.');
 log(say(jobs.length).replace(/^./,c=>c.toUpperCase())+' villageois sont montés aider aux champs, à la carrière et à la mine.');
 if(found.length)log('Deux armures de bronze ont été retrouvées intactes sous les décombres : '+found.map(c=>c.n).join(' et ')+'.');
 log('Deux enfants se présentent aux portes. Ils veulent devenir chevaliers.');
}
export function makeGuardFrom(ap){
 return{id:ap.id,seed:ap.seed,sex:ap.sex,name:ap.name,nat:ap.nat,qual:ap.qual,flaw:ap.flaw,bio:ap.bio,sign:ap.sign,rank:'garde',lv:ap.lv,xp:0,st:Object.assign({},ap.st),sp:ap.sp||0,nrg:ap.nrg,tech:ap.tech.slice(),post:null,pot:ap.pot,origin:'apprenti',sk:ap.sk,skp:ap.skp,skx:ap.skx,tr:ap.tr};
}
