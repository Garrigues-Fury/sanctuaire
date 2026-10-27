/* Règles et formules (reprises telles quelles du prototype v0.6). */
import { ART_BY, TIER_MULT, UNIT } from './data/cards.js';
import { NATS } from './data/countries.js';
import { BUILD, E_REGEN, REC_BY, RES, RKEYS, TRIAL_LV, TRIAL_POT, WORK } from './data/economy.js';
import { SITES } from './data/map.js';
import { QKEYS, QUAL, TECH, fl, ql } from './data/traits.js';
import { CONS_BY, ELEM, RANK_MULT, SIGNS, armorName, de } from './data/world.js';
import { makeApprentice } from './people.js';
import { tickWorld } from './expeditions.js';
import { tickSocial } from './social.js';
import { complexMalus, ensureLife, tickConfidence } from './character.js';
import { tickEpreuves } from './epreuves.js';
import { epBonus } from './data/minigames.js';
import { apHelpF, apTrainF, isMaster, jobF, selfF, teachF, timeMult } from './schedule.js';
import { medMult, studyMult, trainStats } from './program.js';
import { AFF_MIN, NEXT_RANK, affLabel, armorAffinity } from './armor.js';
import { ensureSkills, grantSkill, skillCheck, skillPower, tickSkills } from './skills.js';
import { orientF } from './formation.js';
import { buildCostMult, buildTimeMult, extraSlots, gainOnBuilt, gainWhileBuilding } from './builders.js';
import { tickResearch } from './research.js';
import { recoveryMult, tickMedicine } from './medicine.js';
import { tickAuto } from './autotrain.js';
import { gainStat, norm } from './scale.js';
import { tickMissions } from './missions.js';
import { tickRaids } from './defense.js';
import { isKO, tickWounds } from './wounds.js';
import { SKILLS } from './data/skills.js';
import { HADES_H, POSEIDON_H, S, emit, log } from './state.js';
import { G, ROMAN, clamp, fmt } from './util.js';

export const knightsWith=role=>S.knights.filter(k=>k.role===role);
export function people(){return S.knights.concat(S.aps,S.guards||[]);}
export function byId(id){return S.knights.find(k=>k.id===id)||S.aps.find(a=>a.id===id)||(S.guards||[]).find(g=>g.id===id)||null;}
export function isKnight(p){return S.knights.indexOf(p)>=0;}
export function pope(){return S.knights.find(k=>k.role==='pope');}
export function popeBonus(){const p=pope();return p?(.1+norm(p,'co')/1000)*jobF(p):0;}
const jobSum=role=>knightsWith(role).reduce((s,k)=>s+jobF(k),0);
export function prodBase(r,l){return l<=0?0:RES[r].k*l*Math.pow(1.08,l);}
export function herbBase(l){return l<=0?0:.6*l*Math.pow(1.08,l);}
export function herbCap(l){return 100+50*Math.max(0,(l==null?S.b.entrepot:l)-1);}
export function prodMult(){return 1+.15*jobSum('intendant')+popeBonus();}
export function toolMult(site){return 1+.1*(S.tools[site]||0);}
export function capFor(r,l){return(r==='savoir'?150:600)*Math.pow(1.6,Math.max(0,l-1));}
export function cap(r){return capFor(r,S.b.entrepot)*(1+cb('CAP')/100);}
// Chantiers simultanés : le village des artisans, plus le savoir-faire « chantiers en parallèle ».
export function slotsFor(l){return 1+(l>=1?1:0)+(l>=4?1:0)+(l>=8?1:0)+extraSlots();}
export function villageCap(l){return 6+3*l;}
export function siteSlots(site,l){if(l==null)l=S.b[site];if(l<=0)return 0;return(site==='forge'||site==='herbo'||site==='atelier')?1+l:2+l;}
export function workersAt(site){return S.workers.filter(w=>w.job===site);}
export function apsAt(site){return S.aps.filter(a=>a.job===site);}
export function usedSlots(site){return workersAt(site).length+apsAt(site).length;}
export function workerEff(w){return 1+.08*(w.skill-1);}
export function apWorkEff(a){return 1.2*(1+.25*ql(a,'travailleur'))*apHelpF(a);}
export function siteEff(site){let e=0;workersAt(site).forEach(w=>e+=workerEff(w));apsAt(site).forEach(a=>e+=apWorkEff(a));return e;}
export function siteFactor(site){return .2+.4*siteEff(site);}
export function upkeep(){let u=S.workers.length;S.aps.forEach(a=>u+=3+fl(a,'gourmand'));S.knights.forEach(k=>u+=2+fl(k,'gourmand'));(S.guards||[]).forEach(g=>u+=2+fl(g,'gourmand'));return u*(1-cb('UPKEEP')/100);}
export function siteProd(site){if(site==='jardin')return herbBase(S.b.jardin)*siteFactor('jardin')*prodMult()*toolMult('jardin')*(1+cb('P_herbes')/100);const r=WORK[site].res;return prodBase(r,S.b[site])*siteFactor(site)*prodMult()*toolMult(site)*(1+(cb('P_'+r)+cb('P_all'))/100);}
// Recherches des chevaliers à la bibliothèque (métier « Chercheur »).
export function research(k){return S.b.biblio>0?2*(1+k.lv/20)*(1+.25*ql(k,'studieux'))*jobF(k)*(1+cb('P_savoir')/100):0;}
export function rates(){const o={};RKEYS.forEach(r=>o[r]=siteProd(RES[r].b));knightsWith('biblio').forEach(k=>o.savoir+=research(k));o.vivres-=upkeep();return o;}
export function costOf(id){const l=S.b[id],c={},m=buildCostMult(false);for(const r in BUILD[id].base)c[r]=Math.ceil(BUILD[id].base[r]*Math.pow(1.55,l)*(r==='marbre'||r==='metal'?m:1)/5)*5;return c;}
export function oeuvreMult(){return 1/(1+.2*jobSum('oeuvre'));}
export function timeOf(id){return BUILD[id].t*Math.pow(1.7,S.b[id])*oeuvreMult()*buildTimeMult(false)*Math.max(.3,1-cb('BUILD')/100);}
export function houseCost(i){const l=S.houses[i],m=buildCostMult(true);return{marbre:Math.ceil(300*Math.pow(1.8,l)*m/5)*5,metal:Math.ceil(80*Math.pow(1.8,l)*m/5)*5};}
export function houseTime(i){return 3*Math.pow(1.8,S.houses[i])*oeuvreMult()*buildTimeMult(true)*Math.max(.3,1-cb('BUILD')/100);}
export const HOUSE_MAX=5;
export function have(k){return RES[k]?S.res[k]:(S.items[k]||0);}
export function afford(c){for(const r in c)if(have(r)<c[r])return false;return true;}
export function pay(c){for(const r in c){if(RES[r])S.res[r]-=c[r];else S.items[r]=(S.items[r]||0)-c[r];}}
export function capacity(){return 3+2*S.b.dortoirs;}
export function arena(){return 1+.15*S.b.arene;}
export function need(lv){return Math.round(80*Math.pow(1.25,lv-1));}
export function affinity(ap,m){if(!m)return{x:1,t:''};if(m.sign===ap.sign)return{x:1.5,t:'Même signe'};if(SIGNS[m.sign].el===SIGNS[ap.sign].el)return{x:1.25,t:'Même élément'};return{x:1,t:''};}
export function masterOf(ap){return S.knights.find(k=>k.id===ap.master&&isMaster(k))||null;}
export function emax(p){return 100-10*fl(p,'colerique');}
export function eregen(p){return E_REGEN*medMult(p)*recoveryMult()*(1+.15*ql(p,'perseverant'))*(1-.15*fl(p,'fragile'))*(1+cb('NRG')/100);}
export function fkey(a,b){return a<b?a+'-'+b:b+'-'+a;}
export function friendLv(a,b){return S.friend[fkey(a,b)]||0;}
export function friendsOf(p){const out=[];for(const k in S.friend){const [a,b]=k.split('-').map(Number);if(a!==p.id&&b!==p.id)continue;const o=byId(a===p.id?b:a);if(o&&S.friend[k]>0)out.push({p:o,lv:S.friend[k]});}return out.sort((x,y)=>y.lv-x.lv);}
export function friendBonus(p){let s=0;friendsOf(p).forEach(f=>{const mentor=(p.master===f.p.id&&isKnight(f.p)&&isMaster(f.p))||(f.p.master===p.id&&isKnight(p)&&isMaster(p));s+=f.lv*(mentor?2:1);});s*=.01*(1+.25*ql(p,'sociable'))*(1-.2*fl(p,'arrogant'));return Math.max(0,Math.min(.3+cb('FCAP')/100,s));}
export function xpRate(ap){
 const m=masterOf(ap);let mm=.4+.1*ql(ap,'solitaire');
 // le maître forme à plein régime quand il y consacre la moitié de son temps
 if(m)mm=.4+((1+m.lv/40+({or:.5,argent:.25,bronze:0})[m.rank])*affinity(ap,m).x*(1+.07*ql(ap,'loyal'))*(1-.1*ql(ap,'solitaire'))*(1-.08*fl(ap,'tetu'))-.4)*teachF(m);
 const tr=(1+.05*ql(ap,'fougueux'))*timeMult(ap);
 return 10*arena()*mm*tr*(1+.1*S.houses[ap.sign])*(1+ap.st.en/200)*(1+popeBonus())*(1+friendBonus(ap))*(1+cb('XP')/100)*(S.starve?.5:1)*apTrainF(ap)*studyMult(ap);
}
export function knightRate(k){return 6*arena()*selfF(k)*studyMult(k)*(1+popeBonus())*(1+friendBonus(k))*(1+cb('XP')/100)*(S.starve?.5:1);}
// Puissance : statistiques, rang, niveau, et cartes de compétences (vitesse surtout : le fossé entre les rangs).
export function power(p,rank){const s=p.st,sp=skillPower(p);return((s.fo+s.vi+s.en+(s.de||0)+(s.ps||0))*.8+s.co*2)*(1+sp.fund*.03+sp.spec*.01)*[1,1.15,1.6,2.6][sp.speed]*(rank?1:.5)*(1+p.lv/20);}
export function sanctPower(){let t=0;S.knights.forEach(k=>t+=power(k,k.rank));S.aps.forEach(a=>t+=power(a,null)*.5);S.houses.forEach(h=>t+=h*40);return t;}
export const RANK_W={apprenti:.5,garde:1,bronze:2,argent:4,or:8};
export function weightOf(p){return RANK_W[p.rank||'apprenti']*(p.role==='pope'?1.5:1)*(1+norm(p,'co')/50);}
export function elemScores(){const o={feu:0,eau:0,air:0,terre:0};people().forEach(p=>o[SIGNS[p.sign].el]+=weightOf(p));return o;}
export function consScore(){let t=0;S.knights.forEach(k=>t+=weightOf(k)*(1+k.lv/40));return t;}
export function recruitInterval(){const rs=knightsWith('recruteur'),n=jobSum('recruteur');if(!rs.length||n<=0)return Infinity;const co=Math.max(...rs.map(k=>norm(k,'co')));return 10/(1+co/80)/(n>=1?1+.5*(n-1):n)/(1+cb('RECRUIT')/100);}
export function cosmosLabel(co){return co<20?'Latent':co<60?'Éveillé':co<500?'Brûlant':co<8000?'Ardent':'Aux portes du septième sens';}
export function forgeRate(){return .5*siteEff('forge')*(1+.1*S.b.forge)*(1+cb('FORGE')/100);}
export function craftRate(ws){return S.b[ws]>0?.6*siteEff(ws)*(1+.1*S.b[ws])*(1+cb('CRAFT')/100):0;}
export function bestSmith(){let b=0;workersAt('forge').forEach(w=>b=Math.max(b,w.skill));return b;}
export function workerCost(){return{vivres:Math.ceil((60+25*Math.pow(S.workers.length,1.3))/5)*5};}

export function bonusStats(p){[['courageux','fo'],['vif','vi'],['reveur','co']].forEach(([q,s])=>{const l=ql(p,q);if(l&&Math.random()<.33*l)gainStat(p,s,1);});}
export function gainQuality(p,sum){
 if((p.qual||[]).length>=3||Math.random()>=.5)return;
 const opts=QKEYS.filter(k=>!ql(p,k));const k=opts[Math.floor(Math.random()*opts.length)];p.qual.push({k,lv:1});
 const m=p.name+' se découvre une nouvelle qualité : '+QUAL[k].n.toLowerCase()+'.';log(m);sum&&sum.ev.push(m);
}
export function levelUpAp(ap,sum){
 ap.xp-=need(ap.lv);ap.lv++;
 ap.sp=(ap.sp||0)+2+Math.floor(ap.pot/30);bonusStats(ap);if(ap.awk)ap.st.co++;
 let msg='';
 if(ap.lv===5&&!ap.awk){ap.awk=true;ap.st.co+=5;grantSkill(ap,'F1');msg=ap.name+' a senti brûler son cosmos pour la première fois.';}
 const ti=[10,20,30].indexOf(ap.lv);
 if(ti>=0){const tn=TECH[SIGNS[ap.sign].el][ti];ap.tech.push(tn);msg=ap.name+' découvre une technique : '+tn+'.';gainQuality(ap,sum);}
 if(msg){log(msg);sum&&sum.ev.push(msg);}
 if(sum)sum.lv[ap.id]=(sum.lv[ap.id]||0)+1;else emit(msg?'milestone':'levelup',ap.id);
 S._dirty=true;
}
export function levelUpKnight(k){k.xp-=need(k.lv)*1.5;k.lv++;k.sp=(k.sp||0)+{bronze:2,argent:3,or:5}[k.rank];bonusStats(k);S._dirty=true;}
export function step(h,sum){
 const R=rates();
 RKEYS.forEach(r=>{const v=S.res[r]+R[r]*h;S.res[r]=clamp(v,0,Math.max(cap(r),S.res[r]));});
 if(S.b.jardin>0){S.items.herbes=Math.min(Math.max(herbCap(),S.items.herbes||0),(S.items.herbes||0)+siteProd('jardin')*h);}
 S.starve=S.res.vivres<=0.01&&R.vivres<0;
 S.aps.forEach(ap=>{ap.xp+=xpRate(ap)*h;let g=0;while(ap.xp>=need(ap.lv)&&g++<50)levelUpAp(ap,sum);
  if(ap.job){ap.wacc=(ap.wacc||0)+h*apHelpF(ap);while(ap.wacc>=24){ap.wacc-=24;ap.st[WORK[ap.job].stat]++;}}});
 S.knights.forEach(k=>{k.xp+=knightRate(k)*h;let g=0;while(k.xp>=need(k.lv)*1.5&&g++<50)levelUpKnight(k);});
 (S.guards||[]).forEach(gd=>{gd.xp+=guardRate(gd)*h;let g=0;while(gd.xp>=need(gd.lv)*1.5&&g++<50){gd.xp-=need(gd.lv)*1.5;gd.lv++;gd.sp=(gd.sp||0)+2;bonusStats(gd);S._dirty=true;}});
 // un blessé récupère son énergie mais ne s'entraîne pas
 const am=arena();people().forEach(p=>{p.nrg=Math.min(emax(p),(p.nrg||0)+eregen(p)*h);if(!isKO(p))trainStats(p,h,am);});
 // compétences : découvertes et niveaux
 // lien : affinité de signe ou d'élément avec le maître, et amitiés
 // le maître d'apprentissage oriente les apprentis : découvertes plus rapides
 const orient=1+.15*orientF();
 const skf=(p,kind,rate,m)=>{ensureSkills(p,kind);const bond=(m?affinity(p,m).x:1)*(1+friendBonus(p))*(kind==='a'?orient:1);tickSkills(p,h,rate,m,bond).forEach(sk=>{const msg=p.name+' découvre une compétence : '+sk.n+'.';log(msg);sum?sum.ev.push(msg):emit('milestone',p.id);S._dirty=true;});};
 S.aps.forEach(ap=>skf(ap,'a',xpRate(ap),masterOf(ap)));S.knights.forEach(k=>skf(k,'k',knightRate(k),null));(S.guards||[]).forEach(g=>skf(g,'g',guardRate(g),null));
 S.workers.forEach(w=>{if(!w.job)return;if(w.job==='forge'&&!S.forgeJob)return;if((w.job==='herbo'||w.job==='atelier')&&!S.craft[w.job].length)return;
  w.sxp+=h;while(w.skill<10&&w.sxp>=24*w.skill){w.sxp-=24*w.skill;w.skill++;if(w.skill===5&&w.job==='forge'){const m=w.name+' est désormais maître forgeron. Les armures d’or ne lui résistent plus.';log(m);sum&&sum.ev.push(m);}S._dirty=true;}});
 if(S.forgeJob)S.forgeJob.prog+=forgeRate()*h;
 ['herbo','atelier'].forEach(ws=>{const q=S.craft[ws];if(!q.length)return;let left=craftRate(ws)*h;while(left>0&&q.length){const j=q[0];const r=REC_BY[j.k];const need=r.work-j.prog;if(left>=need){left-=need;q.shift();S.items[j.k]=(S.items[j.k]||0)+1;S._dirty=true;if(sum)sum.made[j.k]=(sum.made[j.k]||0)+1;else emit('crafted',j.k);}else{j.prog+=left;left=0;}}});
 S.fpAcc=(S.fpAcc||0)+h;const fpT=6/(1+cb('FP')/100);while(S.fpAcc>=fpT){S.fpAcc-=fpT;if(S.fp<30){S.fp++;S._dirty=true;}}
 S.gt+=h;
 ensureLife();tickWorld(sum);tickSocial(h,sum);tickConfidence(h,sum);tickResearch(h,sum);tickMedicine(h,sum);tickAuto(sum);tickMissions(sum);tickRaids(sum);tickWounds(sum);if(tickEpreuves(sum))recomputeCB();
 gainWhileBuilding(h);
 for(let i=S.jobs.length-1;i>=0;i--){const j=S.jobs[i];if(S.gt>=j.end){let m;gainOnBuilt(/^h\d+$/.test(j.b),j.lvl);if(/^h\d+$/.test(j.b)){const hi=+j.b.slice(1);S.houses[hi]=j.lvl;m='La maison '+de(SIGNS[hi].n)+' est restaurée au niveau '+j.lvl+'.';}else{S.b[j.b]=j.lvl;m=BUILD[j.b].n+' atteint le niveau '+j.lvl+'.';}S.jobs.splice(i,1);log(m);sum?sum.ev.push(m):emit('built',j.b);S._dirty=true;}}
 if(S.forgeJob&&S.forgeJob.prog>=S.forgeJob.work){const c=CONS_BY[S.forgeJob.cons];S.armors[c.k]='restauree';S.forgeJob=null;const m=armorName(c)+' est restaurée et attend un porteur.';log(m);sum?sum.ev.push(m):emit('armor',c.k);S._dirty=true;}
 const iv=recruitInterval();
 if(iv<Infinity){S.recruitAcc+=h;if(S.recruitAcc>=iv){S.recruitAcc-=iv;if(S.pending.length<3){const a=makeApprentice();S.pending.push(a);const m='Un recruteur ramène '+a.name+', '+a.age+' ans, venu'+G(a,'e')+' '+NATS[a.nat].d+'.';log(m);sum?sum.ev.push(m):emit('recruit');S._dirty=true;}else S.recruitAcc=Math.min(S.recruitAcc,iv);}}
 [[POSEIDON_H-30*24,'p30','Les marées deviennent étranges sur toutes les côtes du monde. Poséidon s’agite dans son sommeil.'],[HADES_H-60*24,'h60','Les étoiles maléfiques brillent plus fort chaque nuit. Hadès prépare son retour.']].forEach(([t,f,m])=>{if(S.gt>=t&&!S.flags[f]){S.flags[f]=true;log(m);sum&&sum.ev.push(m);}});
}
export function advance(dt,sum){if(dt<=0)return;const stepH=Math.max(1/60,dt/3000);let rem=dt;while(rem>1e-9){const h=Math.min(stepH,rem);step(h,sum);rem-=h;}}
export function newSum(){return{lv:{},ev:[],made:{}};}
export let CB={};
export function cb(k){return CB[k]||0;}
export function recomputeCB(){CB={};const add=e=>{if(!e)return;for(const k in e)CB[k]=(CB[k]||0)+e[k];};(S.perm||[]).forEach(c=>{add(c.eff);if(c.unlock)CB['U_'+c.unlock]=1;});(S.artefacts||[]).forEach(id=>add(ART_BY[id].eff));(S.epDone||[]).forEach(k=>{const b=epBonus(k);if(b)add({[b.key]:b.v});});}
export function bonusOf(e){return(S.perm||[]).filter(c=>c.el===e).length;}
export function faveur(){return S.faveur||0;}
export function unitsDue(c){const o={};for(const e in c.cost)o[e]=Math.max(0,c.cost[e]-bonusOf(e));return o;}
export function cardPrice(c){const u=unitsDue(c),p={};for(const e in u)if(u[e]>0){const U=UNIT[e];p[U.res]=(p[U.res]||0)+Math.round(u[e]*U.q*TIER_MULT[c.t]);}return p;}
export function reqOk(r){
 switch(r.t){
 case'elem':return elemScores()[r.e]>=r.v;
 case'rank':return S.knights.some(k=>r.v==='argent'?(k.rank==='argent'||k.rank==='or'):k.rank===r.v);
 case'cosmos':return people().some(p=>norm(p,'co')>=r.v);
 case'qual':return people().some(p=>ql(p,r.k)>=r.v);
 case'guards':return (S.guards||[]).length>=r.v;
 case'house':return S.houses.some(h=>h>=r.v);
 case'aps':return S.aps.length>=r.v;
 case'cons':return consScore()>=r.v;
 }return false;
}
export function reqText(r){
 switch(r.t){
 case'elem':return 'Score '+ELEM[r.e].toLowerCase()+' ≥ '+r.v+' (actuel '+fmt(elemScores()[r.e])+')';
 case'rank':return r.v==='or'?'Un chevalier d’or':'Un chevalier d’argent ou d’or';
 case'cosmos':return 'Un personnage au cosmos ≥ '+r.v;
 case'qual':return 'Un personnage '+QUAL[r.k].n.toLowerCase()+(r.v>1?' de niveau '+ROMAN[r.v]:'');
 case'guards':return r.v+' garde'+(r.v>1?'s':'');
 case'house':return 'Une maison au niveau '+r.v;
 case'aps':return r.v+' apprentis';
 case'cons':return 'Score constellations ≥ '+r.v+' (actuel '+fmt(consScore())+')';
 }return '';
}
export function artReady(a){for(const e in a.need)if(bonusOf(e)<a.need[e])return false;return (a.req||[]).every(reqOk);}
export const POSTS=['village','champs','carriere','mine','jardin','biblio','forge','herbo','atelier','infirmerie'];
export function postName(p){if(!p)return 'sans poste';if(p==='infirmerie')return 'infirmerie';if(/^h\d+$/.test(p))return 'maison '+de(SIGNS[+p.slice(1)].n);if(p==='village')return 'village de Rodorio';return SITES[p]?SITES[p].n.toLowerCase():p;}
export function defenseOf(post){let d=0;(S.guards||[]).forEach(g=>{if(g.post===post)d+=power(g,'garde');});return d*(1+cb('DEF')/100);}
export function guardRate(g){return 6*arena()*.6*timeMult(g)*studyMult(g)*(1+popeBonus())*(1+friendBonus(g))*(1+cb('XP')/100)*(S.starve?.5:1);}
export const SESS=[
 {k:'fo',n:'Combat au rocher',gain:'+2 force',cost:a=>({vivres:Math.round(40*(1+a.st.fo/20)),metal:Math.round(10*(1+a.st.fo/20))})},
 {k:'vi',n:'Course dans les escaliers',gain:'+2 vitesse',cost:a=>({vivres:Math.round(30*(1+a.st.vi/20)),marbre:Math.round(20*(1+a.st.vi/20))})},
 {k:'en',n:'Endurance sous la cascade',gain:'+2 endurance',cost:a=>({vivres:Math.round(60*(1+a.st.en/20))})},
 {k:'co',n:'Méditation sur les étoiles',gain:'+2 cosmos',cost:a=>({savoir:Math.round(25*(1+a.st.co/20)*(1-.1*ql(a,'studieux')))})},
 {k:'xp',n:'Retraite d’étude des parchemins',gain:'+6 h de formation',cost:a=>({savoir:Math.round(15*a.lv*(1-.1*ql(a,'studieux'))),vivres:Math.round(20*a.lv)})}
];
export const SESS_E=20,DUO_E=30;
export function trialEval(a,c){
 // Un apprenti tente une armure ; un chevalier tente une promotion au rang suivant.
 const knight=S.knights.includes(a);
 if(S.armors[c.k]!=='restauree')return{ok:false,why:'Armure non disponible'};
 if(knight&&NEXT_RANK[a.rank]!==c.rank)return{ok:false,why:'Promotion au rang suivant seulement'};
 if(a.lv<TRIAL_LV[c.rank])return{ok:false,why:'Niveau '+TRIAL_LV[c.rank]+' requis'};
 if(c.rank==='or'&&c.sign!==a.sign)return{ok:false,why:'Réservée aux natifs '+de(SIGNS[c.sign].n)};
 if(c.rank==='or'&&!knight&&!a.awk)return{ok:false,why:'Cosmos non éveillé'};
 if(a.pot<TRIAL_POT[c.rank])return{ok:false,why:'Pas assez doué pour une armure '+(c.rank==='or'?'d’or':'d’argent')};
 const af=armorAffinity(a,c);
 if(af.block)return{ok:false,af,why:af.block};
 if(af.v<AFF_MIN[c.rank])return{ok:false,af,why:'Affinité'+affLabel(af.v).toLowerCase()+' ('+af.v+'/100, il faut '+AFF_MIN[c.rank]+') : l’armure reste muette'};
 const el=c.el===SIGNS[a.sign].el;
 const tr=-.04*ql(a,'fougueux')+.04*ql(a,'patient')+.03*ql(a,'orgueilleux')-.05*fl(a,'impulsif')-(c.rank!=='bronze'?.06*fl(a,'peureux'):0)-complexMalus(a);
 // compétences : fondamentales et vitesse obligatoires ; une forte affinité fait transmettre les spécifiques manquantes
 ensureSkills(a,knight?'k':'a');const ck=skillCheck(a,c,af.v);
 if(ck.missF.length)return{ok:false,af,ck,why:'Compétences fondamentales à découvrir : '+ck.missF.map(id=>SKILLS[id].n).join(', ')};
 if(!ck.speed)return{ok:false,af,ck,why:'Il faut d’abord atteindre la vitesse requise : '+SKILLS[ck.speedId].n};
 if(!ck.resonance)return{ok:false,af,ck,why:'Compétences spécifiques manquantes : '+ck.missSpec.map(id=>SKILLS[id].n).join(', ')+(af.v<70?' (dès une affinité de 70, l’armure en transmet une par résonance)':'')};
 const ch=clamp(.32+.04*(a.lv-TRIAL_LV[c.rank])+af.v/250+norm(a,'co')/300+tr+cb('TRIAL')/100,.1,.95);
 return{ok:true,ch,el,af,ck,resonance:ck.resonance};
}
