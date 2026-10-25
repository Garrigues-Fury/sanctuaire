/* Découverte et progression des compétences (cartes de data/skills.js).
   - Un personnage découvre une compétence en accumulant des points de progrès : selon son temps
     d'entraînement, son aptitude naturelle (ses statistiques, parfois ses qualités) et son maître.
   - Un maître plus gradé et plus expérimenté fait découvrir plus vite ; s'il possède lui-même
     la compétence spécifique visée, encore plus vite. Les vitesses exigent un maître du rang voulu.
   - Une fois découverte, la compétence monte de niveau (1 à 10) avec l'XP du personnage.
   - Les compétences spécifiques visées sont celles de l'armure pressentie la plus proche. */
import { FUND, SKILLS, SPEED, SPEED_OF, specReq } from './data/skills.js';
import { ql } from './data/traits.js';
import { CONS, CONS_BY } from './data/world.js';
import { NEXT_RANK, armorAffinity } from './armor.js';
import { prog, trainTime } from './program.js';
import { teachF } from './schedule.js';
import { S } from './state.js';
import { clamp } from './util.js';

const RANK_I={bronze:1,argent:2,or:3};
const RANK_F={bronze:1,argent:1.5,or:2.2};
// Potentiel minimal pour viser chaque rang (comme economy.js, TRIAL_POT).
const POT={bronze:0,argent:65,or:93};
// Points de progrès nécessaires pour découvrir une compétence.
// Les vitesses creusent un fossé immense entre les rangs : Mach 5 prend des semaines, la lumière des mois.
export const THRESH={fond:100,spec:150,V1:100,V2:2000,V3:10000};
const thr=s=>s.fam==='fond'?THRESH.fond:s.fam==='vit'?THRESH[s.id]:THRESH.spec;

export function skillsOf(p){if(!p.sk)p.sk={};if(!p.skp)p.skp={};if(!p.skx)p.skx={};return p;}
export function hasSkill(p,id){return !!(p.sk&&p.sk[id]);}
// Niveau 1 à 10, selon l'XP accumulée depuis la découverte.
export function skillLevel(p,id){if(!hasSkill(p,id))return 0;const x=(p.skx&&p.skx[id])||0;return Math.min(10,1+Math.floor(Math.log(1+x/200)/Math.log(1.5)));}
export function progressOf(p,id){const s=SKILLS[id];return hasSkill(p,id)?1:clamp(((p.skp&&p.skp[id])||0)/thr(s),0,1);}
// Aptitude naturelle : ses statistiques liées, comparées à sa moyenne (et quelques qualités).
export function aptitude(p,s){
 const st=p.st||{},mean=['fo','vi','de','en','ps','co'].reduce((t,k)=>t+(st[k]||0),0)/6||1;
 let a=clamp(s.st.reduce((t,k)=>t+(st[k]||0),0)/s.st.length/mean,.5,1.8);
 if(s.q)a*=1+.1*s.q.reduce((t,q)=>t+ql(p,q),0);
 return a;
}
// Force d'enseignement d'un maître : son niveau, son rang (le Grand Pope un peu plus), sans maître : seul.
export function mentorFactor(m){return m?(1+m.lv/40)*(RANK_F[m.rank]||1)*(m.role==='pope'?1.2:1):.4;}
// L'armure que le personnage vise : la plus forte affinité parmi celles qu'il peut espérer.
export function targetArmor(p){
 const kn=S.knights.includes(p),nx=kn?NEXT_RANK[p.rank]:null;
 if(kn&&!nx)return null;
 const L=CONS.filter(c=>(kn?c.rank===nx:(p.pot||0)>=POT[c.rank])&&(c.rank!=='or'||c.sign===p.sign)&&S.armors[c.k]!=='portee');
 let best=null,bv=-1;L.forEach(c=>{const v=armorAffinity(p,c).v;if(v>bv){bv=v;best=c;}});return best;
}
// Ajoute des points de progrès ; renvoie la compétence si elle vient d'être découverte.
export function addProgress(p,id,pts){
 skillsOf(p);if(hasSkill(p,id)||pts<=0)return null;
 p.skp[id]=(p.skp[id]||0)+pts;
 if(p.skp[id]>=thr(SKILLS[id])){p.sk[id]=1;p.skx[id]=0;delete p.skp[id];return SKILLS[id];}
 return null;
}
export function grantSkill(p,id){skillsOf(p);if(!p.sk[id]){p.sk[id]=1;p.skx[id]=0;delete p.skp[id];}}

// Part du programme d'entraînement consacrée aux statistiques d'une compétence (0,6 à 1,8).
export function focusOf(p,s){const t=prog(p);return .6+1.2*s.st.reduce((a,k)=>a+(t[k]||0),0)/100;}
/* Une tranche de temps h. xpPerH : l'XP gagnée par heure ; master : le maître (apprenti) ou null ;
   bond : le lien avec le maître (signe, élément) et les amitiés, calculé par rules.js.
   Les niveaux ne suivent pas simplement l'XP : chaque carte progresse selon l'aptitude du personnage,
   la part de son programme d'entraînement qui la nourrit et ses liens.
   Renvoie la liste des compétences découvertes. */
export function tickSkills(p,h,xpPerH,master,bond=1){
 skillsOf(p);
 const dx=(xpPerH||0)*h*bond;if(dx>0)for(const id in p.sk){const s=SKILLS[id];p.skx[id]=(p.skx[id]||0)+dx*aptitude(p,s)*focusOf(p,s);}
 const kn=S.knights.includes(p),ap=S.aps.includes(p);if(!kn&&!ap)return[];
 const tt=trainTime(p)*h;if(tt<=0)return[];
 // maître, lien avec lui et amitiés, expérience acquise (le niveau)
 const mf=(ap?mentorFactor(master)*(master?Math.max(.3,teachF(master)):1):.6)*bond*(1+(p.lv||1)/40);
 const found=[],push=s=>{if(s)found.push(s);};
 FUND.forEach(s=>push(addProgress(p,s.id,2.5*tt*aptitude(p,s)*mf)));
 if(!hasSkill(p,'F1'))return found; // le cosmos doit s'éveiller d'abord
 // vitesse : seulement auprès d'un maître de ce rang ou au-dessus
 // dans l'ordre : Mach 1, puis Mach 5, puis la lumière
 if(ap&&master)SPEED.forEach((s,i)=>{if(RANK_I[master.rank]>=RANK_I[s.rank]&&(i===0||hasSkill(p,SPEED[i-1].id)))push(addProgress(p,s.id,1.5*tt*aptitude(p,s)*mf));});
 // l'armure visée est recalculée au plus une fois par heure de jeu (le calcul est coûteux au rattrapage d'absence)
 if(p.tgtT==null||Math.abs(S.gt-p.tgtT)>=1){const t=targetArmor(p);p.tgtK=t?t.k:null;p.tgtT=S.gt;}
 const c=p.tgtK?CONS_BY[p.tgtK]:null;
 if(c)specReq(c).forEach(id=>push(addProgress(p,id,1.2*tt*aptitude(p,SKILLS[id])*mf*(master&&hasSkill(master,id)?1.5:1))));
 return found;
}
// S'entraîner avec plus fort que soi : coup de pouce aux découvertes de l'élève (lo) auprès de hi.
export function learnFrom(lo,hi){
 const found=[];skillsOf(lo);
 FUND.forEach(s=>{if(!hasSkill(lo,s.id)&&hasSkill(hi,s.id)){const f=addProgress(lo,s.id,8);if(f)found.push(f);}});
 const hr=RANK_I[hi.rank]||0;
 SPEED.forEach((s,i)=>{if(!hasSkill(lo,s.id)&&hasSkill(lo,'F1')&&(i===0||hasSkill(lo,SPEED[i-1].id))&&hr>=RANK_I[s.rank]&&hasSkill(hi,s.id)){const f=addProgress(lo,s.id,25);if(f)found.push(f);}});
 const c=targetArmor(lo);
 if(c&&hasSkill(lo,'F1'))specReq(c).forEach(id=>{if(hasSkill(hi,id)){const f=addProgress(lo,id,20);if(f)found.push(f);}});
 return found;
}
// Ce qui manque pour prétendre à une armure. Une affinité forte permet à l'armure de transmettre
// des compétences spécifiques manquantes par résonance : une à partir de 70, toutes à partir de 85.
export function skillCheck(p,c,aff){
 const missF=FUND.filter(s=>!hasSkill(p,s.id)).map(s=>s.id);
 const sp=SPEED_OF[c.rank],speed=hasSkill(p,sp);
 const missSpec=specReq(c).filter(id=>!hasSkill(p,id));
 const allowed=aff>=85?missSpec.length:aff>=70?1:0;
 return{missF,speed,speedId:sp,missSpec,resonance:missSpec.length<=allowed?missSpec:null};
}
// Ce que les cartes apportent au combat : niveau moyen des fondamentales, palier de vitesse, somme des spécifiques.
export function skillPower(p){
 if(!p.sk)return{fund:0,speed:0,spec:0};
 const fund=FUND.reduce((t,s)=>t+skillLevel(p,s.id),0)/FUND.length;
 const speed=hasSkill(p,'V3')?3:hasSkill(p,'V2')?2:hasSkill(p,'V1')?1:0;
 let spec=0;for(const id in p.sk)if(!/^[FV]d$/.test(id))spec+=skillLevel(p,id);
 return{fund,speed,spec};
}
// Anciennes sauvegardes : les chevaliers savent déjà ce que leur rang et leur armure exigent.
export function ensureSkills(p,kind){
 // chevaliers déjà convertis avec des niveaux uniformes : on les ajuste une fois à leur profil
 if(p.sk&&kind==='k'&&!p.skv){for(const id in p.sk)p.skx[id]=(p.skx[id]||0)*aptitude(p,SKILLS[id]);p.skv=1;}
 if(p.sk)return;skillsOf(p);
 if(kind==='k'){FUND.forEach(s=>grantSkill(p,s.id));SPEED.forEach(s=>{if(RANK_I[s.rank]<=RANK_I[p.rank])grantSkill(p,s.id);});
  const c=CONS_BY[p.cons];if(c)specReq(c).forEach(id=>grantSkill(p,id));for(const id in p.sk)p.skx[id]=p.lv*40*aptitude(p,SKILLS[id]);p.skv=1;}
 else if(kind==='g')['F1','F3','F4','F7'].forEach(id=>grantSkill(p,id));
 else if(p.awk)grantSkill(p,'F1');
}
