/* Missions dans le monde (demandées par Seba le 2026-10-27) : catastrophes naturelles, secours, combats,
   enquêtes, diplomatie. Chaque mission demande des compétences et des statistiques : on y envoie une équipe
   de 1 à 3 chevaliers qui conviennent. La mission dure quelques heures et se résout seule ; elle fait progresser
   les chevaliers, rapproche les équipiers et rapporte des ressources. Une mission ignorée disparaît au bout
   de 3 jours, sans pénalité. Un échec peut blesser, jamais tuer. */
import { NATS, NAT_KEYS } from './data/countries.js';
import { MISSIONS, MISSION_BY } from './data/missions.js';
import { RES } from './data/economy.js';
import { SKILLS } from './data/skills.js';
import { ql } from './data/traits.js';
import { SIGNS } from './data/world.js';
import { heroStats, refHero } from './combat.js';
import { byId, fkey } from './rules.js';
import { addProgress, hasSkill } from './skills.js';
import { trainHours } from './training.js';
import { isAway, isKO, wound } from './wounds.js';
import { S, emit, log } from './state.js';
import { clamp, pick } from './util.js';

export const MIS_E=30,MIS_MAX=4,MIS_LIFE=72;
const r=()=>Math.random();
export function ensureMissions(){if(!S.mis)S.mis={list:[],active:[],nextAt:S.gt+3,seq:1,done:0,wins:0};return S.mis;}
function dangerFor(m){const day=S.gt/24,[a,b]=m.L;return clamp(Math.round(a+(b-a)*clamp(day/60,0,1)+(r()<.3?1:0)-(r()<.3?1:0)),a,b);}
export function spawnMission(k){
 const M=ensureMissions();if(M.list.length>=MIS_MAX)return null;
 const m=k?MISSION_BY[k]:pick(r,MISSIONS),nat=r()<.2?'Grèce':pick(r,NAT_KEYS);
 const ev={id:M.seq++,k:m.k,nat,v:NATS[nat].c,L:dangerFor(m),h:Math.round(m.h[0]+r()*(m.h[1]-m.h[0])),until:S.gt+MIS_LIFE};
 M.list.push(ev);return ev;
}
// « de Athènes » devient « d’Athènes ».
export function missionText(ev){const m=MISSION_BY[ev.k],dv=/^[AEIOUYÂÉÈÊÎÏÔÛÜ]/i.test(ev.v)?'d’'+ev.v:'de '+ev.v;return m.d.replace(/de \{v\}/g,dv).replace(/\{v\}/g,ev.v).replace(/\{pays\}/g,ev.nat);}

/* ---------- équipe et chances ---------- */
// Pourquoi un chevalier ne peut pas partir (ou null).
export function notReady(k){
 if(isKO(k))return'à l’infirmerie';
 if(isAway(k))return'déjà en mission';
 if(S.world&&S.world.active&&S.world.active.kid===k.id)return'en expédition';
 if(k.nrg<MIS_E)return'trop fatigué'+(k.sex==='F'?'e':'');
 return null;
}
// Valeur de combat et de terrain : points de vie × force, comme dans le moteur de combat.
const cv=h=>Math.sqrt(h.max*(h.atk+h.tec)/2);
export function missionChance(ev,team){
 const m=MISSION_BY[ev.k];if(!team.length)return{ch:0,ratio:0,have:[],miss:m.skills};
 const ratio=team.reduce((t,k)=>t+cv(heroStats(k)),0)/cv(refHero(ev.L));
 const have=m.skills.filter(id=>team.some(k=>hasSkill(k,id))),need=Math.min(3,m.skills.length),match=Math.min(1,have.length/need);
 const qual=(m.q||[]).some(q=>team.some(k=>ql(k,q)))?.05:0,el=m.el&&team.some(k=>SIGNS[k.sign].el===m.el)?.05:0;
 const ch=clamp(.5+.25*Math.log2(Math.max(.05,ratio))+.3*(match-.5)+qual+el,.05,.95);
 return{ch,ratio,have,miss:m.skills.filter(id=>!have.includes(id)),qual:qual>0,el:el>0};
}
export function launchMission(evId,ids){
 const M=ensureMissions(),ev=M.list.find(e=>e.id===evId),m=ev&&MISSION_BY[ev.k];if(!ev)return null;
 const team=ids.map(byId).filter(k=>k&&S.knights.includes(k)&&!notReady(k));
 if(team.length<m.team[0]||team.length>m.team[1])return null;
 const c=missionChance(ev,team);
 team.forEach(k=>{k.nrg-=MIS_E;k.away=S.gt+ev.h;});
 M.list=M.list.filter(e=>e!==ev);M.active.push(Object.assign({},ev,{team:team.map(k=>k.id),start:S.gt,end:S.gt+ev.h,ch:c.ch}));
 log(team.map(k=>k.name).join(', ')+' part'+(team.length>1?'ent':'')+' pour '+ev.v+' : '+m.n.toLowerCase()+'.');
 return true;
}

/* ---------- résultat ---------- */
function resolve(a,sum){
 const m=MISSION_BY[a.k],team=a.team.map(byId).filter(Boolean),roll=r(),win=roll<a.ch,great=win&&roll<a.ch/3,out=[];
 team.forEach(k=>{k.away=null;});
 if(win){
  const f=great?1.5:1,L=a.L,g={vivres:Math.round((40+30*L)*f),marbre:Math.round((20+20*L)*f),metal:Math.round((10+15*L)*f),savoir:Math.round((5+5*L)*f*(m.kind==='enquete'?3:1))};
  for(const res in g){S.res[res]+=g[res];}out.push(Object.keys(g).map(x=>'+'+g[x]+' '+RES[x].n.toLowerCase()).join(', '));
  const fav=(L>=3?2:1)+(great?1:0);S.faveur=(S.faveur||0)+fav;out.push('+'+fav+' ✦ faveur d’Athéna');
 }
 // expérience : bien plus qu'un entraînement ; et l'on apprend sur le terrain les compétences de la mission
 team.forEach(k=>{trainHours(k,(win?8:3)*a.L);m.skills.forEach(id=>{if(!hasSkill(k,id)&&SKILLS[id]){const s=addProgress(k,id,(win?25:10)*a.L);if(s)out.push(k.name+' découvre : '+s.n.toLowerCase());}});});
 // les équipiers se rapprochent
 for(let i=0;i<team.length;i++)for(let j=i+1;j<team.length;j++){const key=fkey(team[i].id,team[j].id),n=win?(great?2:1):(r()<.5?1:0);if(n)S.friend[key]=Math.min(10,(S.friend[key]||0)+n);}
 // un échec peut blesser
 if(!win)team.forEach(k=>{if(r()<.35){const h=wound(k,1);out.push(k.name+' rentre blessé'+(k.sex==='F'?'e':'')+' ('+h+' h d’infirmerie)');}});
 if(win&&m.k==='paix')out.push('Le village promet de vous envoyer ses enfants les plus prometteurs.');
 const head=(win?(great?'Réussite éclatante':'Réussite'):'Échec')+' à '+a.v+' : ';
 const msg=head+(win?m.ok:m.ko).replace(/\{v\}/g,a.v);
 log(msg);out.forEach(x=>log('  '+x));sum?sum.ev.push(msg):emit(win?'milestone':'alert');
 const M=ensureMissions();M.done++;if(win)M.wins++;
 (M.reports=M.reports||[]).unshift({k:a.k,v:a.v,L:a.L,win,great,team:team.map(k=>k.name),out,t:S.gt});M.reports.length=Math.min(M.reports.length,8);
 team.forEach(k=>{k.rec=k.rec||{w:0,l:0,mw:0,ml:0};if(win)k.rec.mw=(k.rec.mw||0)+1;else k.rec.ml=(k.rec.ml||0)+1;});
}
export function tickMissions(sum){
 const M=ensureMissions();
 const before=M.list.length;M.list=M.list.filter(e=>e.until>S.gt);if(M.list.length!==before)S._dirty=true;
 while(S.gt>=M.nextAt){M.nextAt+=8+r()*6;const ev=spawnMission();if(ev){S._dirty=true;const m=MISSION_BY[ev.k];const msg='Nouvelle mission : '+m.n.toLowerCase()+' à '+ev.v+' ('+ev.nat+').';log(msg);sum?sum.ev.push(msg):emit('alert');}}
 for(let i=M.active.length-1;i>=0;i--){const a=M.active[i];if(S.gt>=a.end){M.active.splice(i,1);resolve(a,sum);S._dirty=true;}}
}
