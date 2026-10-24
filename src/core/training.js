/* Entraînements, ouverts à tous : chevaliers (Grand Pope compris), apprentis et gardes.
   Ils coûtent surtout de l'énergie. Un seul demande du savoir, deux demandent un objet fabriqué
   (matériel d'entraînement à l'artisanat, élixir à l'herboristerie). */
import { fl, ql } from './data/traits.js';
import { guardRate, knightRate, levelUpAp, levelUpKnight, need, xpRate } from './rules.js';
import { S } from './state.js';

export const TRAININGS=[
 {k:'fo',n:'Combat au rocher',gain:'+1 force',e:25,st:{fo:1}},
 {k:'vi',n:'Course dans l’escalier des douze maisons',gain:'+1 vitesse',e:25,st:{vi:1}},
 {k:'en',n:'Endurance sous la cascade',gain:'+1 endurance',e:25,st:{en:1}},
 {k:'co',n:'Méditation sur les étoiles',gain:'+1 cosmos',e:30,st:{co:1}},
 {k:'libre',n:'Entraînement libre',gain:'+4 h d’entraînement',e:20,hours:4},
 {k:'leste',n:'Entraînement lesté',gain:'+2 force, +1 endurance',e:35,item:'materiel',st:{fo:2,en:1}},
 {k:'elixir',n:'Méditation à l’élixir',gain:'+2 cosmos',e:35,item:'elixir',st:{co:2}},
 {k:'etude',n:'Retraite d’étude des parchemins',gain:'+8 h d’entraînement',e:20,savoir:p=>Math.round(10+2*p.lv*(1-.1*ql(p,'studieux'))),hours:8}
];
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
// Lance une séance. Renvoie le message à afficher.
export function train(p,key){
 const t=TRAININGS.find(x=>x.k===key);if(!t||!canTrain(p,t))return null;
 p.nrg-=t.e;if(t.item)S.items[t.item]--;if(t.savoir)S.res.savoir-=t.savoir(p);
 if(Math.random()<.1*fl(p,'distrait'))return p.name+' a la tête ailleurs : la séance ne donne rien.';
 if(t.st)for(const s in t.st)p.st[s]+=t.st[s];
 if(t.hours)trainHours(p,t.hours);
 return t.n+' : '+t.gain+' pour '+p.name+'.';
}
