/* Expéditions dans le monde et scènes au Sanctuaire.
   - Des alertes apparaissent avec le temps (une toutes les 6 à 10 h de jeu, 4 au plus) et disparaissent après 3 jours,
     sans aucune pénalité : on rate seulement la récompense.
   - Partir coûte 30 d'énergie au chevalier. Le départ est immédiat.
   - Une scène au Sanctuaire se présente toutes les 10 à 16 h : vie quotidienne, et depuis le 2026-10-27 amours, jalousies,
     disputes, rivalités, réconciliations, soutien (data/lifescenes.js, core/romance.js). */
import { GODS } from './data/gods.js';
import { NATS } from './data/countries.js';
import { FOES, REGIONS, regionOf } from './data/worldmap.js';
import { compat } from './social.js';
import { trainHours } from './training.js';
import { SCENES } from './data/scenes.js';
import { newBattle } from './combat.js';
import { makeApprentice, makePerson, makeWorker } from './people.js';
import { RES } from './data/economy.js';
import { fkey, knightRate, levelUpAp, levelUpKnight, need, people, villageCap, xpRate, emax } from './rules.js';
import { S, emit, log } from './state.js';
import { G, clamp, mulberry32, pick } from './util.js';
import { isAway, isKO } from './wounds.js';
import { LIFE_NEEDS, acceptChance, applyLifeFx, castFor } from './romance.js';
import { CX_LINES } from './data/lifescenes.js';
import { fill } from './dialogue.js';

export const EXP_E=30,MAX_EVENTS=4,EVENT_LIFE=72;
const r=()=>Math.random();
const ATTACK_SCENES=['defi','defi','deserteurs','banquet','champion'],RECRUIT_SCENES=['charrette','voleur','rival'];
const HOME_SCENES=['doute','dispute','astres','trouvaille','complicite','tension','racines','complicite',
 'regard','regard','promenade','promenade','aveu','aveu','tendresse','jalousie','engueulade','reconciliation','rivalite','soutien','soutien','farce'];
// Paires de personnages pour les scènes nées des affinités.
function pairsFor(need){
 const P=people(),out=[];
 for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],c=compat(a,b).v;
  if(need==='pairPos'&&c>=2)out.push([a,b]);
  if(need==='pairNeg'&&c<=-2)out.push([a,b]);
  if(need==='pairRoots'&&(a.nat===b.nat||regionOf(a.nat)===regionOf(b.nat)))out.push([a,b]);}
 return out;
}

export function ensureWorld(){
 if(!S.world){S.world={events:[],nextAt:S.gt+6,homeAt:S.gt+2,home:null,active:null,seq:1,wins:0,done:0};spawn('attack');spawn('recruit');}
 return S.world;
}
function progressLevel(){return clamp(1+Math.floor(S.gt/(24*12)),1,4);}
function randomNat(){return r()<.2?'Grèce':pick(r,Object.keys(NATS));}
export function spawn(type,nat,boost){
 const W=S.world;if(W.events.length>=MAX_EVENTS)return null;
 nat=nat||randomNat();
 let scene=type==='attack'?pick(r,ATTACK_SCENES):pick(r,RECRUIT_SCENES);
 const godFoes=Object.keys(FOES).filter(k=>FOES[k].god);
 let foe=SCENES[scene].god?pick(r,godFoes):pick(r,Object.keys(FOES));
 if(scene==='deserteurs'||scene==='banquet')foe='bandits';
 const L=clamp(progressLevel()+pick(r,[-1,0,0,1,1,2]),1,5);
 const ev={id:W.seq++,type,scene,nat,region:regionOf(nat),v:NATS[nat].c,foe,L,n:1+Math.floor(r()*3),boss:SCENES[scene].god||r()<.25,until:S.gt+EVENT_LIFE,seed:(r()*2**31)|0,boost:boost||0};
 W.events.push(ev);return ev;
}
// Appelé à chaque pas de temps : nouvelles alertes, alertes expirées, scène au Sanctuaire.
export function tickWorld(sum){
 const W=ensureWorld();
 const before=W.events.length;W.events=W.events.filter(e=>e.until>S.gt||(W.active&&W.active.ev&&W.active.ev.id===e.id));
 if(W.events.length<before)S._dirty=true;
 while(S.gt>=W.nextAt){W.nextAt+=6+r()*4;const ev=spawn(r()<.6?'attack':'recruit');if(ev){S._dirty=true;const m=ev.type==='attack'?FOES[ev.foe].n+' menacent '+ev.v+' ('+ev.nat+').':'Une rumeur parle d’un enfant au cosmos étonnant à '+ev.v+' ('+ev.nat+').';log(m);sum?sum.ev.push(m):emit('alert');}}
 if(!W.home&&S.gt>=W.homeAt){W.homeAt=S.gt+10+r()*6;const ok=HOME_SCENES.filter(k=>homeCast(k));if(ok.length){W.home=pick(r,ok);S._dirty=true;}}
}
export function eventById(id){return(S.world&&S.world.events.find(e=>e.id===id))||null;}

/* ---------- distribution des rôles ---------- */
function npc(seed,nat,child){const p=makePerson(seed>>>0,nat);return{seed:p.seed,nat:p.nat,sex:p.sex,name:p.name,sign:p.sign,child:!!child};}
function homeCast(key){
 const need=SCENES[key].need;const ks=S.knights.filter(k=>k.role!=='pope');
 if(need==='ap')return S.aps.length>0&&S.knights.length>0;
 if(need==='k2')return S.knights.length>=2;
 if(need==='pope')return S.knights.some(k=>k.role==='pope');
 if(need&&need.startsWith('pair'))return pairsFor(need).length>0;
 if(LIFE_NEEDS.has(need))return castFor(need).length>0;
 return S.knights.length>0||ks.length>0;
}
function varsFor(k,extra){
 return Object.assign({k:k.name,e:G(k,'e'),il:k.sex==='F'?'elle':'il',lui:k.sex==='F'?'elle':'lui'},extra);
}
export function startExpedition(evId,kid){
 const W=ensureWorld(),ev=eventById(evId),k=S.knights.find(x=>x.id===kid);
 if(!ev||!k||W.active||k.nrg<EXP_E||isKO(k)||isAway(k))return null;
 k.nrg-=EXP_E;
 const R=mulberry32(ev.seed),F=FOES[ev.foe];
 const cast={ancien:npc(ev.seed^1,ev.nat),parent:npc(ev.seed^2,ev.nat),enfant:npc(ev.seed^3,ev.nat,true),villageois:npc(ev.seed^4,ev.nat),chef:npc(ev.seed^5,randomNat()),rival:npc(ev.seed^6,randomNat())};
 const ch=cast.enfant,dieu=F.god?GODS[F.god].n:'Arès',fem=['eris','artemis','demeter'].includes(F.god);
 const vars=varsFor(k,{v:ev.v,pays:ev.nat,chef:F.names[3],foes:F.n,dieu,ild:fem?'elle':'il',luid:fem?'elle':'lui',Ild:fem?'Elle':'Il',ed:fem?'e':'',line:F.lines[Math.floor(R()*F.lines.length)],enfant:ch.name,e2:ch.sex==='F'?'e':'',il2:ch.sex==='F'?'elle':'il',lui2:ch.sex==='F'?'elle':'lui',age:8+Math.floor(R()*7)});
 W.active={kind:'exp',ev,kid,scene:ev.scene,node:SCENES[ev.scene].start,battle:null,mods:{},fx:[],vars,cast,log:[]};
 return W.active;
}
export function startHomeScene(){
 const W=ensureWorld();if(W.active||!W.home)return null;const key=W.home;
 const pope=S.knights.find(k=>k.role==='pope');
 let k=S.knights.filter(x=>x.role!=='pope')[0]||S.knights[0];
 if(key==='astres'&&pope)k=pope;
 const others=S.knights.filter(x=>x.id!==k.id);let k2=others[Math.floor(r()*others.length)]||null;
 const need=SCENES[key].need;
 if(need&&need.startsWith('pair')){const ps=pairsFor(need);if(ps.length){[k,k2]=pick(r,ps);if(r()<.5)[k,k2]=[k2,k];}}
 let k3=null;
 if(LIFE_NEEDS.has(need)){const cs=castFor(need);if(cs.length){[k,k2,k3]=pick(r,cs);if(['attract','date','couple','rival','cold'].includes(need)&&r()<.5)[k,k2]=[k2,k];}}
 const ap=S.aps[Math.floor(r()*S.aps.length)]||null;
 const lieux=['les ruines de la carrière','l’ancienne bibliothèque','les fondations du temple','le lit du torrent'];
 const nat=randomNat();
 const vars=varsFor(k,{ap:ap?ap.name:'',k2:k2?k2.name:'',e2:k2?G(k2,'e'):'',il2:k2&&k2.sex==='F'?'elle':'il',Il2:k2&&k2.sex==='F'?'Elle':'Il',lui2:k2&&k2.sex==='F'?'elle':'lui',k3:k3?k3.name:'',e3:k3?G(k3,'e'):'',
  cxline:k2&&k2.cx?CX_LINES[k2.cx.k]:'',acc:k&&k2?acceptChance(k,k2):.5,pope:pope?pope.name:'',pays:nat,lieu:pick(r,lieux),region:REGIONS[regionOf(k.nat)].n});
 W.home=null;
 W.active={kind:'home',scene:key,node:SCENES[key].start,kid:k.id,k2:k2&&k2.id,k3:k3&&k3.id,apId:ap&&ap.id,battle:null,mods:{},fx:[],vars,cast:{villageois:npc((r()*2**31)|0,'Grèce')},nat,log:[]};
 return W.active;
}
export function activeKnight(){const a=S.world&&S.world.active;return a?people().find(k=>k.id===a.kid)||null:null;}
export function currentNode(){const a=S.world&&S.world.active;return a?SCENES[a.scene].nodes[a.node]:null;}

// Avance dans la scène : va au nœud id en appliquant ses effets ; prépare un combat si le nœud en contient un.
export function goTo(id){
 const a=S.world.active,node=SCENES[a.scene].nodes[id];a.node=id;
 (node.fx||[]).forEach(f=>a.fx.push(f));
 if(node.fx&&node.fx.some(f=>f.startsWith('nrg:'))){const k=activeKnight();if(k)k.nrg=Math.min(emax(k),k.nrg+30);}
 return node;
}
export function choose(i){const a=S.world.active,node=currentNode(),c=node.choices[i];if(!c)return;(c.fx||[]).forEach(f=>{a.fx.push(f);if(f.startsWith('pay:')){const [,res,q]=f.split(':');S.res[res]=Math.max(0,S.res[res]-(+q));}});goTo(c.go);}
export function doRoll(chance){const node=currentNode();const ok=Math.random()<chance;S.world.active.log.push(ok?'réussite':'échec');goTo(ok?node.roll.ok:node.roll.ko);return ok;}
export function beginFight(){const a=S.world.active,node=currentNode(),k=activeKnight();a.mods=Object.assign({},node.fight.mods);a.battle=newBattle(k,a.ev,a.mods,a.ev.seed^(a.log.length*977+S.world.done*131));return a.battle;}
export function endFight(){const a=S.world.active,node=currentNode(),res=a.battle.result;a.battle=null;goTo(res==='win'?node.fight.win:node.fight.lose);}

/* ---------- récompenses ---------- */
// Termine la scène en cours et applique ce qu'elle rapporte. Renvoie la liste des gains, en clair.
export function finishScene(){
 const W=S.world,a=W.active;if(!a)return[];const node=currentNode(),end=node.end,k=activeKnight(),out=[];
 const fx=a.fx;const has=f=>fx.includes(f);
 if(a.kind==='exp'){
  const ev=a.ev,L=ev.L;
  const mult=end==='win'?(has('bonus')?1.5:1):end==='peace'?.7:end==='recruit'?.3:0;
  if(mult>0){const g={vivres:Math.round((50+40*L)*mult),marbre:Math.round((25+25*L)*mult),metal:Math.round((10+18*L)*mult),savoir:Math.round(8*L*mult)};
   for(const res in g)if(g[res]>0){S.res[res]+=g[res];out.push('+'+g[res]+' '+RES[res].n.toLowerCase());}}
  // L'expérience se compte en heures d'entraînement : une victoire vaut 6 h par étoile.
  const hours=({win:6,peace:4,recruit:4,lose:2,leave:1})[end]*L;
  if(k&&hours){k.xp+=knightRate(k)*hours;let g=0;while(k.xp>=need(k.lv)*1.5&&g++<20)levelUpKnight(k);out.push(k.name+' : l’équivalent de '+hours+' h d’entraînement');}
  if(has('recruit')||has('recruit+')){const ap=makeApprentice(ev.nat,has('recruit+')?.35:0);S.pending.push(ap);out.push(ap.name+' ('+ap.age+' ans, '+ap.nat+') attend aux portes du Sanctuaire');log(ap.name+' accompagne '+k.name+' jusqu’au Sanctuaire.');}
  if(end!=='lose'){W.events=W.events.filter(e=>e.id!==ev.id);}
  if(end==='win'||end==='peace')W.wins++;
  log(k.name+' revient de '+ev.v+' : '+({win:'victoire',peace:'paix conclue',recruit:'une recrue',lose:'défaite',leave:'retour bredouille'})[end]+'.');
 }else{
  const ap=S.aps.find(x=>x.id===a.apId),k2=people().find(x=>x.id===a.k2);
  fx.forEach(f=>{
   if(f==='ap_xp'&&ap){ap.xp+=xpRate(ap)*6;let g=0;while(ap.xp>=need(ap.lv)&&g++<50)levelUpAp(ap,null);out.push(ap.name+' : +6 h de formation');}
   if(f==='ap_fo'&&ap){ap.st.fo++;ap.nrg=Math.max(0,ap.nrg-20);out.push(ap.name+' : +1 force, −20 énergie');}
   if(f==='ap_co'&&ap){ap.st.co+=2;out.push(ap.name+' : +2 cosmos');}
   if(f==='kk_xp'&&k&&k2){[k,k2].forEach(q=>trainHours(q,6));out.push(k.name+' et '+k2.name+' : l’équivalent de 6 h d’entraînement');}
   if(f.startsWith('kk_friend:')&&k&&k2){const n=+f.split(':')[1],key=fkey(k.id,k2.id);S.friend[key]=Math.min(10,(S.friend[key]||0)+n);out.push('Amitié '+k.name+' – '+k2.name+' : '+S.friend[key]+'/10');}
   if(/^(love|couple|breakup|rival|rival3|friend|friend3|friend23|bon|conf)(:|$)/.test(f))applyLifeFx(f,{k,k2,k3:people().find(x=>x.id===a.k3)},out);
   if(f==='spawn_recruit'){const ev=spawn('recruit',a.nat,.35);out.push(ev?'Une étoile brille sur la mappemonde : '+ev.v:'La mappemonde est déjà pleine d’alertes');}
  });
  const sl=SCENES[a.scene].log;
  if(sl)log(fill(sl,a.vars));else log('Au Sanctuaire : '+({doute:'un apprenti a douté, puis s’est relevé.',dispute:'deux chevaliers se sont défiés.',astres:'le Pope a lu les astres.',trouvaille:'les villageois ont fait une trouvaille.',complicite:'une soirée de rires entre '+a.vars.k+' et '+a.vars.k2+'.',tension:'le ton est monté entre '+a.vars.k+' et '+a.vars.k2+'.',racines:a.vars.k+' et '+a.vars.k2+' ont parlé de leur pays.'})[a.scene]);
 }
 fx.forEach(f=>{
  const [t,x,y]=f.split(':');
  if(t==='faveur'){S.faveur=(S.faveur||0)+(+x);out.push('+'+x+' ✦ faveur d’Athéna');}
  if(t==='res'){S.res[x]+=(+y);out.push('+'+y+' '+RES[x].n.toLowerCase());}
  if(t==='vivres'){S.res.vivres=Math.max(0,S.res.vivres+(+x));out.push(x+' vivres');}
  if(t==='worker'&&S.workers.length<villageCap(S.b.artisans)){const w=makeWorker(null);S.workers.push(w);out.push(w.name+' rejoint les villageois');}
  if(t==='weaken'&&a.ev){const g=S.gods[FOES[a.ev.foe].god];if(g){const e=Object.keys(g.bonus).sort((p,q)=>g.bonus[q]-g.bonus[p])[0];if(g.bonus[e]>0){g.bonus[e]--;out.push(GODS[FOES[a.ev.foe].god].n+' perd un acquis ('+e+')');}}}
 });
 W.done++;W.active=null;S._dirty=true;
 return out;
}
export function abandonScene(){const W=S.world;if(!W||!W.active)return;W.active=null;S._dirty=true;}
