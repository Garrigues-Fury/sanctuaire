/* Combat au tour par tour d'un chevalier contre un groupe d'ennemis.
   L'état du combat est un simple objet (il se sauvegarde avec la partie).
   Le hasard est reproductible : il dépend d'un nombre (b.rs) stocké dans le combat. */
import { BEATS, FOES, elemMult } from './data/worldmap.js';
import { TECH, fl, ql } from './data/traits.js';
import { SIGNS } from './data/world.js';
import { clamp } from './util.js';
import { skillPower } from './skills.js';

// Cartes de compétences en combat. Sans cartes (chevalier de référence, adversaire inventé) : valeurs types du rang et du niveau.
const TIER={bronze:1,argent:2,or:3};
function cardsOf(k){if(k.sk)return skillPower(k);const fund=Math.min(10,1+k.lv/6);return{fund,speed:TIER[k.rank]||0,spec:2*fund};}

function rnd(b){b.rs=(b.rs+0x6D2B79F5)|0;let t=b.rs;t=Math.imul(t^t>>>15,1|t);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
const RK={bronze:1,argent:1.25,or:1.6,garde:.9};
const ARMOR_DEF={bronze:3,argent:6,or:10,garde:2};
export const COST={tech:4,sig:7};

// Caractéristiques de combat d'un chevalier (ou d'un personnage fictif de référence).
export function heroStats(k){
 const rk=RK[k.rank]||1,lv=k.lv,s=k.st;
 const el=SIGNS[k.sign].el;
 const kt=k.tech||[],sigI=k.origin==='survivant'?0:kt.length-1;
 const sig=kt[sigI]||'Météores '+(['de feu','d’écume','de vent','de pierre'][['feu','eau','air','terre'].indexOf(el)]);
 const techs=kt.filter((t,i)=>i!==sigI);
 const tr=traitMods(k);
 // fondamentales : tout le corps ; spécifiques : les techniques ; vitesse : un palier par rang (Mach 1, Mach 5, lumière)
 const cs=cardsOf(k),fm=1+.03*cs.fund,sm=1+Math.min(.4,.01*cs.spec),vb=[0,8,20,45][cs.speed];
 return{id:k.id,name:k.name,el,max:Math.round((40+s.en*2.5+lv*4)*rk*tr.hp*fm),atk:(8+s.fo*1.1+lv)*rk*fm,tec:(8+s.co*1.3+lv)*rk*fm*sm,
  def:((2+s.en*.4+lv*.4)*rk+(ARMOR_DEF[k.rank]||0))*tr.def*fm,spd:s.vi+lv*.5+vb,tech:techs[0]||TECH[el][0],sig,tr,
  // dextérité : précision (l'ennemi esquive moins) et coups critiques ; psychokinésie : barrière et cosmos de départ
  acc:(s.de||0)*.3,crit:clamp(.03+(s.de||0)/400,0,.3),shield:clamp((s.ps||0)/400,0,.2),cosPs:Math.min(2,Math.floor((s.ps||0)/30))};
}
// Effets des qualités et défauts en combat (voir data/traits.js, champ « c »).
export function traitMods(k){
 const q=key=>ql(k,key),f=key=>fl(k,key);
 return{hp:1-.06*f('fragile'),def:1+.05*q('loyal')-.04*q('fougueux')-.05*f('impulsif')-.05*f('colerique'),
  dmg:1+.08*q('fougueux')+.06*q('orgueilleux'),tech:1+.06*q('studieux'),sig:1+.1*q('reveur'),boss:1+.06*q('solitaire')-.08*f('peureux'),
  low:1+.1*q('courageux')+.05*f('colerique'),dodge:.05*q('vif')-.04*f('arrogant')-.03*f('gourmand'),cos0:q('patient')-f('paresseux'),
  heal:.03*q('travailleur'),guardCos:-q('orgueilleux'),guardRed:.05*f('tetu'),fumble:.05*f('distrait'),survive:.3*q('perseverant'),taunt:.08*q('drole')};
}
const T=(h,key,d)=>h.tr&&h.tr[key]!=null?h.tr[key]:d;
function dmgMult(b,f,kind){const h=b.hero;return T(h,'dmg',1)*(kind==='tech'?T(h,'tech',1):kind==='sig'?T(h,'sig',1):1)*(f.boss?T(h,'boss',1):1)*(h.hp<h.max/2?T(h,'low',1):1);}
// Chevalier de référence pour un niveau d'alerte L (1 à 5) : L1 = un bronze débutant, L5 = un chevalier d'or.
// Chaque niveau d'alerte est calé sur un chevalier type : ★ bronze débutant … ★★★★★ chevalier d'or.
const REF=[null,['bronze',8,15],['bronze',14,22],['argent',21,32],['argent',30,44],['or',38,55]];
export function refHero(L){const [rank,lv,v]=REF[Math.max(1,Math.min(5,L))];return heroStats({id:0,name:'réf',rank,lv,st:{fo:v,vi:v,en:v,co:v,de:v,ps:v},sign:0,tech:[],origin:'forme'});}

/* ev : {foe, L, n (nombre d'ennemis), boss} ; mods : {hard, easy, duel, first} */
export function newBattle(k,ev,mods={},seed=1){
 const b={rs:seed|0,turn:1,log:[],over:false,result:null};
 const h=heroStats(k);b.hero=Object.assign(h,{hp:h.max,cos:clamp((mods.first?6:2)+h.tr.cos0+(h.cosPs||0),0,10),guard:false});
 const F=FOES[ev.foe],ref=refHero(ev.L);
 let n=mods.duel?1:ev.n,mult=(mods.hard?1.25:1)*(mods.easy?.8:1);
 const boss=mods.duel||ev.boss;
 b.foes=[];
 for(let i=0;i<n;i++){
  const isBoss=boss&&i===0,share=isBoss?(n>1?.45:1):(boss?.55/(n-1):1/n);
  const hp=Math.round(ref.max*2.5*(boss?1.2:1)*share*mult*(mods.duel?1.3:1)*(.85+rnd(b)*.3));
  b.foes.push({i,n:isBoss?F.names[3]:F.names[Math.min(2,i)]+(n>1&&!isBoss?' '+'ABC'[i]:''),el:F.el[Math.floor(rnd(b)*F.el.length)],
   hp,max:hp,atk:((ref.max/4.5)*share+ref.def*.6)*mult,def:ref.def*.6,spd:ref.spd*(.8+rnd(b)*.4),boss:isBoss,charge:0});
 }
 b.log.push({t:'info',m:b.foes.length>1?b.foes.length+' adversaires barrent la route.':b.foes[0].n+' s’avance.'});
 return b;
}
const alive=b=>b.foes.filter(f=>f.hp>0);
function dodge(b,attSpd,defSpd){return rnd(b)<clamp(.05+(defSpd-attSpd)/120,.02,.35);}
function hit(b,f,raw,label,kind){
 if(dodge(b,b.hero.spd+(b.hero.acc||0),f.spd)){b.log.push({t:'hero',m:f.n+' esquive '+label+'.',miss:true,target:f.i});return;}
 const crit=rnd(b)<(b.hero.crit||0);
 const d=Math.max(1,Math.round(raw*dmgMult(b,f,kind)*(crit?1.5:1)*(.75+rnd(b)*.5)));f.hp=Math.max(0,f.hp-d);
 b.log.push({t:'hero',m:(crit?'Coup précis ! ':'')+label.charAt(0).toUpperCase()+label.slice(1)+' : '+d+' dégâts à '+f.n+(f.hp<=0?' — à terre !':'.'),dmg:d,target:f.i,crit});
}
export function canUse(b,a){return a==='strike'||a==='guard'||(a==='tech'&&b.hero.cos>=COST.tech)||(a==='sig'&&b.hero.cos>=COST.sig);}

// Le joueur agit, puis les ennemis répondent.
export function heroAction(b,a,target){
 if(b.over||!canUse(b,a))return b;const h=b.hero;h.guard=false;
 const tgt=alive(b).find(f=>f.i===target)||alive(b).sort((x,y)=>x.hp-y.hp)[0];
 if(a!=='guard'&&rnd(b)<T(h,'fumble',0))b.log.push({t:'hero',m:h.name+' a l’esprit ailleurs une seconde de trop, et rate son action.',miss:true,target:tgt.i});
 else if(a==='strike')hit(b,tgt,h.atk-tgt.def*.5,'le coup');
 else if(a==='tech'){h.cos-=COST.tech;hit(b,tgt,h.tec*1.7*elemMult(h.el,tgt.el)-tgt.def*.3,'« '+h.tech+' »','tech');}
 else if(a==='sig'){h.cos-=COST.sig;b.log.push({t:'hero',m:h.name+' fait brûler son cosmos : « '+h.sig+' » !',big:true});alive(b).forEach(f=>hit(b,f,h.tec*1.6*elemMult(h.el,f.el)-f.def*.3,'l’onde de cosmos','sig'));}
 else if(a==='guard'){h.guard=true;h.cos=Math.min(10,h.cos+Math.max(1,3+T(h,'guardCos',0)));const heal=Math.round(h.max*(.06+T(h,'heal',0)));h.hp=Math.min(h.max,h.hp+heal);b.log.push({t:'hero',m:h.name+' se met en garde et rassemble son cosmos (+'+heal+' PV).'});}
 if(!alive(b).length){b.over=true;b.result='win';b.log.push({t:'info',m:'Victoire !',big:true});return b;}
 foesTurn(b);
 if(!b.over){b.turn++;h.cos=Math.min(10,h.cos+1);if(b.turn>25){b.over=true;b.result='retreat';b.log.push({t:'info',m:'Épuisés, les deux camps se séparent.'});}}
 return b;
}
function foesTurn(b){
 const h=b.hero,gr=.45+T(h,'guardRed',0);
 alive(b).forEach(f=>{
  if(h.hp<=0)return;
  if(!f.charge&&rnd(b)<T(h,'taunt',0)){b.log.push({t:'foe',m:f.n+', piqué au vif par une remarque de '+h.name+', perd sa concentration et rate son attaque.',miss:true,src:f.i});return;}
  const sh=1-(h.shield||0);
  if(f.boss&&f.charge===1){f.charge=0;const raw=(f.atk*2.2-h.def*.5)*(h.guard?gr:1)*sh;const d=Math.max(1,Math.round(raw*(.75+rnd(b)*.5)));h.hp=Math.max(0,h.hp-d);b.log.push({t:'foe',m:f.n+' libère son attaque terrible : '+d+' dégâts !'+(h.guard?' La garde a tenu.':''),dmg:d,big:true,src:f.i});return;}
  if(f.boss&&b.turn%3===2){f.charge=1;b.log.push({t:'foe',m:f.n+' prépare un coup terrible… (se mettre en garde !)',warn:true,src:f.i});return;}
  if(dodge(b,f.spd,h.spd)||rnd(b)<T(h,'dodge',0)){b.log.push({t:'foe',m:h.name+' esquive '+f.n+'.',miss:true,src:f.i});return;}
  const raw=(f.atk*elemMult(f.el,h.el)-h.def*.5)*(h.guard?gr:1)*sh;const d=Math.max(1,Math.round(raw*(.75+rnd(b)*.5)));
  h.hp=Math.max(0,h.hp-d);h.cos=Math.min(10,h.cos+1);b.log.push({t:'foe',m:f.n+' frappe : '+d+' dégâts.',dmg:d,src:f.i});
 });
 if(h.hp<=0&&!h.survived&&rnd(b)<T(h,'survive',0)){h.survived=true;h.hp=1;b.log.push({t:'info',m:h.name+' devrait être à terre… et pourtant, se relève.',big:true});}
 if(h.hp<=0){b.over=true;b.result='lose';b.log.push({t:'info',m:h.name+' tombe à genoux.',big:true});}
}
// Ce que ferait un bon joueur prudent (sert au combat automatique et aux estimations).
export function autoPick(b){
 const h=b.hero,foes=alive(b);
 if(foes.some(f=>f.boss&&f.charge===1))return{a:'guard'};
 if(h.hp<h.max*.3&&h.cos<COST.tech)return{a:'guard'};
 const weakest=foes.slice().sort((x,y)=>x.hp-y.hp)[0];
 if(h.cos>=COST.sig&&foes.length>=2)return{a:'sig'};
 if(h.cos>=COST.tech){const best=foes.slice().sort((x,y)=>elemMult(h.el,y.el)-elemMult(h.el,x.el)||x.hp-y.hp)[0];return{a:'tech',target:best.i};}
 return{a:'strike',target:weakest.i};
}
export function autoResolve(b){let g=0;while(!b.over&&g++<40){const p=autoPick(b);heroAction(b,p.a,p.target);}return b;}
// Chance de victoire estimée par simulation.
export function winChance(k,ev,mods={},n=60){let w=0;for(let i=0;i<n;i++){const b=autoResolve(newBattle(k,ev,mods,7919*i+13));if(b.result==='win')w++;}return w/n;}
export { BEATS };
// Duel entre deux disciples pour une armure (comme deux apprentis qui se disputent la même armure).
// boost : la résonance avec l'armure convoitée. Renvoie {win : A l'emporte, log : le récit}.
export function duelSim(A,B,boostA=1,boostB=1,seed=1){
 const b={rs:seed|0},log=[];
 const F=[A,B].map((p,i)=>{const h=heroStats(p);return{h,hp:h.max,cos:2+(h.cosPs||0),boost:i?boostB:boostA,n:p.name};});
 for(let t=1;t<=30&&F[0].hp>0&&F[1].hp>0;t++){
  const order=F[0].h.spd+rnd(b)*10>=F[1].h.spd+rnd(b)*10?[0,1]:[1,0];
  for(const i of order){const me=F[i],op=F[1-i];if(me.hp<=0||op.hp<=0)continue;
   const tech=me.cos>=COST.tech,what=tech?'« '+me.h.tech+' »':'un coup';
   if(tech)me.cos-=COST.tech;else me.cos=Math.min(10,me.cos+2);
   if(rnd(b)<clamp(.05+(op.h.spd-me.h.spd-(me.h.acc||0))/120,.02,.35)){if(log.length<12)log.push(op.n+' esquive '+what+' de '+me.n+'.');continue;}
   const crit=rnd(b)<(me.h.crit||0),raw=(tech?me.h.tec*1.5-op.h.def*.3:me.h.atk-op.h.def*.5)*me.boost;
   const d=Math.max(1,Math.round(raw*(crit?1.5:1)*(1-(op.h.shield||0))*(.75+rnd(b)*.5)));op.hp=Math.max(0,op.hp-d);
   if(log.length<12||op.hp<=0)log.push((crit?'Coup précis ! ':'')+me.n+(tech?' lance '+what:' frappe')+' : '+d+' dégâts'+(op.hp<=0?'. '+op.n+' ne se relève pas.':'.'));
  }
 }
 const win=F[0].hp>0&&(F[1].hp<=0||F[0].hp/F[0].h.max>=F[1].hp/F[1].h.max);
 if(F[0].hp>0&&F[1].hp>0)log.push('Après trente échanges, les juges désignent '+(win?A.name:B.name)+'.');
 return{win,log};
}
