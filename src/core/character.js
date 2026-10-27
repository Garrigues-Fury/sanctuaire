/* Caractère des personnages (demandé par Seba le 2026-10-27).
   - Le cœur : de −100 (haine) à +100 (bonté). Il compte pour les armures (une armure d'or refuse un cœur haineux)
     et pour les affinités entre personnages.
   - Le ton : la façon de parler de chacun dans les scènes (subtil, déconneur, taquin…).
   - Les complexes : certains doutent d'eux ; le soutien de leurs amis leur rend confiance, jour après jour.
   - Les vétérans : les survivants de la guerre sainte précédente portent une marque, et leurs points forts
     dépassent le niveau 20 en compétences. */
import { FUND, SKILLS, SPEED, specReq } from './data/skills.js';
import { fl, ql } from './data/traits.js';
import { CONS, CONS_BY } from './data/world.js';
import { aptitude, ensureSkills, hasSkill, xpForLevel } from './skills.js';
import { S, log } from './state.js';
import { clamp, mulberry32 } from './util.js';

/* ---------- le cœur ---------- */
export function heartLabel(v){return v>=60?'Grand cœur':v>=20?'Bienveillant':v>-20?'Partagé':v>-60?'Rancunier':'Haineux';}
export function heartText(v){
 return v>=60?'Généreux jusqu’à l’oubli de soi : il pardonne tout, protège les plus faibles.'
  :v>=20?'Bon fond : il aide volontiers et ne garde pas rancune longtemps.'
  :v>-20?'Ni saint ni démon : tout dépend du jour et de la personne.'
  :v>-60?'Il n’oublie rien des torts qu’on lui a faits, et le fait payer.'
  :'Une colère froide l’habite. Les armures d’or refusent un tel cœur.';
}
// Effet du cœur sur les armures : heartAff et heartBlock, dans armor.js.

/* ---------- le ton ---------- */
export const TONS={
 subtil:{n:'Subtil',d:'Parle peu mais vise juste : ironie fine, sous-entendus, un sourcil levé.'},
 deconneur:{n:'Déconneur',d:'Blagues, imitations, bêtises : impossible de rester sérieux à côté.'},
 taquin:{n:'Taquin',d:'Charrie tout le monde, toujours sans méchanceté.'},
 franc:{n:'Franc',d:'Dit ce qu’il pense, sans détour, parfois un peu trop.'},
 reserve:{n:'Réservé',d:'Parle bas, rougit vite, se livre peu.'},
 solennel:{n:'Solennel',d:'Parle comme dans les vieux récits et prend tout au sérieux.'},
 tendre:{n:'Tendre',d:'Toujours un mot gentil, attentif à ce que ressentent les autres.'}
};
const TON_K=Object.keys(TONS);

/* ---------- les complexes ---------- */
export const COMPLEXES={
 apparence:{n:'Son apparence',d:'Se trouve moins beau que les autres et fuit les miroirs.'},
 taille:{n:'Sa taille',d:'Trop petit ou trop grand à son goût : il se sent toujours de trop.'},
 origine:{n:'Ses origines',d:'Craint qu’on le juge pour son pays ou sa famille.'},
 force:{n:'Sa force',d:'Se croit plus faible que les autres et n’ose pas frapper fort.'},
 echec:{n:'Un échec passé',d:'Hanté par un échec qu’il n’a jamais digéré.'},
 parole:{n:'Sa façon de parler',d:'Bégaie ou cherche ses mots dès qu’on le regarde.'}
};
const CX_K=Object.keys(COMPLEXES);
// Un complexe pèse sur les épreuves tant que la confiance n'est pas revenue : −3 points par niveau.
export function complexMalus(p){return p.cx&&p.cx.conf<100?.03*p.cx.lv:0;}

/* ---------- création ---------- */
// r : générateur aléatoire du personnage. vet : survivant de la guerre sainte.
export function genCharacter(p,r,vet){
 const tilt=12*(ql(p,'loyal')+ql(p,'sociable'))+6*(ql(p,'drole')+ql(p,'patient'))-12*(fl(p,'arrogant')+fl(p,'colerique'))-8*ql(p,'orgueilleux');
 p.bon=Math.round(clamp((r()+r()+r()-1.5)*90+20+tilt,-100,100));
 const w={subtil:1,deconneur:1,taquin:1,franc:1,reserve:1,solennel:.6,tendre:1};
 if(ql(p,'drole')){w.deconneur+=4;w.taquin+=2;}if(ql(p,'solitaire')){w.subtil+=2;w.reserve+=1;}if(fl(p,'peureux')){w.reserve+=3;}
 if(ql(p,'studieux')){w.solennel+=1.5;w.subtil+=1;}if(fl(p,'impulsif')||fl(p,'colerique')){w.franc+=3;}if(p.bon>50){w.tendre+=2;}
 let t=r()*TON_K.reduce((s,k)=>s+w[k],0);p.ton=TON_K.find(k=>(t-=w[k])<0)||'franc';
 p.cx=r()<(vet?.15:.3)?{k:CX_K[Math.floor(r()*CX_K.length)],lv:r()<.3?2:1,conf:Math.round(10+r()*40)}:null;
}
// Chaque personnage reçoit son caractère une fois (anciennes parties comprises), toujours le même pour une même graine.
export function ensureCharacter(p){if(!p||p.bon!=null)return;genCharacter(p,mulberry32(((p.seed||p.id||7)^0x2c1b3c6d)>>>0),p.origin==='survivant');}

/* ---------- les vétérans ---------- */
// Points forts : les compétences de son armure, ses quatre meilleures fondamentales, sa vitesse la plus haute.
export function strongSkills(p){
 const c=CONS_BY[p.cons],out=new Set(c?specReq(c):[]);
 FUND.slice().sort((a,b)=>aptitude(p,b)-aptitude(p,a)).slice(0,4).forEach(s=>out.add(s.id));
 const sp=SPEED.filter(s=>hasSkill(p,s.id)).pop();if(sp)out.add(sp.id);
 return[...out].filter(id=>hasSkill(p,id));
}
// Un survivant devient vétéran : points forts au niveau 20 à 24 (22 à 26 pour l'or), le reste au moins au niveau 10 à 14.
export function makeVeteran(p){
 if(p.vet||p.origin!=='survivant')return;
 ensureSkills(p,'k');p.vet=true;
 const r=mulberry32(((p.seed||p.id||3)^0x51ed27)>>>0),strong=new Set(strongSkills(p)),bonus=p.rank==='or'?2:0;
 for(const id in p.sk){if(id==='vie'||!SKILLS[id])continue;
  const L=strong.has(id)?20+bonus+Math.floor(r()*5):10+Math.floor(r()*5);
  p.skx[id]=Math.max(p.skx[id]||0,xpForLevel(L)*(1+r()*.15));}
}

/* ---------- ancienneté (demandée par Seba le 2026-10-27) ---------- */
// k.since : l'heure de jeu où il est devenu chevalier (négative pour les vétérans, chevaliers bien avant la partie) ;
// k.prevCons : les armures qu'il a portées avant la sienne.
const SERVICE={bronze:[2,6],argent:[5,12],or:[10,22]};
export function ensureService(k){
 if(k.since!=null)return;
 if(k.origin!=='survivant'){k.since=S.gt;k.sinceEst=true;return;}
 const r=mulberry32(((k.seed||k.id||5)^0x3a9d1)>>>0),[a,b]=SERVICE[k.rank]||[2,6],years=a+Math.floor(r()*(b-a+1));
 k.since=-(years*365+Math.floor(r()*300))*24;
 // certains vétérans ont porté une armure de rang inférieur avant d'être promus
 const prev=[],free=rk=>CONS.filter(c=>c.rank===rk&&S.armors[c.k]!=='portee'&&!prev.includes(c.k));
 const pickFree=rk=>{const L=free(rk);return L.length?L[Math.floor(r()*L.length)].k:null;};
 if(k.rank==='or'&&r()<.5){if(r()<.4){const x=pickFree('bronze');if(x)prev.push(x);}const y=pickFree('argent');if(y)prev.push(y);}
 if(k.rank==='argent'&&r()<.4){const x=pickFree('bronze');if(x)prev.push(x);}
 if(prev.length)k.prevCons=prev;
}
// Potentiel des vétérans (2026-10-27) : jusqu'ici tous à 90 ; chacun reçoit le sien, une fois.
// Bronze : 30 % peuvent viser l'argent, 6 % l'or. Argent : 15 % peuvent viser l'or.
export function ensurePotential(k){
 if(k.potV||k.origin!=='survivant')return;k.potV=1;
 const r=mulberry32(((k.seed||k.id||9)^0x7f4a3)>>>0),u=r();
 if(k.rank==='bronze')k.pot=Math.round(u<.06?93+r()*6:u<.36?65+r()*27:35+r()*29);
 if(k.rank==='argent')k.pot=Math.round(u<.15?93+r()*6:66+r()*26);
 if(k.rank==='or')k.pot=95;
}
// Ce qu'un chevalier peut encore espérer : null, ou {n:'Prometteur'|'Exceptionnel', to:'argent'|'or'}.
export function promiseOf(k){
 if(!k||!k.rank||k.rank==='or'||k.rank==='garde')return null;
 const p=k.pot||0;
 if(p>=93)return{n:k.rank==='bronze'?'Exceptionnel':'Prometteur',to:'or'};
 if(k.rank==='bronze'&&p>=65)return{n:'Prometteur',to:'argent'};
 return null;
}
// « 9 ans », « 12 jours »…
export function serviceText(k){
 if(k.since==null)return'';const d=(S.gt-k.since)/24;
 const t=d>=365?Math.floor(d/365)+' an'+(d>=730?'s':''):d>=1?Math.floor(d)+' jour'+(d>=2?'s':''):'moins d’un jour';
 return(k.sinceEst?'au moins ':'')+t;
}

/* ---------- au chargement et chaque jour ---------- */
export function ensureLife(){
 if(!S)return;
 [].concat(S.knights||[],S.aps||[],S.guards||[],S.pending||[]).forEach(ensureCharacter);
 (S.knights||[]).forEach(k=>{makeVeteran(k);ensureService(k);ensurePotential(k);});
}
// Chaque jour, les amis bienveillants rendent confiance à ceux qui ont un complexe.
export function tickConfidence(h,sum){
 S.cxAcc=(S.cxAcc||0)+h;if(S.cxAcc<24)return;S.cxAcc-=24;
 const P=S.knights.concat(S.aps,S.guards||[]);
 P.forEach(p=>{if(!p.cx||p.cx.conf>=100)return;
  const fk=o=>{const k=p.id<o.id?p.id+'-'+o.id:o.id+'-'+p.id;return S.friend[k]||0;};
  const sup=P.filter(o=>o!==p&&fk(o)>=2&&(o.bon||0)>0);
  p.cx.conf=Math.min(100,p.cx.conf+1+sup.reduce((t,o)=>t+Math.min(3,fk(o)/3)*(o.bon>50?1.5:1),0));
  if(p.cx.conf>=100){const m=p.name+' a cessé de douter de '+COMPLEXES[p.cx.k].n.toLowerCase()+', grâce au soutien de '+(sup.length?sup.slice(0,2).map(o=>o.name).join(' et '):'ses proches')+'.';log(m);if(sum)sum.ev.push(m);p.cx=null;}
 });
}
