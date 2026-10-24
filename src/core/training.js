/* Entraînements, ouverts à tous : chevaliers (Grand Pope compris), apprentis et gardes.
   Ils coûtent surtout de l'énergie. Un seul demande du savoir, deux demandent un objet fabriqué
   (matériel d'entraînement à l'artisanat, élixir à l'herboristerie). */
import { QUAL, fl, ql } from './data/traits.js';
import { guardRate, knightRate, levelUpAp, levelUpKnight, need, xpRate } from './rules.js';
import { isMaster } from './schedule.js';
import { S } from './state.js';

export const TRAININGS=[
 {k:'fo',n:'Combat au rocher',gain:'+1 force',e:25,st:{fo:1}},
 {k:'vi',n:'Course dans l’escalier des douze maisons',gain:'+1 vitesse',e:25,st:{vi:1}},
 {k:'en',n:'Endurance sous la cascade',gain:'+1 endurance',e:25,st:{en:1}},
 {k:'de',n:'Tir de précision aux galets',gain:'+1 dextérité',e:25,st:{de:1}},
 {k:'ps',n:'Lévitation des pierres de l’arène',gain:'+1 psychokinésie',e:30,st:{ps:1}},
 {k:'co',n:'Méditation sur les étoiles',gain:'+1 cosmos',e:30,st:{co:1}},
 {k:'libre',n:'Entraînement libre',gain:'+4 h d’entraînement',e:20,hours:4},
 {k:'leste',n:'Entraînement lesté',gain:'+2 force, +1 endurance',e:35,item:'materiel',st:{fo:2,en:1}},
 {k:'course',n:'Course aux bracelets de bronze',gain:'+2 vitesse',e:30,item:'lingot',st:{vi:2}},
 {k:'bain',n:'Bain d’onguent après l’effort',gain:'+2 endurance',e:30,item:'onguent',st:{en:2}},
 {k:'elixir',n:'Méditation à l’élixir',gain:'+2 cosmos',e:35,item:'elixir',st:{co:2}},
 {k:'jongle',n:'Jonglage aux lingots',gain:'+2 dextérité',e:30,item:'lingot',st:{de:2}},
 {k:'transe',n:'Transe à la tisane',gain:'+2 psychokinésie',e:30,item:'tisane',st:{ps:2}},
 {k:'tisane',n:'Veillée de méditation à la tisane',gain:'+6 h d’entraînement',e:20,item:'tisane',hours:6},
 {k:'etude',n:'Retraite d’étude des parchemins',gain:'+8 h d’entraînement',e:20,savoir:p=>Math.round(10+2*p.lv*(1-.1*ql(p,'studieux'))),hours:8}
];
// Le métier qui fabrique chaque objet d'entraînement.
export const ITEM_TRADE={materiel:'artisans (atelier d’artisanat)',lingot:'artisans (atelier d’artisanat)',onguent:'herboristes (herboristerie)',elixir:'herboristes (herboristerie)',tisane:'herboristes (herboristerie)'};
export const kindOf=p=>S.knights.includes(p)?'k':S.aps.includes(p)?'a':'g';
// Gain d'XP équivalent à « hours » heures de formation, selon le type de personnage.
export function trainHours(p,hours){
 const k=kindOf(p);
 if(k==='a'){p.xp+=xpRate(p)*hours;let g=0;while(p.xp>=need(p.lv)&&g++<50)levelUpAp(p,null);}
 else if(k==='k'){p.xp+=knightRate(p)*hours;let g=0;while(p.xp>=need(p.lv)*1.5&&g++<50)levelUpKnight(p);}
 else{p.xp+=guardRate(p)*hours;let g=0;while(p.xp>=need(p.lv)*1.5&&g++<50){p.xp-=need(p.lv)*1.5;p.lv++;p.sp=(p.sp||0)+2;}}
}
export function canTrain(p,t){
 if(p.nrg<t.e)return false;
 if(t.item&&(S.items[t.item]||0)<1)return false;
 if(t.savoir&&S.res.savoir<t.savoir(p))return false;
 return true;
}
/* ---------- s'entraîner à deux ---------- */
// Apprentis entre eux, apprenti avec un chevalier, chevaliers (et gardes) entre eux.
// Le partenaire doit être disponible et accepter : ses chances dépendent de l'affinité et de son caractère.
export const PAIR_E=25;
const rankW=p=>({or:4,argent:3,bronze:2,garde:1}[p.rank]||0);
export function pairPartners(p){
 const k=kindOf(p);
 if(k==='a')return S.aps.filter(x=>x.id!==p.id).concat(S.knights);
 return S.knights.concat(S.guards||[]).filter(x=>x.id!==p.id).concat(S.aps);
}
// Pourquoi le partenaire n'est pas disponible (ou null s'il l'est).
export function unavailable(q){
 if(q.nrg<PAIR_E)return'trop fatigué'+(q.sex==='F'?'e':'');
 if(q.cd&&q.cd>S.gt)return'au repos après une épreuve';
 if(q.job)return'en renfort sur un site';
 if(S.world&&S.world.active&&S.world.active.kid===q.id)return'en mission';
 return null;
}
const pk=(a,b)=>a+'>'+b;
export function acceptChance(p,q,compatV){
 if(p.master===q.id&&kindOf(q)==='k'&&isMaster(q))return 1;
 if(q.master===p.id&&kindOf(p)==='k'&&isMaster(p))return 1;
 let c=.7+.08*compatV+.1*ql(q,'sociable')+.05*ql(q,'loyal')+.05*ql(q,'drole')-.15*ql(q,'solitaire')-.1*fl(q,'paresseux')-(rankW(q)>rankW(p)?.1*fl(q,'arrogant')+.05*ql(q,'orgueilleux'):0)-(q.role==='pope'?.25:0);
 return Math.max(.1,Math.min(.98,c));
}
export function refusedRecently(p,q){return S.refus&&S.refus[pk(p.id,q.id)]>S.gt;}
// Propose une séance à deux. Renvoie {ok, msg}.
export function trainTogether(p,q,compatV){
 if(p.nrg<PAIR_E)return{ok:false,msg:p.name+' est trop fatigué'+(p.sex==='F'?'e':'')+'.'};
 const why=unavailable(q);if(why)return{ok:false,msg:q.name+' n’est pas disponible : '+why+'.'};
 if(refusedRecently(p,q))return{ok:false,msg:q.name+' a déjà refusé tout à l’heure. Mieux vaut attendre un peu.'};
 if(Math.random()>acceptChance(p,q,compatV)){
  S.refus=S.refus||{};S.refus[pk(p.id,q.id)]=S.gt+6;
  const r=ql(q,'solitaire')?'préfère s’entraîner seul'+(q.sex==='F'?'e':'')+' aujourd’hui':q.role==='pope'?'a trop à faire au palais':fl(q,'arrogant')?'ne s’entraîne pas avec n’importe qui':fl(q,'paresseux')?'trouve une excellente raison de ne rien faire':compatV<0?'n’a aucune envie de passer la matinée avec '+p.name:'décline poliment : une autre fois';
  return{ok:false,msg:q.name+' refuse : '+r+'.'};
 }
 p.nrg-=PAIR_E;q.nrg-=PAIR_E;
 const h=5*(1+.1*compatV);
 // l'élève apprend davantage d'un partenaire plus gradé ou plus expérimenté
 const [hi,lo]=rankW(p)>rankW(q)||(rankW(p)===rankW(q)&&p.lv>=q.lv)?[p,q]:[q,p];
 trainHours(hi,h);trainHours(lo,h+(rankW(hi)>rankW(lo)?3:1));
 const key=p.id<q.id?p.id+'-'+q.id:q.id+'-'+p.id;
 if(compatV>=0||Math.random()<.5)S.friend[key]=Math.min(10,(S.friend[key]||0)+1);
 let msg=p.name+' et '+q.name+' s’entraînent ensemble : '+Math.round(h)+' h d’entraînement chacun'+(rankW(hi)>rankW(lo)?' (et un peu plus pour '+lo.name+')':'')+', amitié '+(S.friend[key]||0)+'/10.';
 // un chevalier peut transmettre une qualité à un apprenti
 if(kindOf(lo)==='a'&&kindOf(hi)==='k'&&(lo.qual||[]).length<3&&Math.random()<.15){const t=hi.qual.filter(x=>!ql(lo,x.k));if(t.length){const x=t[Math.floor(Math.random()*t.length)];lo.qual.push({k:x.k,lv:1});msg+=' Au contact de '+hi.name+', '+lo.name+' devient '+QUAL[x.k].n.toLowerCase()+'.';}}
 return{ok:true,msg};
}
// Lance une séance. Renvoie le message à afficher.
export function train(p,key){
 const t=TRAININGS.find(x=>x.k===key);if(!t||!canTrain(p,t))return null;
 p.nrg-=t.e;if(t.item)S.items[t.item]--;if(t.savoir)S.res.savoir-=t.savoir(p);
 if(Math.random()<.1*fl(p,'distrait'))return p.name+' a la tête ailleurs : la séance ne donne rien.';
 if(t.st)for(const s in t.st)p.st[s]+=t.st[s];
 if(t.hours)trainHours(p,t.hours);
 return t.n+' : '+t.gain+' pour '+p.name+'.';
}
