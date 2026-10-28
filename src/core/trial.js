/* Épreuves d'armure (règles précisées par Seba le 2026-10-25).
   Pour obtenir une armure : avoir découvert ses compétences, avoir assez d'affinité, puis réussir l'épreuve.
   - Combat entre disciples : le vainqueur reçoit l'armure. L'adversaire est un de vos apprentis qui y prétend
     aussi, sinon le disciple d'un autre maître ; s'il gagne, il rejoint le Sanctuaire avec l'armure.
   - Combat d'évaluation face à un chevalier (le « sempai », comme un passage de grade au dojo) : le disciple
     perdra presque toujours ; il obtient l'armure s'il a su montrer les techniques fondamentales pendant le combat.
   - Les autres armures font passer une épreuve classique (chance de réussite). */
import { gloryNote } from './glory.js';
import { armorAffinity } from './armor.js';
import { autoResolve, duelStats, newDuelBattle } from './combat.js';
import { SKILLS } from './data/skills.js';
import { SIG_WORDS } from './data/traits.js';
import { RANKS, armorLow, de } from './data/world.js';
import { makeBio, makePerson } from './people.js';
import { trialEval } from './rules.js';
import { grantSkill } from './skills.js';
import { S, log, uid } from './state.js';
import { mulberry32 } from './util.js';
import { norm, promoteStats } from './scale.js';

// Armures disputées entre disciples, et armures où un chevalier évalue le candidat.
export const DUEL_ARMORS=new Set(['pegase','licorne','loup','petit-lion','lynx','hydre','petit-chien','lievre','toucan','petite-ourse']);
export const SEMPAI_ARMORS=new Set(['dragon','grande-ourse','indien','cerbere','centaure','orion','hercule','grand-chien','chiens-chasse','persee']);
export function trialKind(c){return DUEL_ARMORS.has(c.k)?'duel':SEMPAI_ARMORS.has(c.k)&&S.knights.length?'sempai':'epreuve';}
export const KIND_N={duel:'combat contre un autre disciple',sempai:'combat d’évaluation face à un chevalier',epreuve:'épreuve de l’armure'};
// La résonance avec l'armure convoitée donne un avantage au combat ; le sempai retient ses coups.
const boostOf=(p,c)=>1+(armorAffinity(p,c).v-50)/250;
// Le sempai retient ses coups mais encaisse beaucoup : le disciple perdra presque toujours.
const SEMPAI_HOLD=.5,SEMPAI_HP=12;
// Un combat simulé avec le même moteur que le combat joué en direct (choix automatiques d'un bon joueur prudent).
// Le sempai se met au niveau du disciple : il combat avec ses statistiques ramenées à l'échelle d'un apprenti.
export function atDiscipleLevel(k){const st={};for(const x in k.st)st[x]=Math.round(norm(k,x));return Object.assign({},k,{st,scale:1});}
function simulate(ap,c,o,seed){const k=trialKind(c);if(k==='sempai')o=atDiscipleLevel(o);const b=autoResolve(newDuelBattle(ap,o,{boostA:boostOf(ap,c),boostB:k==='sempai'?SEMPAI_HOLD:o.npc?1:boostOf(o,c),hpB:k==='sempai'?SEMPAI_HP:1,seed}));
 return{win:b.result==='win',st:duelStats(b),log:b.log.map(l=>l.m)};}
const RI={bronze:1,argent:2,or:3};

/* ---------- adversaires ---------- */
// Un autre de vos apprentis qui peut prétendre à la même armure, le mieux placé d'abord.
export function rivalFor(ap,c){return S.aps.filter(x=>x!==ap&&!(x.cd>S.gt)&&trialEval(x,c).ok).sort((a,b)=>armorAffinity(b,c).v-armorAffinity(a,c).v)[0]||null;}
// Le disciple d'un autre maître : du niveau de votre apprenti, parfois un peu plus fort. Le même toute la journée.
export function outsider(ap,c){
 const seed=(ap.id*7919+c.k.length*104729+Math.floor(S.gt/24)*31)>>>0,r=mulberry32(seed),p=makePerson(seed);
 const avg=['fo','vi','de','en','ps','co'].reduce((t,k)=>t+(ap.st[k]||0),0)/6,st={};
 ['fo','vi','de','en','ps','co'].forEach(k=>st[k]=Math.max(1,Math.round(avg*(.85+r()*.4))));
 // il a les mêmes bases que votre apprenti : fondamentales et Mach 1, à un niveau voisin
 const ids=['F1','F2','F3','F4','F5','F6','F7','F8','V1'],sk={},skx={};ids.forEach(id=>{sk[id]=1;skx[id]=((ap.skx&&ap.skx[id])||0)*(.7+r()*.6);});
 return Object.assign(p,{id:-1,lv:Math.max(1,ap.lv+Math.floor(r()*3)-1),st,sk,skx,skp:{},tech:[],origin:'forme',npc:true,pot:Math.round(45+r()*40)});
}
// Le sempai : un chevalier de ce rang ou au-dessus, de préférence pas le maître du candidat, disponible.
export function sempaiFor(ap,c){
 const ok=S.knights.filter(k=>(RI[k.rank]||0)>=RI[c.rank]&&!(k.cd>S.gt));
 const L=(ok.length?ok:S.knights).slice().sort((a,b)=>(a.id===ap.master)-(b.id===ap.master)||Math.abs(a.lv-ap.lv)-Math.abs(b.lv-ap.lv));
 return L[0]||null;
}
export function opponentFor(ap,c){const k=trialKind(c);return k==='sempai'?sempaiFor(ap,c):k==='duel'?rivalFor(ap,c)||outsider(ap,c):null;}

/* ---------- évaluation du sempai ---------- */
// Ce que le sempai regarde : chaque fondamentale doit se voir pendant le combat.
export function evaluate(st,won){
 const L=[['F4','a placé au moins deux coups',st.hits>=2],['F2','a réussi une technique',st.techs>=1],['F6','a lu une attaque et l’a esquivée',st.dodges>=1],
  ['F7','a tenu cinq échanges',st.rounds>=5||won],['F5','n’a pas lâché avant le huitième échange',st.rounds>=8||won]];
 return{items:L.map(([id,t,ok])=>({n:SKILLS[id].n,t,ok})),score:L.filter(x=>x[2]).length};
}
const passed=(res,ev)=>res.win||ev.score>=4;

/* ---------- résultats ---------- */
// Chance estimée de remporter l'armure (quelques combats simulés).
export function duelChance(ap,c){
 const kind=trialKind(c),o=opponentFor(ap,c);if(!o)return null;let w=0;
 for(let i=0;i<24;i++){const r=simulate(ap,c,o,977*i+13);if(kind==='sempai'?passed(r,evaluate(r.st,r.win)):r.win)w++;}
 return{o,ch:w/24,kind};
}
// L'apprenti devient chevalier ; l'armure lui transmet par résonance les compétences qui lui manquaient.
export function promoteApprentice(ap,c,resonance){
 (resonance||[]).forEach(id=>grantSkill(ap,id));
 // ses statistiques prennent la mesure du rang : ×3 à ×10 pour le bronze, selon son profil et ses compétences
 // (un apprenti qui gagne directement l'argent ou l'or franchit chaque marche)
 for(const rk of ['bronze','argent','or']){promoteStats(ap,c,rk);if(rk===c.rank)break;}
 const i=S.aps.indexOf(ap);if(i>=0)S.aps.splice(i,1);S.armors[c.k]='portee';
 const kn={id:ap.id,seed:ap.seed,sex:ap.sex,name:ap.name,nat:ap.nat,qual:ap.qual,flaw:ap.flaw,bio:ap.bio,sign:ap.sign,rank:c.rank,cons:c.k,lv:ap.lv,xp:0,st:Object.assign({},ap.st),role:null,
  tech:(ap.tech||[]).concat([SIG_WORDS[ap.seed%SIG_WORDS.length]+' '+(c.rank==='or'?'d’or':de(c.n))]),origin:'forme',pot:ap.pot,sp:ap.sp||0,nrg:ap.nrg,tr:ap.tr,tacc:ap.tacc,
  sk:ap.sk,skp:ap.skp,skx:ap.skx,mentors:(ap.mentors||[]).concat(ap.master!=null?[ap.master]:[])};
 kn.since=S.gt;S.knights.push(kn);gloryNote(kn,'armor',c.k);if(c.rank==='or'&&!S.houses[c.sign])S.houses[c.sign]=1;
 log('★ '+ap.name+' obtient l’'+armorLow(c)+' et devient chevalier de '+RANKS[c.rank].toLowerCase()+' !');
 if((resonance||[]).length)log('Par résonance, l’armure transmet à '+ap.name+' : '+resonance.map(id=>SKILLS[id].n.toLowerCase()).join(', ')+'.');
 return kn;
}
// Le disciple d'un autre maître qui gagne l'armure rejoint le Sanctuaire comme chevalier.
function recruitOutsider(o,c){
 const p=Object.assign(o,{id:uid(),bio:makeBio(o,mulberry32(o.seed^0x77),false),nrg:100});delete p.npc;
 ['F1','F2','F3','F4','F5','F6','F7','F8','V1'].forEach(id=>grantSkill(p,id));
 const kn=promoteApprentice(p,c,[]);log(o.name+', disciple venu d’ailleurs, rejoint le Sanctuaire avec l’'+armorLow(c)+'.');return kn;
}
/* Règlement d'un combat pour l'armure, simulé ou joué en direct.
   res : {win (votre apprenti a gagné le combat), st (ce qu'il a montré), log}.
   Renvoie {kind, win (votre apprenti remporte l'armure), rival, rivalNpc, rivalWon, log, eval, fought}. */
export function settleDuel(ap,c,e,cd,o,res){
 const kind=trialKind(c);
 const out={kind,rival:o.name,rivalNpc:!!o.npc,rivalRank:o.rank||null,rivalSex:o.sex,rivalWon:false,log:res.log,fought:res.win};
 if(kind==='sempai'){
  const ev=evaluate(res.st,res.win);out.eval=ev;out.win=passed(res,ev);
  if(out.win)promoteApprentice(ap,c,e.resonance);else{ap.cd=S.gt+cd;log(o.name+' juge que '+ap.name+' n’est pas encore prêt'+(ap.sex==='F'?'e':'')+' pour l’'+armorLow(c)+'.');}
  return out;
 }
 out.win=res.win;
 if(res.win){promoteApprentice(ap,c,e.resonance);if(!o.npc)o.cd=S.gt+12;}
 else{ap.cd=S.gt+cd;log(ap.name+' perd le combat pour l’'+armorLow(c)+' contre '+o.name+'.');
  // le vainqueur reçoit l'armure, d'où qu'il vienne
  if(o.npc)recruitOutsider(o,c);else{const eo=trialEval(o,c);promoteApprentice(o,c,eo.ok?eo.resonance:[]);}
  out.rivalWon=true;}
 return out;
}
// Combat résolu automatiquement.
export function runDuel(ap,c,e,cd){
 const kind=trialKind(c),o=opponentFor(ap,c);
 return settleDuel(ap,c,e,cd,o,simulate(ap,c,o,(Math.random()*2**31)|0));
}
// Pour un combat joué en direct : l'adversaire et les avantages de chacun.
export function duelSetup(ap,c){const kind=trialKind(c),o0=opponentFor(ap,c),o=kind==='sempai'&&o0?atDiscipleLevel(o0):o0;return{o,kind,boostA:boostOf(ap,c),boostB:kind==='sempai'?SEMPAI_HOLD:o.npc?1:boostOf(o,c),hpB:kind==='sempai'?SEMPAI_HP:1};}
