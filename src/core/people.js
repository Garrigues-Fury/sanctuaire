/* Création des personnages et d’une nouvelle partie. */
import { NATS, NAT_KEYS, OCC, ZONES } from './data/countries.js';
import { EVENTS2, GOALS2, PARENTS2, VET_EVENTS2, VET_GOALS2, regionOf } from './data/bios.js';
import { SIG_WORDS, genTraits } from './data/traits.js';
import { CONS, CONS_BY, de } from './data/world.js';
import { emax, fkey } from './rules.js';
import { S, VERSION, log, setS, uid } from './state.js';
import { G, mulberry32, pick } from './util.js';

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
export function makePerson(seed,natPref,sexPref){
 const r=mulberry32(seed);const sx=r()<.5?'F':'M',sex=sexPref||sx;
 const nat=natPref||(r()<.25?'Grèce':pick(r,NAT_KEYS));
 const t=genTraits(r);
 return{seed,sex,nat,name:pick(r,nat==='France'&&r()<.3?OCC[sex]:ZONES[NATS[nat].z][sex]),sign:Math.floor(r()*12),qual:t.qual,flaw:t.flaw,sp:0};
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
 const base={bronze:14,argent:26,or:48}[rank];
 const k=Object.assign(p,{id:uid(),rank,cons,lv,xp:0,st:rollStats(r,base,14),role:null,tech:[pick(r,SIG_WORDS)+' '+(rank==='or'?'d’or':de(CONS_BY[cons].n))],origin:'survivant',pot:90,bio:makeBio(p,r,true)});
 k.nrg=emax(k);return k;
}
export function makeWorker(job){
 const seed=(Math.random()*2**31)|0;const p=makePerson(seed,Math.random()<.75?'Grèce':null);
 return{id:uid(),seed,sex:p.sex,nat:p.nat,name:p.name,sign:p.sign,job:job||null,skill:1,sxp:0};
}
export function newGame(){
 setS({v:VERSION,idc:1,created:Date.now(),lastReal:Date.now(),gt:0,speed:1,
  res:{vivres:320,marbre:220,metal:60,savoir:0},items:{herbes:10},
  b:{champs:1,carriere:1,mine:1,biblio:0,jardin:0,herbo:0,atelier:0,arene:1,dortoirs:1,entrepot:1,forge:0,artisans:0},
  houses:new Array(12).fill(0),tools:{},craft:{herbo:[],atelier:[]},friend:{},fp:3,fpAcc:0,guards:[],
  jobs:[],forgeJob:null,knights:[],aps:[],pending:[],workers:[],recruitAcc:0,armors:{},log:[],flags:{},tab:'sanctuaire'});
 CONS.forEach(c=>S.armors[c.k]='brisee');
 const goldSign=Math.floor(Math.random()*12);
 const silvers=CONS.filter(c=>c.rank==='argent'),bronzes=CONS.filter(c=>c.rank==='bronze').slice().sort(()=>Math.random()-.5);
 const sv=silvers[Math.floor(Math.random()*silvers.length)];
 [makeKnight('or','or-'+goldSign,38),makeKnight('argent',sv.k,21),makeKnight('bronze',bronzes[0].k,12),makeKnight('bronze',bronzes[1].k,10)].forEach(k=>{S.knights.push(k);S.armors[k.cons]='portee';});
 S.houses[goldSign]=1;
 S.friend[fkey(S.knights[0].id,S.knights[1].id)]=3;S.friend[fkey(S.knights[2].id,S.knights[3].id)]=2;
 S.armors[bronzes[2].k]='restauree';S.armors[bronzes[3].k]='restauree';
 ['champs','champs','carriere','carriere','mine'].forEach(j=>S.workers.push(makeWorker(j)));
 S.pending.push(makeApprentice(),makeApprentice());S.perm=[];S.artefacts=[];S.faveur=0;S.gods={};S.duel={lastDate:'',lastGt:-999};S.match=null;
 log('La guerre sainte est finie. Le Sanctuaire n’est plus que ruines, et quatre chevaliers seulement ont survécu.');
 log('Cinq villageois sont montés aider aux champs, à la carrière et à la mine.');
 log('Deux armures de bronze ont été retrouvées intactes sous les décombres : '+bronzes[2].n+' et '+bronzes[3].n+'.');
 log('Deux enfants se présentent aux portes. Ils veulent devenir chevaliers.');
}
export function makeGuardFrom(ap){
 return{id:ap.id,seed:ap.seed,sex:ap.sex,name:ap.name,nat:ap.nat,qual:ap.qual,flaw:ap.flaw,bio:ap.bio,sign:ap.sign,rank:'garde',lv:ap.lv,xp:0,st:Object.assign({},ap.st),sp:ap.sp||0,nrg:ap.nrg,tech:ap.tech.slice(),post:null,pot:ap.pot,origin:'apprenti'};
}
