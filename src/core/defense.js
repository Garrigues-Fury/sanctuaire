/* Attaques contre le Sanctuaire (demandées par Seba le 2026-10-27).
   De temps en temps, les chevaliers d'un dieu attaquent : soit une zone (village, champs, carrière, mine,
   jardin, ateliers ; jamais la bibliothèque, trop proche du palais du Pope), soit l'escalier des douze maisons,
   qu'ils tentent de franchir dans l'ordre. Les chevaliers d'or gardent leur maison ; les bronzes et les argents
   défendent les zones où le joueur les a placés, et les autres interviennent en renfort.
   On se bat loyalement, un contre un : le vainqueur affronte le suivant en gardant sa fatigue et ses blessures,
   dans les deux camps. Le vaincu est mis hors de combat et soigné à l'infirmerie. Vaincre un ennemi rapporte
   bien plus qu'un entraînement. Un tableau d'honneur garde les victoires et les défaites. */
import { GOD_SAINTS, RAID_ZONES } from './data/missions.js';
import { GODS, GOD_KEYS } from './data/gods.js';
import { RES } from './data/economy.js';
import { SIGNS, de } from './data/world.js';
import { COST, heroStats, dodgeP } from './combat.js';
import { godState } from './duel.js';
import { makePerson, rollStats } from './people.js';
import { bornStats } from './scale.js';
import { trainHours } from './training.js';
import { isAway, isKO, wound } from './wounds.js';
import { S, emit, log } from './state.js';
import { clamp, mulberry32, pick } from './util.js';

export const ZONE_N={village:'le village de Rodorio',champs:'les oliveraies',carriere:'la carrière',mine:'la mine',jardin:'le jardin des simples',forge:'l’atelier des armures',herbo:'l’herboristerie',atelier:'les ateliers d’artisanat'};
export const ZONES=Object.keys(RAID_ZONES);
export function ensureDefense(){
 if(!S.def)S.def={zones:{},raidAt:S.gt+72+Math.random()*48,reports:[],w:0,l:0,gods:{}};
 return S.def;
}
// Où un chevalier est affecté (zone, maison « h3 », ou null = en renfort).
export function postOf(k){const D=ensureDefense();for(const z in D.zones)if((D.zones[z]||[]).includes(k.id))return z;return null;}
export function assign(k,z){const D=ensureDefense();for(const x in D.zones)D.zones[x]=(D.zones[x]||[]).filter(id=>id!==k.id);if(z){(D.zones[z]=D.zones[z]||[]).push(k.id);}}
const ready=p=>p&&!isKO(p)&&!isAway(p)&&!(S.world&&S.world.active&&S.world.active.kid===p.id);
// Défenseurs d'une zone, dans l'ordre : gardes postés, chevaliers affectés.
export function defendersOf(z){
 const D=ensureDefense(),ids=D.zones[z]||[];
 return(S.guards||[]).filter(g=>g.post===z).concat(ids.map(id=>S.knights.find(k=>k.id===id)).filter(Boolean)).filter(ready);
}
// Défenseurs d'une maison : son chevalier d'or (s'il n'est pas affecté ailleurs), puis gardes et chevaliers affectés.
export function houseDefenders(i){
 const gold=S.knights.find(k=>k.rank==='or'&&SIGNS[k.sign]&&k.sign===i&&(!postOf(k)||postOf(k)==='h'+i));
 return(gold?[gold]:[]).concat(defendersOf('h'+i).filter(p=>p!==gold)).filter(ready);
}
// Renfort : les bronzes et les argents sans affectation.
export function reserve(){return S.knights.filter(k=>k.rank!=='or'&&k.role!=='pope'&&!postOf(k)).filter(ready).sort((a,b)=>b.lv-a.lv);}

/* ---------- les assaillants ---------- */
function enemyTier(g){const day=S.gt/24;return clamp(day/30+g.lv*.3+Math.random()*1.2-.4,0,2.2);}
function makeEnemy(god,i,seed){
 const g=godState(god),t=enemyTier(g),r=mulberry32(seed>>>0),p=makePerson(seed>>>0);
 const rank=t<1?null:t<2?'bronze':'argent',lv=Math.round(5+S.gt/24/3+r()*4+g.lv);
 const base=rollStats(r,Math.round(8+lv*.3),10);
 const st=rank?bornStats(base,rank,null,r):base;
 const title=GOD_SAINTS[god][p.sex==='F'?1:0];
 return{id:-(i+1),seed:p.seed,sex:p.sex,nat:p.nat,name:title+' '+p.name,sign:p.sign,rank:rank||'garde',scale:rank?undefined:1,lv,st,tech:[],origin:'forme',qual:p.qual,flaw:p.flaw,npc:true,god};
}
// Un combat loyal, un contre un ; chacun garde ses PV d'un combat à l'autre.
function duel1v1(A,B,log1){
 const F=[A,B];let t=0;
 while(A.hp>0&&B.hp>0&&t++<30){
  const order=A.h.spd*(1+Math.random()*.2)>=B.h.spd*(1+Math.random()*.2)?[A,B]:[B,A];
  for(const me of order){const op=me===A?B:A;if(me.hp<=0||op.hp<=0)continue;
   const tech=me.cos>=COST.tech;if(tech)me.cos-=COST.tech;else me.cos=Math.min(10,me.cos+2);
   if(Math.random()<dodgeP(me.h.spd+(me.h.acc||0),op.h.spd))continue;
   const crit=Math.random()<(me.h.crit||0),raw=tech?me.h.tec*1.5-op.h.def*.3:me.h.atk-op.h.def*.5;
   op.hp=Math.max(0,op.hp-Math.max(1,Math.round(raw*(crit?1.5:1)*(1-(op.h.shield||0))*(.75+Math.random()*.5))));}
 }
 // au bout de trente échanges, celui qui tient le mieux l'emporte ; l'autre renonce
 if(A.hp>0&&B.hp>0){if(A.hp/A.h.max>=B.hp/B.h.max)B.hp=0;else A.hp=0;}
 const win=A.hp>0?A:B,lose=win===A?B:A;
 log1.push(win.p.name+' bat '+lose.p.name+(win.hp<win.h.max*.3?', à bout de forces':'')+'.');
 return win;
}
const fighter=p=>{const h=heroStats(p);return{p,h,hp:h.max,cos:2+(h.cosPs||0)};};
// La chaîne de duels : renvoie les assaillants encore debout.
function chain(att,defs,rep){
 const D=defs.map(fighter);
 while(att.length&&D.length){
  const a=att[0],d=D[0],w=duel1v1(a,d,rep.log);
  if(w===d){att.shift();rep.kills.push({by:d.p.id,foe:a.p.name,rank:a.p.rank});rec(d.p,'w');}
  else{D.shift();rec(d.p,'l');rep.ko.push(d.p.id);}
 }
 return att;
}
function rec(p,k){if(p.npc)return;p.rec=p.rec||{w:0,l:0};p.rec[k]=(p.rec[k]||0)+1;}

/* ---------- une attaque ---------- */
export function raid(force){
 const D=ensureDefense(),day=S.gt/24;
 const god=pick(Math.random,GOD_KEYS),G=GODS[god],houses=Math.random()<.4;
 const zone=houses?null:pick(Math.random,ZONES.filter(z=>z==='village'||S.b[z]>0));
 const n=houses?3+Math.floor(Math.random()*4):2+Math.floor(Math.random()*3);
 const foes=[];for(let i=0;i<n;i++)foes.push(makeEnemy(god,i,(Math.random()*2**31)|0));
 const att=foes.map(fighter);
 const rep={t:S.gt,god,zone,houses,foes:foes.map(f=>({n:f.name,rank:f.rank==='garde'?'soldat':f.rank,lv:f.lv})),log:[],kills:[],ko:[],steps:[]};
 let left=att;
 if(houses){
  for(let i=0;i<12&&left.length;i++){const d=houseDefenders(i);if(!d.length){rep.steps.push('Maison '+de(SIGNS[i].n)+' : personne, ils passent.');continue;}
   rep.log.push('— Maison '+de(SIGNS[i].n)+' —');left=chain(left,d,rep);rep.steps.push('Maison '+de(SIGNS[i].n)+' : '+(left.length?'franchie':'ils sont arrêtés'));}
  if(left.length){const res=reserve();if(res.length){rep.log.push('— Les renforts —');left=chain(left,res,rep);}}
  if(left.length){const pope=S.knights.find(k=>k.role==='pope'&&ready(k));if(pope){rep.log.push('— Devant le palais du Pope —');left=chain(left,[pope],rep);}}
 }else{
  rep.log.push('— '+ZONE_N[zone].replace(/^./,c=>c.toUpperCase())+' —');
  left=chain(left,defendersOf(zone),rep);
  if(left.length){const res=reserve();if(res.length){rep.log.push('— Les renforts —');left=chain(left,res,rep);}}
 }
 // conséquences
 const won=!left.length;rep.win=won;
 rep.ko.forEach(id=>{const p=S.knights.concat(S.guards||[]).find(x=>x.id===id);if(p)wound(p,1);});
 // chaque ennemi vaincu vaut bien plus qu'un entraînement : 12 h, 18 h s'il était d'un rang plus haut
 rep.kills.forEach(k=>{const p=S.knights.concat(S.guards||[]).find(x=>x.id===k.by);if(p)trainHours(p,k.rank==='argent'||(k.rank==='bronze'&&!S.knights.includes(p))?18:12);});
 const loot=[];
 if(!won){
  const keys=houses?['vivres','marbre','metal','savoir']:RAID_ZONES[zone];
  keys.forEach(r=>{const have=r==='herbes'?(S.items.herbes||0):S.res[r];const q=Math.floor(have*(houses?.1:.18));if(q>0){if(r==='herbes')S.items.herbes-=q;else S.res[r]-=q;loot.push(q+' '+(RES[r]?RES[r].n.toLowerCase():r));}});
  if(houses){const g=godState(god);g.lv++;}
 }
 rep.loot=loot;
 D.gods[god]=D.gods[god]||{w:0,l:0};if(won){D.w++;D.gods[god].w++;}else{D.l++;D.gods[god].l++;}
 D.reports.unshift(rep);D.reports.length=Math.min(D.reports.length,10);
 const where=houses?'l’escalier des douze maisons':ZONE_N[zone];
 const msg=(won?'★ ':'')+'Les guerriers '+(/^[AEÉÈIOUH]/.test(G.n)?'d’':'de ')+G.n+' ('+n+') attaquent '+where+' : '+(won?'repoussés':'ils l’emportent'+(loot.length?' et pillent '+loot.join(', '):''))+'. '+rep.kills.length+' ennemi'+(rep.kills.length>1?'s':'')+' vaincu'+(rep.kills.length>1?'s':'')+', '+rep.ko.length+' blessé'+(rep.ko.length>1?'s':'')+' chez nous.';
 return{rep,msg};
}
export function tickRaids(sum){
 const D=ensureDefense();
 if(S.gt<D.raidAt)return;
 D.raidAt=S.gt+48+Math.random()*72;
 if(!S.knights.length)return;
 const {msg}=raid();log(msg);sum?sum.ev.push(msg):emit('alert');S._dirty=true;
}
