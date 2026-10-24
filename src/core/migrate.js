/* Mise à niveau des sauvegardes du prototype (versions 1 à 6). */
import { CARD_BY } from './data/cards.js';
import { NATS, OLD_NAT, namePool } from './data/countries.js';
import { ARMOR_WORK } from './data/economy.js';
import { genTraits } from './data/traits.js';
import { CONS, CONS_BY } from './data/world.js';
import { makeBio, makeWorker } from './people.js';
import { emax, people } from './rules.js';
import { S, VERSION, log, setS } from './state.js';
import { clamp, mulberry32 } from './util.js';

export const OLD_TRAIT_MAP={fougueux:'fougueux',patient:'patient',studieux:'studieux',loyal:'loyal',solitaire:'solitaire',courageux:'courageux',reveur:'reveur',vif:'vif',travailleur:'travailleur',orgueilleux:'orgueilleux'};
export function migrate(o){
 if(o.v===VERSION)return o;
 const prevS=S;setS(o);const from=o.v;
 CONS.forEach(c=>{if(!S.armors[c.k])S.armors[c.k]='brisee';});
 ['jardin','herbo','atelier'].forEach(k=>{if(S.b[k]==null)S.b[k]=0;});
 S.items=S.items||{herbes:10};S.tools=S.tools||{};S.craft=S.craft||{herbo:[],atelier:[]};S.friend=S.friend||{};if(S.fp==null)S.fp=5;S.fpAcc=S.fpAcc||0;
 if(!S.houses){S.houses=new Array(12).fill(0);S.knights.filter(k=>k.rank==='or').forEach(k=>S.houses[k.sign]=1);}
 const fixNat=p=>{if(OLD_NAT[p.nat])p.nat=OLD_NAT[p.nat];if(!NATS[p.nat])p.nat='Grèce';};
 const enrich=(p,vet)=>{
  fixNat(p);
  if(!p.qual){const r=mulberry32(p.seed^0x99);const t=genTraits(r);p.qual=p.trait&&OLD_TRAIT_MAP[p.trait]?[{k:OLD_TRAIT_MAP[p.trait],lv:1}]:t.qual;p.flaw=t.flaw.slice(0,1);delete p.trait;}
  if(!p.bio)p.bio=makeBio(p,mulberry32(p.seed^0x77),vet);
  if(p.sp==null)p.sp=0;if(p.nrg==null)p.nrg=emax(p);
 };
 S.knights.forEach(k=>enrich(k,k.origin==='survivant'));
 S.aps.forEach(a=>{enrich(a,false);if(a.job===undefined)a.job=null;a.wacc=a.wacc||0;});
 S.pending.forEach(a=>{enrich(a,false);a.job=null;a.wacc=0;});
 if(!S.workers){S.workers=[];const jobs=['champs','champs','carriere','carriere','mine'];if(S.b.biblio>0)jobs.push('biblio');if(S.b.forge>0)jobs.push('forge');jobs.forEach(j=>S.workers.push(makeWorker(j)));}
 S.workers.forEach(fixNat);
 if(S.forgeJob&&S.forgeJob.work==null){const c=CONS_BY[S.forgeJob.cons];const w=ARMOR_WORK[c.rank];const done=S.forgeJob.end&&S.forgeJob.start?clamp((S.gt-S.forgeJob.start)/(S.forgeJob.end-S.forgeJob.start),0,1):0;S.forgeJob={cons:c.k,work:w,prog:w*done};}
 S.v=VERSION;
 if(!S.guards)S.guards=[];if(!S.perm){S.perm=(S.cards||[]).map(id=>{const c=CARD_BY[id];return{n:c.n,el:c.el,t:c.t,eff:c.eff||{},unlock:c.unlock||null,fav:c.fav||0};});S.faveur=S.perm.reduce((a,c)=>a+(c.fav||0),0);delete S.cards;delete S.market;delete S.decks;}
 if(!S.artefacts)S.artefacts=[];
 const renamed=[];people().concat(S.workers,S.pending).forEach(q=>{const pool=namePool(q);if(!pool.includes(q.name)){const old=q.name;q.name=pool[(q.seed>>>3)%pool.length];renamed.push(old+' → '+q.name);}});if(renamed.length)log('Prénoms accordés à leur pays : '+renamed.join(', ')+'.');if(!S.gods)S.gods={};if(!S.duel)S.duel={lastDate:'',lastGt:-999};if(S.match===undefined)S.match=null;
 log(from<3?'Nouvelle version : caractères et défauts, énergie, amitiés, herboristerie, artisanat, Chambre du Pope et gardes.':(from<5?'Version 0.6 : la lecture des astres contre les dieux, et des portraits refaits selon l’origine de chacun.':'Version 0.6 : nouveaux portraits, apparence et prénoms fidèles au pays d’origine.'));
 const out=S;setS(prevS);return out;
}
