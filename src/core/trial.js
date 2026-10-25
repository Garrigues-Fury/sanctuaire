/* Épreuves d'armure (demande de Seba du 2026-10-25).
   Pour obtenir une armure, il faut avoir découvert ses compétences, avoir assez d'affinité, puis réussir l'épreuve.
   Certaines armures se gagnent en combat contre un autre disciple qui la convoite : un de vos apprentis s'il
   peut y prétendre aussi, sinon le disciple d'un autre maître. Si votre propre rival gagne, c'est lui qui
   reçoit l'armure. Les autres armures font passer une épreuve classique (chance de réussite). */
import { armorAffinity } from './armor.js';
import { duelSim } from './combat.js';
import { SKILLS } from './data/skills.js';
import { SIG_WORDS } from './data/traits.js';
import { RANKS, armorLow, de } from './data/world.js';
import { makePerson } from './people.js';
import { trialEval } from './rules.js';
import { grantSkill } from './skills.js';
import { S, log } from './state.js';
import { mulberry32 } from './util.js';

// Armures disputées en combat entre disciples : les plus guerrières.
export const DUEL_ARMORS=new Set(['pegase','dragon','licorne','loup','petit-lion','lynx','grande-ourse','hydre','petit-chien','lievre','toucan','petite-ourse','indien',
 'cerbere','centaure','orion','hercule','grand-chien','chiens-chasse','persee']);
export function trialKind(c){return DUEL_ARMORS.has(c.k)?'duel':'epreuve';}
// La résonance avec l'armure convoitée donne un avantage au combat.
const boostOf=(p,c)=>1+(armorAffinity(p,c).v-50)/250;
// Un autre de vos apprentis qui peut prétendre à la même armure, le mieux placé d'abord.
export function rivalFor(ap,c){return S.aps.filter(x=>x!==ap&&!(x.cd>S.gt)&&trialEval(x,c).ok).sort((a,b)=>armorAffinity(b,c).v-armorAffinity(a,c).v)[0]||null;}
// Le disciple d'un autre maître : du niveau de votre apprenti, parfois un peu plus fort. Le même toute la journée.
export function outsider(ap,c){
 const seed=(ap.id*7919+c.k.length*104729+Math.floor(S.gt/24)*31)>>>0,r=mulberry32(seed),p=makePerson(seed);
 const avg=['fo','vi','de','en','ps','co'].reduce((t,k)=>t+(ap.st[k]||0),0)/6,st={};
 ['fo','vi','de','en','ps','co'].forEach(k=>st[k]=Math.max(1,Math.round(avg*(.85+r()*.4))));
 return Object.assign(p,{id:-1,lv:Math.max(1,ap.lv+Math.floor(r()*3)-1),st,tech:[],origin:'forme',npc:true,nat:p.nat});
}
export function opponentFor(ap,c){return rivalFor(ap,c)||outsider(ap,c);}
// Chance de victoire estimée (quelques combats simulés).
export function duelChance(ap,c){const o=opponentFor(ap,c);let w=0;for(let i=0;i<24;i++)if(duelSim(ap,o,boostOf(ap,c),o.npc?1:boostOf(o,c),977*i+13).win)w++;return{o,ch:w/24};}

// L'apprenti devient chevalier ; l'armure lui transmet par résonance les compétences qui lui manquaient.
export function promoteApprentice(ap,c,resonance){
 (resonance||[]).forEach(id=>grantSkill(ap,id));
 S.aps.splice(S.aps.indexOf(ap),1);S.armors[c.k]='portee';
 const kn={id:ap.id,seed:ap.seed,sex:ap.sex,name:ap.name,nat:ap.nat,qual:ap.qual,flaw:ap.flaw,bio:ap.bio,sign:ap.sign,rank:c.rank,cons:c.k,lv:ap.lv,xp:0,st:Object.assign({},ap.st),role:null,
  tech:(ap.tech||[]).concat([SIG_WORDS[ap.seed%SIG_WORDS.length]+' '+(c.rank==='or'?'d’or':de(c.n))]),origin:'forme',pot:ap.pot,sp:ap.sp||0,nrg:ap.nrg,tr:ap.tr,tacc:ap.tacc,
  sk:ap.sk,skp:ap.skp,skx:ap.skx,mentors:(ap.mentors||[]).concat(ap.master!=null?[ap.master]:[])};
 S.knights.push(kn);if(c.rank==='or'&&!S.houses[c.sign])S.houses[c.sign]=1;
 log('★ '+ap.name+' obtient l’'+armorLow(c)+' et devient chevalier de '+RANKS[c.rank].toLowerCase()+' !');
 if((resonance||[]).length)log('Par résonance, l’armure transmet à '+ap.name+' : '+resonance.map(id=>SKILLS[id].n.toLowerCase()).join(', ')+'.');
 return kn;
}
// Combat pour l'armure. Renvoie {win, rival, rivalWon (votre apprenti rival a gagné l'armure), log}.
export function runDuel(ap,c,e,cd){
 const o=opponentFor(ap,c),res=duelSim(ap,o,boostOf(ap,c),o.npc?1:boostOf(o,c),(Math.random()*2**31)|0);
 let rivalWon=false;
 if(res.win){promoteApprentice(ap,c,e.resonance);if(!o.npc)o.cd=S.gt+12;}
 else{ap.cd=S.gt+cd;log(ap.name+' perd le combat pour l’'+armorLow(c)+' contre '+o.name+'.');
  if(!o.npc){const eo=trialEval(o,c);if(eo.ok){promoteApprentice(o,c,eo.resonance);rivalWon=true;}}}
 return{win:res.win,rival:o.name,rivalNpc:!!o.npc,rivalWon,log:res.log};
}
