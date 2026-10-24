/* Affinités entre personnages et vie au Sanctuaire.
   L'affinité (de −4 à +4) vient du caractère (qualités et défauts), des racines (même pays, même région du monde)
   et de l'histoire de chacun (deux orphelins, deux survivants de la guerre sainte…).
   Environ une fois par jour, des amitiés se nouent ou s'effilochent toutes seules, et la chronique le raconte. */
import { FLAW, QUAL, fl, ql } from './data/traits.js';
import { NATS } from './data/countries.js';
import { REGIONS, regionOf } from './data/worldmap.js';
import { SIGNS } from './data/world.js';
import { S, emit, log } from './state.js';
import { clamp } from './util.js';

// Paires de traits : [trait A, trait B, valeur, raison]. Les traits sont des clés de QUAL ou de FLAW.
const PAIRS=[
 ['drole','drole',2,'deux sens de l’humour qui se répondent'],['drole','sociable',2,'l’un fait rire, l’autre rassemble'],['drole','reveur',1,'ils rient des mêmes choses étranges'],
 ['sociable','sociable',1,'deux âmes ouvertes'],['loyal','loyal',2,'une même idée de la fidélité'],['loyal','courageux',1,'ils se font confiance au combat'],
 ['patient','impulsif',1,'le calme de l’un tempère l’autre'],['patient','colerique',1,'le calme de l’un apaise l’autre'],['studieux','studieux',1,'des heures à la bibliothèque'],
 ['studieux','reveur',1,'ils refont le monde sous les étoiles'],['reveur','reveur',1,'deux rêveurs'],['travailleur','travailleur',1,'le goût de l’effort'],['perseverant','travailleur',1,'ni l’un ni l’autre n’abandonne'],
 ['courageux','fougueux',1,'toujours les premiers à la charge'],['vif','fougueux',1,'la même fougue'],['solitaire','solitaire',1,'ils savent se taire ensemble'],
 ['arrogant','arrogant',-2,'deux ego dans la même pièce'],['arrogant','orgueilleux',-2,'chacun veut briller'],['orgueilleux','orgueilleux',-1,'deux fiertés'],
 ['colerique','colerique',-2,'deux colères qui s’embrasent'],['colerique','impulsif',-1,'ça part au quart de tour'],['tetu','tetu',-2,'aucun ne cède'],
 ['paresseux','travailleur',-1,'l’un trime, l’autre traîne'],['distrait','studieux',-1,'l’un oublie tout, l’autre rien'],['drole','tetu',-1,'l’humour de l’un agace l’autre'],
 ['drole','arrogant',-1,'l’arrogant n’aime pas qu’on se moque'],['solitaire','sociable',-1,'l’un veut parler, l’autre la paix'],['peureux','fougueux',-1,'l’un fonce, l’autre recule']
];
const has=(p,k)=>QUAL[k]?ql(p,k)>0:fl(p,k)>0;
// Motifs tirés de la biographie.
const BIO_TAGS=[
 ['orphelin',/parents inconnus|seul(e)? dans les rues|orphelinat|Recueilli/i,'tous deux ont grandi sans famille'],
 ['deuil',/perdu un frère|vu tomber|tenu sa position/i,'tous deux ont perdu des proches à la guerre'],
 ['mer',/naufrage|cargo|pêcheur|phare|marine/i,'tous deux ont grandi face à la mer'],
 ['appel',/étoile filante|voix l’appeler|temples de marbre|force inexplicable/i,'tous deux ont senti très tôt l’appel du cosmos']
];
function tags(p){const t=(p.bio||[]).join(' ');return BIO_TAGS.filter(([,re])=>re.test(t)).map(([k])=>k);}

export function compat(a,b){
 if(!a||!b||a.id===b.id)return{v:0,why:[]};
 let v=0;const why=[];
 PAIRS.forEach(([x,y,n,r])=>{if((has(a,x)&&has(b,y))||(x!==y&&has(a,y)&&has(b,x))){v+=n;why.push((n>0?'+ ':'− ')+r);}});
 if(a.nat&&a.nat===b.nat){v+=2;why.push('+ tous deux originaires '+NATS[a.nat].d);}
 else if(a.nat&&b.nat&&regionOf(a.nat)===regionOf(b.nat)){v+=1;why.push('+ même région du monde ('+REGIONS[regionOf(a.nat)].n+')');}
 const ta=tags(a),tb=tags(b);BIO_TAGS.forEach(([k,,r])=>{if(ta.includes(k)&&tb.includes(k)){v+=1;why.push('+ '+r);}});
 if(a.origin==='survivant'&&b.origin==='survivant'){v+=1;why.push('+ survivants de la même guerre');}
 if(a.sign===b.sign){v+=1;why.push('+ même signe ('+SIGNS[a.sign].n+')');}
 return{v:clamp(v,-4,4),why};
}
export function compatLabel(v){return v>=3?'Complicité':v>=1?'Bonne entente':v<=-3?'Rivalité':v<=-1?'Frictions':'Neutre';}

/* ---------- la vie qui passe ---------- */
const POS=[
 ['drole','{a} et {b} ont veillé tard près du feu ; on les entendait rire jusque dans les dortoirs.'],
 ['region','{a} a appris à {b} une chanson de son pays. Ils la fredonnent maintenant à l’entraînement.'],
 ['deuil','{a} et {b} ont parlé longtemps, à voix basse, de ceux qu’ils ont perdus.'],
 ['orphelin','Ni {a} ni {b} n’ont eu de famille. Ils commencent à s’en faire une.'],
 [null,'{a} et {b} se sont entraînés ensemble à l’aube, sans que personne ne le leur demande.'],
 [null,'{a} a couvert {b} devant un maître sévère. {b} ne l’oubliera pas.']
];
const NEG=[
 ['arrogant','{a} a raillé {b} devant les apprentis. {b} n’a rien répondu, mais n’a pas oublié.'],
 ['colerique','Un mot de travers, et {a} a claqué la porte au nez de {b}.'],
 ['tetu','{a} et {b} se sont disputés une heure pour savoir qui avait raison. Personne n’a cédé.'],
 [null,'{a} et {b} se sont disputés pour une broutille ; le ton est monté plus que nécessaire.'],
 [null,'Il y a un froid entre {a} et {b}. Les autres évitent de les placer côte à côte au réfectoire.']
];
const fkeyOf=(a,b)=>a<b?a+'-'+b:b+'-'+a;
function pickLine(list,a,b){
 const c=compat(a,b),why=c.why.join(' ');
 const ok=list.filter(([k])=>!k||(k==='region'&&/région|originaires/.test(why))||(k==='deuil'&&/guerre/.test(why))||(k==='orphelin'&&/sans famille/.test(why))||((QUAL[k]||FLAW[k])&&(has(a,k)||has(b,k))));
 const [,t]=ok[Math.floor(Math.random()*ok.length)];
 const [x,y]=Math.random()<.5?[a,b]:[b,a];return t.replace(/\{a\}/g,x.name).replace(/\{b\}/g,y.name);
}
// Appelé à chaque pas de temps. Une fois par jour de jeu : jusqu'à deux événements entre personnages.
export function tickSocial(h,sum){
 S.socAcc=(S.socAcc||0)+h;
 if(S.socAcc<24)return;S.socAcc-=24;
 const P=S.knights.concat(S.aps,S.guards||[]);if(P.length<2)return;
 const pairs=[];for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const c=compat(P[i],P[j]);if(Math.abs(c.v)>=2)pairs.push([P[i],P[j],c.v]);}
 pairs.sort(()=>Math.random()-.5);let n=0;
 for(const [a,b,v] of pairs){if(n>=2)break;
  const key=fkeyOf(a.id,b.id),cur=S.friend[key]||0;
  if(v>0){const fun=1+.2*(ql(a,'drole')+ql(b,'drole'));if(Math.random()<.12*v*fun&&cur<10){S.friend[key]=cur+1;const m=pickLine(POS,a,b)+' (amitié '+(cur+1)+'/10)';log(m);sum?sum.ev.push(m):emit('social');n++;}}
  else if(Math.random()<.1*-v){if(cur>0)S.friend[key]=cur-1;const m=pickLine(NEG,a,b)+(cur>0?' (amitié '+(cur-1)+'/10)':'');log(m);sum?sum.ev.push(m):emit('social');n++;}
 }
 if(n)S._dirty=true;
}
