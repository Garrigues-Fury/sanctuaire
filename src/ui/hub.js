/* Écrans de gestion (refonte UX du 2026-10-25) : navigation en 5 onglets avec sous-onglets,
   tableau de bord du Sanctuaire (ce qu'il y a à faire, chiffres clés), page Défense et page Relations. */
import { BUILD, RES, RKEYS } from '../core/data/economy.js';
import { GODS, GOD_KEYS } from '../core/data/gods.js';
import { CONS, CONS_BY, EKEYS, ELEM, RANKS, SIGNS, de } from '../core/data/world.js';
import { duelAvailable, godState } from '../core/duel.js';
import { POSTS, afford, cap, capacity, defenseOf, elemScores, masterOf, siteProd, siteSlots, usedSlots, people, pope, postName, power, rates, sanctPower, slotsFor, trialEval, villageCap } from '../core/rules.js';
import { compat, compatLabel } from '../core/social.js';
import { HADES_H, POSEIDON_H, S } from '../core/state.js';
import { dur, esc, fmt } from '../core/util.js';
import { RES_ICON, icon } from './icons.js';
import { tip } from './tips.js';
import { TECHS, TECH_KEYS, bp, builderRank, techLv } from '../core/builders.js';
import { WORK } from '../core/data/economy.js';
import { setMapHoverHandler } from '../map/map.js';
import { bar, costHtml, ptImg, viewApprentis, viewArmures, viewChevaliers, viewChronique, viewFormArmures, viewFormDisciples, viewPope, viewSanctuaire } from './app.js';
import { viewMonde } from './world.js';

/* ---------- navigation : 5 onglets, des sous-onglets ---------- */
export const TABS=[['sanctuaire','Sanctuaire','temple'],['personnages','Personnages','users'],['armures','Armures','armor'],['monde','Monde','globe'],['pope','Astres','star']];
const SUBS={
 sanctuaire:[['apercu','Aperçu','eye'],['batir','Bâtir','hammer'],['defense','Défense','shield'],['chronique','Chronique','scroll']],
 personnages:[['chevaliers','Chevaliers','sword'],['apprentis','Apprentis','users'],['formation','Formation','cap'],['relations','Relations','heart']]
};
// Anciennes adresses d'onglets (sauvegardes, boutons) vers la nouvelle organisation.
const LEGACY={chevaliers:['personnages','chevaliers'],apprentis:['personnages','apprentis'],chronique:['sanctuaire','chronique']};
export function goTab(t,sub){
 if(LEGACY[t]){[t,sub]=LEGACY[t];}
 if(!TABS.some(x=>x[0]===t)){const s=Object.keys(SUBS).find(k=>SUBS[k].some(x=>x[0]===t));if(s){sub=t;t=s;}else t='sanctuaire';}
 S.tab=t;S.sub=S.sub||{};if(sub)S.sub[t]=sub;
}
const subOf=t=>(S.sub&&S.sub[t])||SUBS[t][0][0];
let formView='disciples';
export function setFormView(v){formView=v;}
function subnav(t){
 return '<nav class="subnav" aria-label="Rubriques">'+SUBS[t].map(([k,n,ic])=>'<button data-act="sub:'+t+':'+k+'"'+(subOf(t)===k?' aria-current="true"':'')+'>'+icon(ic,18)+'<span>'+n+'</span></button>').join('')+'</nav>';
}
export function viewHub(){
 if(LEGACY[S.tab]||!TABS.some(x=>x[0]===S.tab))goTab(S.tab);
 const t=S.tab;
 if(t==='sanctuaire'){const s=subOf(t);return subnav(t)+(s==='batir'?builderPanel()+viewSanctuaire():s==='defense'?viewDefense():s==='chronique'?viewChronique():viewApercu());}
 if(t==='personnages'){const s=subOf(t);return subnav(t)+(s==='apprentis'?viewApprentis():s==='formation'?viewFormation():s==='relations'?viewRelations():viewChevaliers());}
 if(t==='armures')return viewArmures();
 if(t==='monde')return viewMonde();
 return viewPope();
}
// Pastilles des onglets : ce qui attend le joueur.
export function tabBadges(){
 const W=S.world;
 return{monde:W?W.events.length+(W.active?1:0):0,personnages:S.pending.length+people().filter(p=>p.sp>0).length,pope:pope()&&duelAvailable()?1:0,sanctuaire:todo().filter(x=>x.urgent).length};
}

/* ---------- tableau de bord ---------- */
// Ce qui attend le joueur aujourd'hui, du plus urgent au plus anodin.
export function todo(){
 const L=[],add=(o)=>L.push(o);
 if(S.starve)add({ic:'alert',t:'Les vivres manquent',d:'La formation est ralentie de moitié. Relancez les champs ou réduisez les bouches à nourrir.',act:'sub:sanctuaire:batir',urgent:true});
 const sp=people().filter(p=>p.sp>0);if(sp.length)add({ic:'plus',t:sp.length+' personnage'+(sp.length>1?'s ont':' a')+' des points à répartir',d:sp.slice(0,3).map(p=>p.name).join(', ')+(sp.length>3?'…':''),act:'sub:personnages:'+(S.knights.some(k=>k.sp>0)?'chevaliers':'apprentis'),urgent:true});
 if(S.pending.length&&S.aps.length<capacity())add({ic:'users',t:S.pending.length+' candidat'+(S.pending.length>1?'s':'')+' aux portes',d:'Accueillez-les avant qu’ils ne repartent.',act:'sub:personnages:apprentis',urgent:true});
 const noM=S.aps.filter(a=>!masterOf(a));if(noM.length)add({ic:'cap',t:noM.length+' apprenti'+(noM.length>1?'s':'')+' sans maître',d:'Ils se forment très lentement. Confiez-les à un chevalier.',act:'sub:personnages:formation',urgent:true});
 const avail=CONS.filter(c=>S.armors[c.k]==='restauree'),ready=S.aps.filter(a=>!(a.cd>S.gt)&&avail.some(c=>trialEval(a,c).ok));
 if(ready.length)add({ic:'armor',t:ready.length+' apprenti'+(ready.length>1?'s peuvent':' peut')+' passer une épreuve',d:ready.slice(0,3).map(a=>a.name).join(', '),act:'sub:personnages:formation',urgent:true});
 if(pope()&&duelAvailable())add({ic:'star',t:'La lecture des astres est disponible',d:'Le duel du jour contre un dieu.',act:'tab:pope',urgent:true});
 const W=S.world;if(W&&W.events.length)add({ic:'globe',t:W.events.length+' alerte'+(W.events.length>1?'s':'')+' dans le monde',d:'Villages attaqués, enfants prometteurs.',act:'tab:monde'});
 const free=slotsFor(S.b.artisans)-S.jobs.length;if(free>0)add({ic:'hammer',t:free+' chantier'+(free>1?'s':'')+' libre'+(free>1?'s':''),d:'Relevez un bâtiment ou une maison du zodiaque.',act:'sub:sanctuaire:batir'});
 if(!S.forgeJob&&S.b.forge>0)add({ic:'armor',t:'L’atelier des armures attend',d:'Restaurez une armure pressentie pour vos apprentis.',act:'tab:armures'});
 const idle=S.workers.filter(w=>!w.job).length;if(idle)add({ic:'users',t:idle+' villageois sans affectation',d:'Envoyez-les sur un site.',act:'sub:sanctuaire:batir'});
 const full=RKEYS.filter(r=>S.res[r]>=cap(r)-.5);if(full.length)add({ic:'block',t:'Réserves pleines : '+full.map(r=>RES[r].n.toLowerCase()).join(', '),d:'La production est perdue. Dépensez ou agrandissez les réserves.',act:'sub:sanctuaire:batir'});
 if(S.fp>0)add({ic:'heart',t:S.fp+' point'+(S.fp>1?'s':'')+' d’amitié à offrir',d:'Renforcez les liens entre vos personnages.',act:'sub:personnages:relations'});
 return L;
}
function kpi(ic,label,value,sub){return '<div class="kpi">'+icon(ic,18)+'<div class="kv num">'+value+'</div><div class="kl">'+label+'</div>'+(sub?'<div class="ks">'+sub+'</div>':'')+'</div>';}
function viewApercu(){
 const pw=sanctPower(),day=Math.floor(S.gt/24)+1;
 let h='<section class="hero-card"><img src="img/sanctuaire/vue-1.webp" alt="" width="720" height="400"><div class="hero-in"><div class="hero-k">Jour '+day+' de la renaissance</div><div class="hero-v num">'+fmt(pw)+'</div><div class="hero-l">Puissance du Sanctuaire</div>'+
  '<div class="omen"><span>Poséidon</span>'+bar(S.gt/POSEIDON_H*100,'','sea')+'<b class="num" data-until="'+POSEIDON_H+'">'+dur(Math.max(0,POSEIDON_H-S.gt))+'</b></div>'+
  '<div class="omen"><span>Hadès</span>'+bar(S.gt/HADES_H*100,'','dark')+'<b class="num" data-until="'+HADES_H+'">'+dur(Math.max(0,HADES_H-S.gt))+'</b></div></div></section>';
 const T=todo();
 h+='<section class="sec"><div class="sec-h"><h2>À faire</h2><span class="aside">'+(T.length?T.length+' point'+(T.length>1?'s':''):'rien d’urgent')+'</span></div>';
 h+=T.length?'<div class="todo">'+T.map(x=>'<button class="todo-i'+(x.urgent?' urgent':'')+'" data-act="'+x.act+'">'+icon(x.ic,22)+'<span class="main"><b>'+esc(x.t)+'</b><small>'+esc(x.d)+'</small></span>'+icon('chevron',18,'chev')+'</button>').join('')+'</div>':'<div class="empty">Tout est en ordre. Le Sanctuaire progresse seul : revenez plus tard.</div>';
 h+='</section>';
 const rk={or:0,argent:0,bronze:0};S.knights.forEach(k=>rk[k.rank]=(rk[k.rank]||0)+1);
 h+='<section class="sec"><div class="sec-h"><h2>Forces</h2></div><div class="kpis">'+
  kpi('sword','Chevaliers',S.knights.length,rk.or+' or · '+rk.argent+' argent · '+rk.bronze+' bronze')+
  kpi('cap','Apprentis',S.aps.length+'<small>/'+capacity()+'</small>',S.pending.length?S.pending.length+' aux portes':'')+
  kpi('shield','Gardes',(S.guards||[]).length,'')+
  kpi('users','Villageois',S.workers.length+'<small>/'+villageCap(S.b.artisans)+'</small>','')+'</div></section>';
 const R=rates();
 h+='<section class="sec"><div class="sec-h"><h2>Économie</h2><span class="aside">par heure</span></div><div class="eco">'+RKEYS.map(r=>'<div class="eco-i"'+tip(r)+'>'+icon(RES_ICON[r],20)+'<div class="main"><div class="ek">'+RES[r].n+'</div>'+bar(S.res[r]/cap(r)*100)+'</div><div class="ev num" style="color:var(--'+(R[r]>=0?'ok':'bad')+')">'+(R[r]>=0?'+':'')+fmt(R[r])+'</div></div>').join('')+'</div>';
 h+='<div class="sec-h" style="margin-top:12px"><h2>Chantiers</h2><span class="aside">'+S.jobs.length+' / '+slotsFor(S.b.artisans)+'</span></div>';
 h+=S.jobs.length?S.jobs.map(j=>{const tot=j.end-j.start,nm=/^h\d+$/.test(j.b)?'Maison '+de(SIGNS[+j.b.slice(1)].n):BUILD[j.b].n;return '<div class="job"><div class="h"><span>'+esc(nm)+' → niv. '+j.lvl+'</span><span class="num" data-until="'+j.end+'">'+dur(j.end-S.gt)+'</span></div>'+bar((S.gt-j.start)/tot*100,'data-ps="'+j.start+'" data-pe="'+j.end+'"')+'</div>';}).join(''):'<p class="hint">Aucun chantier en cours.</p>';
 h+='</section>';
 const E=elemScores(),mx=Math.max(1,...EKEYS.map(e=>E[e]));
 h+='<section class="sec"><div class="sec-h"><h2>Éléments</h2><span class="aside">lecture des astres</span></div><div class="elbars">'+EKEYS.map(e=>'<div class="elb"><span class="chip el-'+e+'">'+ELEM[e]+'</span>'+bar(E[e]/mx*100,'','el-'+e)+'<b class="num">'+fmt(E[e])+'</b></div>').join('')+'</div></section>';
 return h;
}

/* ---------- défense ---------- */
function viewDefense(){
 const houses=SIGNS.map((s,i)=>{const g=S.knights.find(k=>k.rank==='or'&&CONS_BY[k.cons]&&CONS_BY[k.cons].sign===i);const d=defenseOf('h'+i)+(g?power(g,g.rank):0);return{s,i,lv:S.houses[i],g,d,guards:(S.guards||[]).filter(x=>x.post==='h'+i).length};});
 const zones=POSTS.map(p=>({p,n:postName(p),d:defenseOf(p),guards:(S.guards||[]).filter(x=>x.post===p).length}));
 const total=houses.reduce((t,x)=>t+x.d,0)+zones.reduce((t,x)=>t+x.d,0),mx=Math.max(1,...houses.map(x=>x.d),...zones.map(x=>x.d));
 let h='<section class="sec"><div class="kpis">'+kpi('shield','Défense totale',fmt(total),'maisons et zones')+kpi('temple','Maisons relevées',houses.filter(x=>x.lv>0).length+'<small>/12</small>','')+kpi('crown','Gardiens d’or',houses.filter(x=>x.g).length+'<small>/12</small>','')+kpi('users','Gardes postés',(S.guards||[]).filter(g=>g.post).length+'<small>/'+(S.guards||[]).length+'</small>','')+'</div>';
 h+='<p class="hint">Quand un dieu attaquera, chaque maison et chaque zone opposera sa défense : son gardien d’or et les gardes qui y sont postés.</p></section>';
 h+='<section class="sec"><div class="sec-h"><h2>Les douze maisons</h2><span class="aside">du Bélier au palais du Pope</span></div><div class="houses">';
 houses.forEach(x=>{h+='<button class="house-r" data-act="houses"><span class="hs" style="color:var(--'+x.s.el+')">'+x.s.s+'</span><span class="main"><b>'+x.s.n+'</b><small>'+(x.g?esc(x.g.name)+', gardien'+(x.g.sex==='F'?'ne':''):'<span style="color:var(--warn)">sans gardien</span>')+(x.guards?' · '+x.guards+' garde'+(x.guards>1?'s':''):'')+'</small>'+bar(x.d/mx*100)+'</span><span class="lvl-s" aria-label="niveau '+x.lv+' sur 5">'+'★'.repeat(x.lv)+'<i>'+'★'.repeat(5-x.lv)+'</i></span><b class="num dv">'+fmt(x.d)+'</b></button>';});
 h+='</div></section><section class="sec"><div class="sec-h"><h2>Zones du Sanctuaire</h2></div><div class="houses">';
 zones.forEach(z=>{h+='<div class="house-r"><span class="hs">'+icon(z.p==='village'?'users':'temple',20)+'</span><span class="main"><b>'+esc(z.n.replace(/^./,c=>c.toUpperCase()))+'</b><small>'+(z.guards?z.guards+' garde'+(z.guards>1?'s':''):'<span style="color:var(--marble-faint)">aucun garde</span>')+'</small>'+bar(z.d/mx*100)+'</span><b class="num dv">'+fmt(z.d)+'</b></div>';});
 h+='</div></section><section class="sec"><div class="sec-h"><h2>Menaces</h2><span class="aside">niveau des dieux</span></div><div class="houses">';
 GOD_KEYS.map(k=>({k,g:GODS[k],st:godState(k)})).sort((a,b)=>b.st.lv-a.st.lv).forEach(x=>{h+='<div class="house-r"><span class="hs">'+icon('flame',20)+'</span><span class="main"><b>'+esc(x.g.n)+'</b><small>'+x.st.wins+' victoire'+(x.st.wins>1?'s':'')+' contre vous · '+x.st.losses+' défaite'+(x.st.losses>1?'s':'')+'</small></span><b class="num dv">niv. '+x.st.lv+'</b></div>';});
 return h+'</div></section>';
}

/* ---------- formation et relations ---------- */
function viewFormation(){
 return '<div class="seg" role="tablist" style="margin-bottom:10px">'+[['disciples','Par disciple'],['armures','Par armure']].map(([k,n])=>'<button role="tab" aria-selected="'+(formView===k)+'" data-act="formview:'+k+'">'+n+'</button>').join('')+'</div>'+(formView==='armures'?viewFormArmures():viewFormDisciples());
}
function viewRelations(){
 const P=people();
 const links=Object.entries(S.friend||{}).filter(([,v])=>v>0).map(([k,v])=>{const [a,b]=k.split('-').map(Number);return{a:P.find(p=>p.id===a),b:P.find(p=>p.id===b),v};}).filter(x=>x.a&&x.b).sort((x,y)=>y.v-x.v);
 let h='<section class="sec"><div class="kpis">'+kpi('heart','Points d’amitié',S.fp,'+1 toutes les 6 h')+kpi('users','Liens noués',links.length,'')+'</div><p class="hint">Les amitiés accélèrent la formation et les découvertes. Ouvrez une fiche pour offrir un point d’amitié.</p></section>';
 h+='<section class="sec"><div class="sec-h"><h2>Liens les plus forts</h2></div>';
 h+=links.length?'<div class="houses">'+links.slice(0,20).map(x=>{const c=compat(x.a,x.b);return '<div class="house-r rel"><span class="duo">'+ptImg(x.a,x.a.rank)+ptImg(x.b,x.b.rank)+'</span><span class="main"><b>'+esc(x.a.name)+' & '+esc(x.b.name)+'</b><small>'+compatLabel(c.v)+(c.why[0]?' · '+esc(c.why[0].replace(/^[+−] /,'')):'')+'</small>'+bar(x.v*10,'','rose')+'</span><b class="num dv">'+x.v+'/10</b></div>';}).join('')+'</div>':'<div class="empty">Aucun lien pour l’instant : les amitiés se nouent avec le temps et les entraînements à deux.</div>';
 const T=[];for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const c=compat(P[i],P[j]);if(c.v<=-2)T.push({a:P[i],b:P[j],c});}
 if(T.length)h+='<div class="sec-h" style="margin-top:12px"><h2>Tensions</h2></div><div class="houses">'+T.sort((x,y)=>x.c.v-y.c.v).slice(0,10).map(x=>'<div class="house-r rel"><span class="duo">'+ptImg(x.a,x.a.rank)+ptImg(x.b,x.b.rank)+'</span><span class="main"><b>'+esc(x.a.name)+' & '+esc(x.b.name)+'</b><small>'+compatLabel(x.c.v)+(x.c.why[0]?' · '+esc(x.c.why[0].replace(/^[+−] /,'')):'')+'</small></span></div>').join('')+'</div>';
 return h+'</section>';
}

/* ---------- savoir-faire des bâtisseurs ---------- */
export function builderPanel(){
 const free=slotsFor(S.b.artisans)-S.jobs.length;
 let h='<details class="sec builders" open><summary><span class="bt">'+icon('hammer',20)+'<b>Savoir-faire des bâtisseurs</b></span><span class="aside">rang '+builderRank()+' · <b class="num">'+Math.floor(bp())+'</b> points</span></summary>';
 h+='<p class="hint">Chaque chantier terminé rapporte des points de bâtisseur (davantage aux niveaux élevés et pour les maisons du zodiaque), et les artisans apprennent pendant les travaux. Investissez-les, avec des ressources, dans ces savoir-faire. Chantiers : <b>'+S.jobs.length+' / '+slotsFor(S.b.artisans)+'</b>'+(free>0?' ('+free+' libre'+(free>1?'s':'')+')':'')+'.</p><div class="techs">';
 TECH_KEYS.forEach(k=>{const T=TECHS[k],l=techLv(k),max=l>=T.max,c=T.cost(l+1),need=c.bp,res=Object.assign({},c);delete res.bp;const ok=!max&&bp()>=need&&afford(res);
  h+='<div class="tech"><div class="main"><b>'+T.n+' <span class="chip">'+l+' / '+T.max+'</span></b><small>'+(l?'Acquis : '+T.d(l):'Pas encore acquis')+(max?'':' · niveau '+(l+1)+' : '+T.d(l+1))+'</small>'+(max?'':'<div class="cost"><span class="'+(bp()<need?'no':'')+'">'+need+' points</span></div>'+costHtml(res))+'</div><button class="btn sm" data-act="tech:'+k+'"'+(ok?'':' disabled')+'>'+(max?'Maîtrisé':'Apprendre')+'</button></div>';});
 return h+'</div></details>';
}

/* ---------- fiche d'un bâtiment au survol de la carte ---------- */
function jobOf(b){return(S.jobs||[]).find(j=>j.b===b);}
function workLine(b){const j=jobOf(b);return j?'<div class="mt-w">'+icon('hammer',14)+' Chantier → niveau '+j.lvl+' · encore '+dur(j.end-S.gt)+'</div>':'';}
export function mapTipHtml(h){
 if(!h)return '';
 if(h.type==='pope'){const p=pope();return '<b>Palais du Grand Pope</b><div>'+(p?esc(p.name)+' y siège.':'Le trône est vide : nommez un Grand Pope.')+'</div>';}
 if(h.type==='houses'){
  if(h.house==null)return '<b>Les douze maisons</b><div>'+S.houses.filter(x=>x>0).length+' / 12 relevées. Touchez pour les gérer.</div>';
  const i=h.house,s=SIGNS[i],lv=S.houses[i],g=S.knights.find(k=>k.rank==='or'&&CONS_BY[k.cons]&&CONS_BY[k.cons].sign===i);
  return '<b>'+s.s+' Maison '+de(s.n)+'</b><div>'+(lv?'Niveau '+lv+' / 5':'En ruines')+' · formation des natifs +'+10*lv+' %</div><div>'+(g?'Gardée par '+esc(g.name):'Sans gardien d’or')+' · défense '+fmt(defenseOf('h'+i)+(g?power(g,g.rank):0))+'</div>'+workLine('h'+i);
 }
 const id=h.id,B=BUILD[id];if(!B)return '';
 const l=S.b[id]||0;let x='<b>'+B.n+'</b><div>'+(l?'Niveau '+l:'En ruines')+(l?' · '+B.eff(l):'')+'</div>';
 if(WORK[id]&&l)x+='<div>Travailleurs : '+usedSlots(id)+' / '+siteSlots(id)+'</div>';
 if(WORK[id]&&WORK[id].res&&l)x+='<div>Production : '+fmt(siteProd(id))+' '+RES[WORK[id].res].n.toLowerCase()+' / h</div>';
 if(id==='jardin'&&l)x+='<div>Production : '+fmt(siteProd('jardin'))+' herbes / h</div>';
 x+=jobOf(id)?workLine(id):'<div class="mt-n">Niveau suivant : '+B.eff(l+1)+'</div>';
 return x;
}
let tipEl=null;
export function installMapTips(){
 setMapHoverHandler((h,cx,cy)=>{
  if(!tipEl){tipEl=document.createElement('div');tipEl.id='maptip';tipEl.setAttribute('role','tooltip');document.body.appendChild(tipEl);}
  const html=h?mapTipHtml(h):'';
  if(!html){tipEl.hidden=true;return;}
  tipEl.innerHTML=html;tipEl.hidden=false;
  const w=tipEl.offsetWidth,ht=tipEl.offsetHeight,vw=innerWidth;
  tipEl.style.left=Math.max(8,Math.min(vw-w-8,cx-w/2))+'px';tipEl.style.top=Math.max(8,cy-ht-16)+'px';
 });
}
