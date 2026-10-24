/* Interface : onglets, fiches, fenêtres et actions du joueur. */
import { looks } from '../core/appearance.js';
import { SANCT_VIEWS, armorImg, goldArt } from '../core/data/art.js';
import { ARTEFACTS, ART_BY, CARD_BY, EFF_N, UNLOCK_N, effText } from '../core/data/cards.js';
import { NATS } from '../core/data/countries.js';
import { ARMOR_COST, ARMOR_FORGE, ARMOR_SMITH, ARMOR_WORK, BORDER, BUILD, IKEYS, ITEMS, RECIPES, REC_BY, RES, RKEYS, ROLES, STATN, TOOL_SITES, TRIAL_LV, WORK } from '../core/data/economy.js';
import { DUEL_TURNS, DUEL_WIN, GODS, GOD_KEYS } from '../core/data/gods.js';
import { SITES } from '../core/data/map.js';
import { FLAW, QUAL, SIG_WORDS, fl, ql, traitText } from '../core/data/traits.js';
import { TIP, tip } from './tips.js';
import { ITEM_TRADE, PAIR_E, TRAININGS, acceptChance, canTrain, pairPartners, refusedRecently, train, trainTogether, unavailable } from '../core/training.js';
import { compat, compatLabel } from '../core/social.js';
import { PROG, PROG_DEF, ensureSchedules, medMult, perDay, prog, setProg, studyMult } from '../core/program.js';
import { AFF_MIN, NEXT_RANK, affLabel, armorAffinity, bestArmors } from '../core/armor.js';
import { APLAN, KPLAN, apHelpF, apTrainF, isMaster, jobF, plan, selfF, setShare, teachF, timeMult, timeWhy } from '../core/schedule.js';
import { CONS, CONS_BY, EKEYS, ELEM, RANKS, RANK_MULT, SIGNS, armorLow, armorName, de } from '../core/data/world.js';
import { cardOf, duelAvailable, duelLevel, ensureDuel, godState, levelMult, myStart, startDuel } from '../core/duel.js';
import { RELICS } from '../core/data/stars.js';
import { cardArt } from '../art/cards.js';
import { openDuel } from './duel.js';
import { makeGuardFrom, makeWorker, newGame } from '../core/people.js';
import { CB, DUO_E, HOUSE_MAX, POSTS, SESS, SESS_E, affinity, afford, apsAt, arena, artReady, bestSmith, bonusOf, byId, cap, capacity, cardPrice, cb, consScore, cosmosLabel, costOf, craftRate, defenseOf, elemScores, emax, fkey, forgeRate, friendBonus, friendLv, friendsOf, guardRate, have, houseCost, houseTime, knightRate, knightsWith, levelUpAp, masterOf, need, pay, people, pope, postName, power, rates, recomputeCB, recruitInterval, reqOk, research, reqText, sanctPower, siteProd, siteSlots, slotsFor, timeOf, trialEval, usedSlots, villageCap, workerCost, workersAt, xpRate } from '../core/rules.js';
import { exportCode, importCode, save } from '../core/save.js';
import { HADES_H, KEY, POSEIDON_H, S, log, setS } from '../core/state.js';
import { G, ROMAN, clamp, dur, esc, fmt, fmt1 } from '../core/util.js';
import { syncAgents } from '../map/agents.js';
import { mountMap } from '../map/map.js';
import { setSound, sfx, soundPrefs, unlockAudio } from '../audio/audio.js';
import { startExpedition, startHomeScene } from '../core/expeditions.js';
import { eventModal, viewMonde } from './world.js';
import { openScene } from './scene.js';
import { fullBody, portrait } from './portraits.js';

export function $(s){return document.querySelector(s);}
export function ptImg(p,rank,lg){return '<img class="pt'+(lg?' lg':'')+(rank?' '+rank:'')+'" src="'+portrait(p,rank)+'" alt="Portrait de '+esc(p.name)+'" width="'+(lg?132:58)+'" height="'+(lg?132:58)+'">';}
export function signChip(i){const s=SIGNS[i];return '<span class="chip el-'+s.el+'"'+tip('Signe : '+s.n+', élément '+ELEM[s.el].toLowerCase()+'. Avec un maître du même signe, la formation va 1,5 fois plus vite ; du même élément, 1,25 fois. Chaque niveau de la maison du signe ajoute 10 %.')+'><span class="sign">'+s.s+'</span> '+s.n+'</span>';}
export function rankChip(r){return '<span class="chip '+r+'"'+tip(r)+'>'+RANKS[r]+'</span>';}
export const nrgIcon=p=>'<span'+tip('nrg')+'>⚡&#xFE0E; '+Math.floor(p.nrg)+'</span>';
export const spChip=p=>p.sp>0?'<span class="chip sp"'+tip('sp')+'>+'+p.sp+' pts</span>':'';
export function colorOf(k){return RES[k]?RES[k].c:ITEMS[k].c;}
export function nameOf(k){return RES[k]?RES[k].n.toLowerCase():ITEMS[k].n.toLowerCase();}
export function costHtml(c){return '<div class="cost">'+Object.keys(c).map(r=>'<span class="'+(have(r)<c[r]?'no':'')+'"><i style="background:'+colorOf(r)+'"></i>'+fmt(c[r])+' '+nameOf(r)+'</span>').join('')+'</div>';}
export function traitChips(p){return (p.qual||[]).map(t=>'<span class="chip q"'+tip(QUAL[t.k].n+' '+ROMAN[t.lv]+'\n'+traitText(t.k,t.lv,false))+'>'+QUAL[t.k].n+' '+ROMAN[t.lv]+'</span>').join('')+(p.flaw||[]).map(t=>'<span class="chip f"'+tip(FLAW[t.k].n+' '+ROMAN[t.lv]+'\n'+traitText(t.k,t.lv,true))+'>'+FLAW[t.k].n+' '+ROMAN[t.lv]+'</span>').join('');}
export function nrgBar(p){return '<div class="nrg"><span'+tip('nrg')+'>Énergie</span><div class="bar green"><i data-nrg="'+p.id+'" style="width:'+clamp(p.nrg/emax(p)*100,0,100)+'%"></i></div><b data-nrgv="'+p.id+'">'+Math.floor(p.nrg)+'</b></div>';}
export function openSite(id){
 if(id==='dortoirs'){act('tab:apprentis');return;}
 if(id==='arene'){openModal(()=>bldBlock('arene')+'<p class="hint">Les apprentis qui ont un maître s’entraînent ici. Les maîtres se tiennent au bord de l’arène.</p><button class="btn ghost" data-act="tab:apprentis">Voir les apprentis</button>');return;}
 if(id==='artisans'){openModal(villageModal);return;}
 if(id==='entrepot'){openModal(()=>bldBlock('entrepot'));return;}
 openModal(siteModal(id));
}
export function reqsHtml(reqs){if(!reqs||!reqs.length)return '';return '<div class="reqs">'+reqs.map(r=>'<span class="'+(reqOk(r)?'ok':'no')+'">'+(reqOk(r)?'✓':'✗')+' '+esc(reqText(r))+'</span>').join('')+'</div>';}
export function effsHtml(o){const parts=[];if(o.eff)for(const k in o.eff)parts.push(effText(k,o.eff[k]));if(o.unlock)parts.push(UNLOCK_N[o.unlock]);return parts.length?'<div class="ceff">'+parts.map(esc).join(' · ')+'</div>':'';}
export function viewPope(){
 ensureDuel();
 const p=pope(),av=duelAvailable(),st=myStart(),lo=S.duel.loadout;
 let h='<section class="hero pope-hero"><div class="hero-top"><div><div class="lbl">Lecture des astres</div><div class="pow">✦ '+fmt(S.faveur||0)+'</div><div class="hint">Faveur d’Athéna</div></div><div class="row">'+(p?'Le Grand Pope '+esc(p.name)+' veille.':'<span style="color:var(--warn)">Nommez un Grand Pope pour lire dans les astres.</span>')+'</div></div>';
 const E=elemScores(),L=duelLevel();
 h+='<div class="bonusrow">'+EKEYS.map(e=>'<div class="bn"'+tip('Score '+ELEM[e].toLowerCase()+' : '+fmt(E[e])+'. Il vient du nombre de personnages de cet élément, pondéré par leur rang (apprenti, garde, bronze, argent, or, Pope) et leur cosmos. Il donne vos gemmes de départ.')+'><span class="gem g-'+e+'"></span><b>'+st[e]+'</b><small>gemmes '+ELEM[e].toLowerCase()+'</small></div>').join('')+'</div>';
 h+='<div class="row"'+tip('Le niveau des parties monte avec la puissance totale du Sanctuaire : dieu plus fort, mais cartes gardées plus puissantes (×'+levelMult(L).toFixed(2).replace('.',',')+') et plus de faveur.')+'>Parties de niveau <b>'+L+'</b> / 5</div>';
 if(S.match)h+='<button class="btn" data-act="dopen">Reprendre la partie contre '+esc(GODS[S.match.god].n)+'</button>';
 else h+=(av&&p?'<button class="btn" data-act="dstart">Défier un dieu</button>':'<p class="hint">'+(S.speed!==1?'Prochaine lecture dans '+dur(24-(S.gt-(S.duel.lastGt??-999))):'Les astres ont parlé pour aujourd’hui. Revenez demain, sans obligation : un jour sans duel ne coûte rien.')+'</p>');
 h+='</section>';
 h+='<p class="hint">Chaque jour, le Pope affronte un dieu, façon Splendor : on collecte des gemmes d’élément, on achète des cartes qui rapportent des ✦ et des réductions permanentes, et le premier à 15 ✦ l’emporte. Les bonus ci-dessus viennent de la force du Sanctuaire. Une victoire vous laisse garder une carte pour toujours. Une défaite rend le dieu plus fort.</p>';
 // collection d'artefacts du duel
 h+='<section class="sec"><div class="sec-h"><h2>Artefacts des astres</h2><span class="aside">'+S.relics.length+' / '+RELICS.length+' · '+lo.length+' / 3 emportés</span></div><p class="hint">Achetés pendant un duel, ils rejoignent votre collection pour toujours. Avant chaque duel, choisissez-en 3 à emporter.</p><div class="relic-grid">';
 RELICS.forEach(r=>{const own=S.relics.includes(r.id),on=lo.includes(r.id);
  h+='<button class="relic-card'+(own?'':' locked')+(on?' on':'')+'" data-act="loadout:'+r.id+'"'+(own&&!S.match?'':' disabled')+'><img src="'+cardArt(cardOf(r.id))+'" alt=""><b>'+esc(r.n)+'</b><small>'+(own?esc(r.d):'À découvrir en duel')+'</small>'+(on?'<span class="chip ok">emporté</span>':'')+'</button>';});
 h+='</div></section>';
 // factions
 h+='<section class="sec"><div class="sec-h"><h2>Factions</h2></div><div class="list">';
 const act=Object.keys(CB).filter(k=>!k.startsWith('U_')&&EFF_N[k]!==undefined&&CB[k]);
 h+='<div class="fac me"><div class="fh"><b>Sanctuaire d’Athéna</b><span class="chip ok">'+(S.perm||[]).length+' bonus · '+(S.artefacts||[]).length+' artefacts</span></div><div class="hint">'+(act.length?act.map(k=>esc(effText(k,CB[k]))).join(' · '):'Aucun bonus permanent pour l’instant.')+'</div></div>';
 GOD_KEYS.forEach(k=>{const g=godState(k),G0=GODS[k];const bon=EKEYS.filter(e=>g.bonus[e]).map(e=>'+'+g.bonus[e]+' '+ELEM[e].toLowerCase()).join(', ');
  h+='<div class="fac"><div class="fh"><b>'+G0.n+'</b><span class="chip'+(g.lv?' f':'')+'">niv. '+g.lv+' · '+g.losses+' V / '+g.wins+' D</span></div><div class="hint">'+esc(G0.d)+'</div><div class="hint">Éléments : '+G0.aff.map(e=>ELEM[e].toLowerCase()).join(', ')+(bon?' · acquis : '+bon:'')+(g.lv?' · <span style="color:var(--bad)">+'+10*g.lv+' % de puissance lors d’une attaque</span>':'')+'</div></div>';});
 h+='</div></section>';
 h+='<section class="sec"><div class="sec-h"><h2>Artefacts</h2><span class="aside">'+(S.artefacts||[]).length+' / '+ARTEFACTS.length+'</span></div><p class="hint">Ils se débloquent en accumulant des bonus permanents de certains éléments.</p><div class="cards">';
 ARTEFACTS.forEach(a=>{const own=(S.artefacts||[]).includes(a.id);const ready=!own&&artReady(a);
  h+='<div class="card art'+(own?' own':'')+'"><div class="ch"><b>'+esc(a.n)+'</b>'+(own?'<span class="chip ok">Obtenu</span>':'')+'</div><div class="hint">'+esc(a.d)+'</div>'+effsHtml(a)+'<div class="ccost">'+Object.keys(a.need).map(e=>'<span class="u'+(bonusOf(e)>=a.need[e]?' met':'')+'"><span class="gem g-'+e+'"></span>'+Math.min(bonusOf(e),a.need[e])+' / '+a.need[e]+'</span>').join('')+'</div>'+reqsHtml(a.req)+(own?'':'<button class="btn sm" data-act="claim:'+a.id+'"'+(ready?'':' disabled')+'>'+(ready?'Recevoir l’artefact':'Bonus insuffisants')+'</button>')+'</div>';});
 h+='</div></section>';
 if((S.perm||[]).length)h+='<details class="dt"><summary>Bonus permanents <span class="aside">'+S.perm.length+'</span></summary><div class="tlist">'+S.perm.map(c=>'<div><span class="gem g-'+c.el+'"></span><b>'+esc(c.n)+'</b> '+(c.unlock?esc(UNLOCK_N[c.unlock]):Object.keys(c.eff||{}).map(k=>esc(effText(k,c.eff[k]))).join(' · '))+(c.god?' · gagné contre '+GODS[c.god].n:'')+'</div>').join('')+'</div></details>';
 return h;
}
export function viewGuards(){
 const G0=S.guards||[];
 let h='<section class="sec"><div class="sec-h"><h2>Gardes du Sanctuaire</h2><span class="aside">'+G0.length+'</span></div>';
 if(!G0.length)return h+'<p class="hint">Un apprenti de niveau 8 ou plus, qui a raté une épreuve ou qu’un autre surpasse, peut devenir garde depuis sa fiche. Les gardes défendent une maison, le village ou un site.</p></section>';
 const hs=S.houses.map((x,i)=>defenseOf('h'+i)).reduce((a,b)=>a+b,0);const vs=defenseOf('village');let ss=0;POSTS.slice(1).forEach(p=>ss+=defenseOf(p));
 h+='<div class="elems three"><span class="el"><small>Maisons</small><b>'+fmt(hs)+'</b></span><span class="el"><small>Village</small><b>'+fmt(vs)+'</b></span><span class="el"><small>Sites</small><b>'+fmt(ss)+'</b></span></div><p class="hint">Valeurs de défense. Elles compteront quand les dieux enverront leurs guerriers.</p><div class="list">';
 G0.forEach(g=>{h+='<div class="item tap" data-act="guard:'+g.id+'">'+ptImg(g,'garde')+'<div class="main"><div class="name">'+esc(g.name)+' <span class="chip garde">Garde</span>'+spChip(g)+'</div><div class="sub">'+(g.post?'Poste : '+esc(postName(g.post)):'<span style="color:var(--warn)">Sans poste</span>')+'</div><div class="meta">'+nrgIcon(g)+'<span>Défense '+fmt(power(g,'garde'))+'</span></div></div><div class="right"><div class="lvl"'+tip('lv')+'><small>niv.</small>'+g.lv+'</div></div></div>';});
 return h+'</div></section>';
}
export function guardModal(id){return()=>{const g=(S.guards||[]).find(x=>x.id===id);if(!g)return '<p>Ce garde n’est plus là.</p>';
 let h=flashHtml()+'<div class="sheet-head">'+ptImg(g,'garde',true)+'<div class="main"><h2>'+esc(g.name)+'</h2><div style="display:flex;flex-wrap:wrap;gap:6px"><span class="chip garde">Garde</span>'+signChip(g.sign)+sexChip(g)+'</div><div class="hint">'+(g.post?'En poste : '+esc(postName(g.post)):'Sans poste')+'</div></div></div>';
 h+=persoBlock(g);
 h+='<div style="display:grid;gap:6px"><div class="hint">Niveau <b style="color:var(--marble)">'+g.lv+'</b> · défense '+fmt(power(g,'garde'))+'</div>'+bar(g.xp/(need(g.lv)*1.5)*100)+nrgBar(g)+'</div>'+statsHtml(g,'g')+itemUse(g,'g');
 h+=progBlock(g,'g')+trainingBlock(g,'g')+selfWork(g,'g')+friendBlock(g);
 h+='<div class="sec-h"><h2>Poste</h2></div><div class="posts">';
 h+=SIGNS.map((s,i)=>'<button class="opt'+(g.post==='h'+i?' sel':'')+'" data-act="post:'+g.id+':h'+i+'"><b><span class="sign">'+s.s+'</span> '+s.n+'</b><span class="d">déf. '+fmt(defenseOf('h'+i))+'</span></button>').join('');
 h+=POSTS.map(p=>'<button class="opt'+(g.post===p?' sel':'')+'" data-act="post:'+g.id+':'+p+'"><b>'+esc(postName(p).replace(/^./,c=>c.toUpperCase()))+'</b><span class="d">déf. '+fmt(defenseOf(p))+'</span></button>').join('');
 return h+'</div>';};}
export const TABS=[['sanctuaire','Sanctuaire','Δ'],['monde','Monde','◎'],['chevaliers','Chevaliers','✦'],['apprentis','Apprentis','☉'],['armures','Armures','⛨'],['pope','Pope','♛'],['chronique','Chronique','⌛']];
export function renderTabs(){
 const W=S.world;
 const badge={monde:W?W.events.length+(W.active?1:0):0,apprentis:S.pending.length+S.aps.filter(a=>a.sp>0).length,chevaliers:S.knights.filter(k=>k.sp>0).length+(S.guards||[]).filter(g=>g.sp>0).length};
 $('#tabs').innerHTML=TABS.map(([k,n,g])=>'<button data-act="tab:'+k+'"'+(S.tab===k?' aria-current="page"':'')+'><span class="g">'+g+'&#xFE0E;</span>'+n+(badge[k]?'<span class="badge">'+badge[k]+'</span>':'')+'</button>').join('');
}
export function renderRes(){
 const R=rates();
 $('#resbar').innerHTML=RKEYS.map(r=>'<div class="res"'+tip(r)+'><div class="k"><i style="background:'+RES[r].c+'"></i>'+RES[r].n+'</div><div class="v" data-res="'+r+'">'+fmt(S.res[r])+'</div><div class="r">'+(R[r]>=0?'+':'')+fmt(R[r])+'/h · max '+fmt(cap(r))+'</div></div>').join('');
 $('#speedTag').hidden=S.speed===1;
 const sb=$('#soundBtn');if(sb){const on=soundPrefs().on;sb.setAttribute('aria-pressed',on);sb.classList.toggle('off',!on);sb.setAttribute('aria-label',on?'Couper le son':'Activer le son');}
}
export function bar(pct,attrs,cls){return '<div class="bar'+(cls?' '+cls:'')+'"><i '+(attrs||'')+' style="width:'+clamp(pct,0,100).toFixed(1)+'%"></i></div>';}
export function bldBlock(id){
 const B=BUILD[id],l=S.b[id],busy=S.jobs.some(j=>j.b===id),c=costOf(id),full=S.jobs.length>=slotsFor(S.b.artisans);const ok=!busy&&!full&&afford(c);
 return '<div class="bld"><div class="t"><b>'+B.n+'</b><span class="lv">'+(l?'niv. '+l:'ruines')+'</span></div><div class="eff">'+(l?'<em>'+B.eff(l)+'</em> → ':'')+B.eff(l+1)+'</div>'+costHtml(c)+'<div class="act"><button class="btn sm" data-act="build:'+id+'"'+(ok?'':' disabled')+'>'+(busy?'En cours':full?'Chantiers pleins':l?'Améliorer':'Bâtir')+'</button><span class="time">'+dur(timeOf(id))+'</span></div></div>';
}
export function invHtml(){const ks=IKEYS.filter(k=>(S.items[k]||0)>=1||k==='herbes');return '<div class="inv">'+ks.map(k=>'<span class="inv-i"><i style="background:'+ITEMS[k].c+'"></i>'+ITEMS[k].n+' <b'+(k==='herbes'?' data-item="herbes"':'')+'>'+fmt(S.items[k]||0)+'</b></span>').join('')+'</div>';}
export function viewSanctuaire(){
 const slots=slotsFor(S.b.artisans);let h='';const E=elemScores();
 h+='<section class="hero"><div class="hero-top"><div><div class="lbl">Puissance du Sanctuaire</div><div class="pow" data-power>'+fmt(sanctPower())+'</div></div><div class="row"><span><b>'+S.knights.length+'</b> chevaliers</span><span><b>'+S.aps.length+'</b> apprentis</span><span><b>'+S.workers.length+'</b> villageois</span></div></div>';
 h+='<div class="elems">'+EKEYS.map(e=>'<span class="el el-'+e+'"><small>'+ELEM[e]+'</small><b>'+fmt(E[e])+'</b></span>').join('')+'<span class="el"><small>Constellations</small><b>'+fmt(consScore())+'</b></span></div>';
 h+='<div class="row">Poséidon s’éveille dans <b data-until="'+POSEIDON_H+'">'+dur(POSEIDON_H-S.gt)+'</b></div></section>';
 if(S.starve)h+='<div class="banner bad">Les vivres sont épuisés. L’entraînement tourne au ralenti (−50 %). Envoyez du monde aux oliveraies ou agrandissez-les.</div>';
 if(!pope())h+='<div class="banner info">Personne ne guide le Sanctuaire. Ouvrez l’onglet Chevaliers et nommez un Grand Pope.</div>';
 const idle=S.workers.filter(w=>!w.job).length;
 if(S.world&&S.world.home)h+='<div class="banner home">Il se passe quelque chose au Sanctuaire… <button class="btn sm" data-act="home:start" style="margin-left:6px">Voir la scène</button></div>';
 if(S.world&&S.world.active)h+='<div class="banner info">Une scène attend votre retour. <button class="btn sm" data-act="scene:resume" style="margin-left:6px">Reprendre</button></div>';
 if(idle)h+='<div class="banner info">'+idle+' villageois attend'+(idle>1?'ent':'')+' une affectation : voyez la section « Villageois » plus bas.</div>';
 h+='<section class="sec"><div class="map-wrap" id="mapSlot" role="img" aria-label="Carte du Sanctuaire : touchez un site pour gérer ses travailleurs"></div><p class="hint">Touchez un site pour y affecter du monde ou lancer une fabrication. Touchez la colline pour les douze maisons.</p><div class="sites">';
 ['champs','carriere','mine','biblio','jardin','herbo','atelier','forge','artisans'].forEach(id=>{const l=S.b[id];let info;
  if(id==='artisans')info=S.workers.length+' / '+villageCap(S.b.artisans)+' villageois';
  else if(!l)info='ruines';
  else if(id==='forge')info=usedSlots('forge')+' / '+siteSlots('forge')+(S.forgeJob?' · en cours':'');
  else if(id==='herbo'||id==='atelier')info=usedSlots(id)+' / '+siteSlots(id)+' · file '+S.craft[id].length;
  else if(id==='jardin')info=usedSlots(id)+' / '+siteSlots(id)+' · '+fmt1(siteProd(id))+'/h';
  else info=usedSlots(id)+' / '+siteSlots(id)+' · '+fmt(siteProd(id))+'/h';
  h+='<button class="site-btn" data-act="site:'+id+'"><b>'+SITES[id].n+'</b><span>'+info+'</span></button>';});
 h+='</div></section>';
 h+=villagersSection();
 h+='<section class="sec"><div class="sec-h"><h2>Réserve d’objets</h2></div>'+invHtml()+'</section>';
 h+='<section class="sec"><div class="sec-h"><h2>Chantiers</h2><span class="aside">'+S.jobs.length+' / '+slots+' en cours</span></div>';
 if(S.jobs.length)h+=S.jobs.map(j=>{const tot=j.end-j.start;const nm=/^h\d+$/.test(j.b)?'Maison '+de(SIGNS[+j.b.slice(1)].n):BUILD[j.b].n;return '<div class="job"><div class="h"><span>'+nm+' → niv. '+j.lvl+'</span><span data-until="'+j.end+'">'+dur(j.end-S.gt)+'</span></div>'+bar((S.gt-j.start)/tot*100,'data-ps="'+j.start+'" data-pe="'+j.end+'"')+'</div>';}).join('');
 else h+='<p class="hint">Aucun chantier. Les artisans attendent vos ordres.</p>';
 h+='</section><section class="sec"><div class="sec-h"><h2>Reconstruction</h2></div><div class="list">'+BORDER.map(bldBlock).join('')+'</div></section>';
 h+='<section class="sec"><div class="sec-h"><h2>Les douze maisons</h2><span class="aside">'+S.houses.filter(x=>x>0).length+' / 12 relevées</span></div><p class="hint">Chaque niveau d’une maison accélère de 10 % la formation des apprentis de son signe.</p><button class="btn ghost" data-act="houses">Gérer les maisons</button></section>';
 return h;
}
export function sexChip(p){return '<span class="chip" title="'+(p.sex==='F'?'Femme':'Homme')+'">'+(p.sex==='F'?'♀ F':'♂ M')+'</span>';}
// Affinité avec une armure, en clair.
export function affHtml(af){const p=af.parts,bits=[];if(p.elem)bits.push('élément '+(p.elem>0?'+':'')+p.elem);bits.push('compétences +'+p.comp+' ('+af.keys.map(k=>STATN[k]).join(', ')+')');if(p.maitre)bits.push('maître +'+p.maitre);
 return '<b style="color:var(--'+(af.v>=70?'gold-hi':af.v>=45?'ok':af.v>=25?'marble':'bad')+')">'+affLabel(af.v)+' '+af.v+'</b> · '+bits.join(' · ');}
// Les armures pressenties pour un personnage, avec leur état.
export function foreseen(p,rank){const L=bestArmors(p,3,rank);return '<div class="list">'+L.map(({c,a})=>'<div class="item" style="grid-template-columns:minmax(0,1fr)"><div class="main"><div class="name">'+esc(armorName(c))+' '+armorState(c)+'</div><div class="sub">'+affHtml(a)+'</div></div></div>').join('')+'</div>';}
export function roleChip(k){const t=plan(k);let h=k.role?'<span class="chip role '+k.role+'">'+ROLES[k.role].n+' '+t.job+' %</span>':'';
 if(t.dis>0)h+='<span class="chip">Maître '+t.dis+' %</span>';
 if(t.self>0||!h)h+='<span class="chip">Entraînement '+t.self+' %</span>';return h;}
/* ---------- emploi du temps ---------- */
const pct=x=>Math.round(x*100)+' %';
const planLocked=(p,kind)=>kind==='k'&&!p.role?['job']:[];
// Ce que rapporte l'emploi du temps choisi, en clair.
export function planEffects(p,kind){
 const tm=timeMult(p),why=timeWhy(p);
 let h='<div>Rendement du temps : <b>'+pct(tm)+'</b>'+(why.length?' ('+why.join(', ')+')':'')+'.</div>';
 if(kind==='a'){
  if(!p.job)return h+'<div>Tout son temps va à l’entraînement. Envoyez-'+(p.sex==='F'?'la':'le')+' en renfort sur un site pour qu’'+(p.sex==='F'?'elle':'il')+' aide le Sanctuaire.</div>';
  return h+'<div>Formation : <b>'+pct(apTrainF(p))+'</b> de sa vitesse normale · '+fmt(xpRate(p))+' XP / h.</div><div>Travail sur le site ('+esc(SITES[p.job].n.toLowerCase())+') : <b>'+pct(apHelpF(p))+'</b> d’un renfort ordinaire.</div>';}
 const t=plan(p),R=p.role&&ROLES[p.role],j=jobF(p);
 if(R){let fx='';
  if(p.role==='pope')fx='+'+Math.round((.1+p.st.co/1000)*j*100)+' % de production et d’XP pour tous';
  else if(p.role==='intendant')fx='+'+Math.round(15*j)+' % de production';
  else if(p.role==='oeuvre')fx='chantiers '+Math.round(20*j)+' % plus rapides';
  else if(p.role==='recruteur'){const iv=recruitInterval();fx=iv<Infinity?'un candidat toutes les '+dur(iv)+' environ':'aucune recherche';}
  else if(p.role==='biblio')fx=S.b.biblio>0?'+'+fmt1(research(p))+' savoir / h':'bibliothèque à bâtir d’abord';
  h+='<div>'+R.n+' : <b>'+pct(j)+'</b> de l’effet plein · '+fx+'.</div>';}
 else h+='<div>Sans métier : son temps va à ses disciples et à son entraînement.</div>';
 const n=S.aps.filter(a=>a.master===p.id).length;
 if(t.dis>0)h+=n?'<div>Disciples ('+n+' / 3) : formation à <b>'+pct(teachF(p))+'</b> de son plein régime.</div>':'<div style="color:var(--warn)">Aucun disciple : ce temps est perdu. Confiez-lui des apprentis depuis leur fiche.</div>';
 else if(n)h+='<div style="color:var(--warn)">'+n+' disciple'+(n>1?'s attendent':' attend')+' : sans temps pour eux, ils se forment seuls, lentement.</div>';
 return h+'<div>Sa propre progression : <b>'+pct(selfF(p))+'</b> du maximum · '+fmt(knightRate(p))+' XP / h.</div>';
}
export function planBlock(p,kind){
 const t=plan(p),L=planLocked(p,kind),keys=kind==='a'?APLAN:KPLAN;
 if(kind==='a'&&!p.job)return '<div class="sec-h"><h2>Emploi du temps</h2></div><div class="hint plan-out">'+planEffects(p,kind)+'</div>';
 let h='<div class="sec-h"><h2>Emploi du temps</h2></div><p class="hint">Déplacez les curseurs : le total fait toujours 100 %.</p><div class="plan">';
 keys.forEach(x=>{const off=L.includes(x.k);h+='<label class="vol'+(off?' off':'')+'"><span>'+x.n+' <b data-planv="'+x.k+'">'+t[x.k]+' %</b></span><input type="range" min="0" max="100" step="5" value="'+t[x.k]+'" data-plan="'+kind+':'+p.id+':'+x.k+'"'+(off?' disabled':'')+' aria-label="'+x.n+'"></label>';});
 return h+'<div class="hint plan-out" data-planout>'+planEffects(p,kind)+'</div></div>';
}
/* ---------- programme d'entraînement ---------- */
export function progEffects(p){
 const d=perDay(p,arena()),parts=PROG.filter(x=>d[x.k]>0.005).map(x=>'+'+fmt1(d[x.k])+' '+x.gain);
 let h='<div>Par jour : '+(parts.length?parts.join(' · '):'aucun gain de statistique')+'.</div>';
 const m=Math.round((medMult(p)-1)*100),e=Math.round((studyMult(p)-1)*100);
 if(m||e)h+='<div>'+(m?'Méditation : énergie +'+m+' %':'')+(m&&e?' · ':'')+(e?'Études : XP +'+e+' %':'')+'.</div>';
 return h;
}
export function progBlock(p,kind){
 const t=prog(p);
 let h='<div class="sec-h"><h2>Programme d’entraînement</h2><button class="btn sm ghost" data-act="progdef:'+kind+':'+p.id+'">Équilibrer</button></div><p class="hint">Comment '+esc(p.name)+' emploie son temps d’entraînement. Le total fait toujours 100 %.</p><div class="plan">';
 PROG.forEach(x=>{h+='<label class="vol"'+tip(x.k==='med'?'Méditation : recharge l’énergie plus vite (jusqu’à +80 %) et fait monter un peu le cosmos.':x.k==='etu'?'Études : la progression (XP) va plus vite, jusqu’à +60 % (davantage pour un studieux).':x.k)+'><span>'+x.n+' <b data-progv="'+x.k+'">'+t[x.k]+' %</b></span><input type="range" min="0" max="100" step="5" value="'+t[x.k]+'" data-prog="'+kind+':'+p.id+':'+x.k+'" aria-label="'+x.n+'"></label>';});
 return h+'<div class="hint plan-out" data-progout>'+progEffects(p)+'</div></div>';
}
function onProgInput(el,done){
 const [kind,id,key]=el.dataset.prog.split(':'),p=getP(kind,+id);if(!p)return;
 setProg(p,key,+el.value);const t=prog(p);
 document.querySelectorAll('[data-prog^="'+kind+':'+id+':"]').forEach(i=>{const k=i.dataset.prog.split(':')[2];i.value=t[k];const v=i.closest('label').querySelector('[data-progv]');if(v)v.textContent=t[k]+' %';});
 const out=document.querySelector('[data-progout]');if(out)out.innerHTML=progEffects(p);
 if(done){save();sfx('confirm');}
}
function onPlanInput(el,done){
 const [kind,id,key]=el.dataset.plan.split(':'),p=getP(kind,+id);if(!p)return;
 setShare(p,key,+el.value,planLocked(p,kind));const t=plan(p);
 document.querySelectorAll('[data-plan^="'+kind+':'+id+':"]').forEach(i=>{const k=i.dataset.plan.split(':')[2];i.value=t[k];const v=i.closest('label').querySelector('[data-planv]');if(v)v.textContent=t[k]+' %';});
 const out=document.querySelector('[data-planout]');if(out)out.innerHTML=planEffects(p,kind);
 if(done){save();sfx('confirm');}
}
export function viewChevaliers(){
 let h='<section class="sec"><div class="sec-h"><h2>Chevaliers d’Athéna</h2><span class="aside">'+S.knights.length+'</span></div><p class="hint">Touchez un chevalier pour lire son histoire, répartir ses points et lui confier un rôle.</p>';
 h+='<div class="fp-box"><b>'+S.fp+'</b> point'+(S.fp>1?'s':'')+' d’amitié à offrir · +1 toutes les 6 h (veillées autour du feu). Ouvrez une fiche pour renforcer un lien.</div><div class="list">';
 S.knights.slice().sort((a,b)=>RANK_MULT[b.rank]-RANK_MULT[a.rank]||b.lv-a.lv).forEach(k=>{const c=CONS_BY[k.cons];const nAp=S.aps.filter(a=>a.master===k.id).length;
  h+='<div class="item tap" data-act="knight:'+k.id+'">'+ptImg(k,k.rank)+'<div class="main"><div class="name">'+esc(k.name)+' '+rankChip(k.rank)+spChip(k)+'</div><div class="sub">'+armorName(c)+' · '+NATS[k.nat].n+'</div><div class="meta">'+roleChip(k)+(isMaster(k)||nAp?'<span>'+nAp+' / 3 apprentis</span>':'')+''+nrgIcon(k)+'</div></div><div class="right"><div class="lvl"'+tip('lv')+'><small>niv.</small>'+k.lv+'</div></div></div>';});
 return h+'</div></section>'+viewGuards();
}
export function viewApprentis(){
 let h='';
 if(S.pending.length){h+='<section class="sec"><div class="sec-h"><h2>Aux portes du Sanctuaire</h2><span class="aside">'+S.pending.length+' / 3</span></div>';
  S.pending.forEach((a,i)=>{const full=S.aps.length>=capacity();h+='<div class="recruit">'+ptImg(a,null)+'<div class="main" style="min-width:0;display:grid;gap:4px"><div class="name" style="font-weight:700">'+esc(a.name)+' <span class="hint" style="font-weight:400">'+a.age+' ans · '+NATS[a.nat].n+'</span></div><div class="meta" style="display:flex;flex-wrap:wrap;gap:6px">'+signChip(a.sign)+'<span class="chip '+(a.imp==='Exceptionnel'?'or':a.imp==='Prometteur'?'argent':'')+'">'+a.imp+(cb('REVEAL')?' · '+a.pot:'')+'</span>'+traitChips(a)+'</div><div class="hint">Force '+a.st.fo+' · Vitesse '+a.st.vi+' · Dextérité '+a.st.de+' · Endurance '+a.st.en+' · Psychokinésie '+a.st.ps+' · Cosmos '+a.st.co+'</div></div><p class="bio-p">'+a.bio.map(esc).join(' ')+'</p><div class="btns"><button class="btn sm" data-act="accept:'+i+'"'+(full?' disabled':'')+'>'+(full?'Dortoirs pleins':'Accueillir')+'</button><button class="btn sm ghost" data-act="dismiss:'+i+'">Renvoyer chez '+(a.sex==='F'?'elle':'lui')+'</button></div></div>';});
  h+='</section>';}
 const iv=recruitInterval();
 h+='<section class="sec"><div class="sec-h"><h2>Apprentis</h2><span class="aside">'+S.aps.length+' / '+capacity()+' places</span></div>';
 h+='<p class="hint">'+(iv<Infinity?'Prochain candidat dans environ <b data-until="'+(S.gt+iv-S.recruitAcc)+'">'+dur(iv-S.recruitAcc)+'</b>'+(S.pending.length>=3?' (trois candidats patientent déjà)':'')+'.':'Aucun recruteur ne parcourt le monde. Nommez-en un dans l’onglet Chevaliers.')+'</p>';
 if(!S.aps.length)h+='<div class="empty">Aucun apprenti pour l’instant. Accueillez les candidats qui se présentent aux portes.</div>';
 else{h+='<div class="list">';S.aps.slice().sort((a,b)=>b.lv-a.lv).forEach(a=>{const m=masterOf(a);const af=affinity(a,m);
  let sub=m?'Maître : '+esc(m.name)+(af.t?' · '+af.t:''):'<span style="color:var(--warn)">Sans maître (formation lente)</span>';
  if(a.job)sub+=' · <span style="color:var(--gold-hi)">en renfort : '+SITES[a.job].n.toLowerCase()+'</span>';
  h+='<div class="item tap" data-act="ap:'+a.id+'">'+ptImg(a,null)+'<div class="main"><div class="name">'+esc(a.name)+'<span class="sign" style="color:var(--'+SIGNS[a.sign].el+')">'+SIGNS[a.sign].s+'</span>'+spChip(a)+'</div><div class="sub">'+sub+'</div>'+bar(a.xp/need(a.lv)*100,'data-apbar="'+a.id+'"')+'<div class="meta">'+nrgIcon(a)+'<span>Cosmos '+a.st.co+'</span><span>'+a.imp+'</span>'+(a.cd>S.gt?'<span style="color:var(--bad)">au repos</span>':'')+'</div></div><div class="right"><div class="lvl"'+tip('lv')+'><small>niv.</small><span data-aplv="'+a.id+'">'+a.lv+'</span></div></div></div>';});h+='</div>';}
 return h+'</section>';
}
export function armorState(c){const s=S.armors[c.k];if(s==='portee'){const k=S.knights.find(k=>k.cons===c.k);return '<span class="chip ok">Portée'+(k?' par '+esc(k.name):'')+'</span>';}if(s==='restauree')return '<span class="chip '+c.rank+'">Restaurée, sans porteur</span>';if(S.forgeJob&&S.forgeJob.cons===c.k)return '<span class="chip warn">En restauration</span>';return '<span class="chip">Brisée</span>';}
export let armorFilter='or';
export function viewArmures(){
 const smiths=usedSlots('forge');const fr=forgeRate();
 let h='<section class="sec"><div class="sec-h"><h2>Atelier des armures</h2><span class="aside">'+(S.b.forge?'niv. '+S.b.forge:'en ruines')+'</span></div>';
 if(!S.b.forge)h+='<p class="hint">Bâtissez l’Atelier des armures (onglet Sanctuaire) puis envoyez-y des forgerons pour restaurer les armures brisées.</p>';
 else h+='<p class="hint">'+smiths+' forgeron'+(smiths>1?'s':'')+' à l’atelier · meilleur niveau '+bestSmith()+'. Argent : forgeron niv. 3. Or : maître forgeron niv. 5.</p><button class="btn sm ghost" data-act="site:forge">Gérer les forgerons</button>';
 if(S.forgeJob){const c=CONS_BY[S.forgeJob.cons];const rem=(S.forgeJob.work-S.forgeJob.prog)/(fr||1e-9);h+='<div class="job"><div class="h"><span>'+armorName(c)+'</span><span'+(fr>0?' data-forge-eta':'')+'>'+(fr>0?dur(rem):'en pause : aucun forgeron')+'</span></div>'+bar(S.forgeJob.prog/S.forgeJob.work*100,'data-forgebar','blue')+'</div>';if((S.items.huile||0)>0)h+='<button class="btn sm ghost" data-act="huile">Verser une huile sacrée : la moitié du travail d’un coup · '+S.items.huile+'</button>';}
 h+='</section>';
 const counts={};['or','argent','bronze'].forEach(rk=>{const l=CONS.filter(c=>c.rank===rk);counts[rk]=[l.filter(c=>S.armors[c.k]==='portee').length,l.length];});
 h+='<section class="sec"><div class="sec-h"><h2>Les 88 armures</h2><span class="aside">'+(counts.or[0]+counts.argent[0]+counts.bronze[0])+' / 88 portées</span></div><div class="seg" role="tablist">'+['or','argent','bronze'].map(rk=>'<button role="tab" aria-selected="'+(armorFilter===rk)+'" data-act="afilter:'+rk+'">'+RANKS[rk]+' <span>'+counts[rk][0]+'/'+counts[rk][1]+'</span></button>').join('')+'</div>';
 const rk=armorFilter;
 h+='<p class="hint">'+({or:'Douze armures, une par maison. Seul un apprenti né sous le signe de la maison peut prétendre à l’une d’elles.',argent:'Vingt-quatre armures d’argent.',bronze:'Cinquante-deux armures de bronze.'})[rk]+'</p><div class="list">';
 CONS.filter(c=>c.rank===rk).forEach(c=>{const s=S.armors[c.k];let act='';const restoring=S.forgeJob&&S.forgeJob.cons===c.k;
  if(s==='brisee'&&!restoring){const cost=ARMOR_COST[rk];const why=S.b.forge<ARMOR_FORGE[rk]?'Atelier niv. '+ARMOR_FORGE[rk]:bestSmith()<ARMOR_SMITH[rk]?'Forgeron niv. '+ARMOR_SMITH[rk]:S.forgeJob?'Atelier occupé':'';const can=!why&&afford(cost);
   act='<div style="display:grid;gap:4px;justify-items:end"><button class="btn sm" data-act="restore:'+c.k+'"'+(can?'':' disabled')+'>Restaurer</button>'+(why?'<span class="time">'+why+'</span>':'')+'</div>';}
  const mini=armorImg(c.k,true);
  h+='<div class="item'+(mini?' tap':'')+'" style="grid-template-columns:'+(mini?'auto ':'')+'minmax(0,1fr) auto"'+(mini?' data-act="armor:'+c.k+'"':'')+'>'+(mini?'<img class="arm-mini'+(s==='brisee'?' broken':'')+'" src="'+mini+'" alt="" width="48" height="72">':'')+'<div class="main"><div class="name">'+(rk==='or'?'<span class="sign" style="color:var(--gold-hi)">'+SIGNS[c.sign].s+'</span> ':'')+c.n+' <span class="chip el-'+c.el+'">'+ELEM[c.el]+'</span></div><div class="meta">'+armorState(c)+'</div>'+pressentis(c)+(s==='brisee'&&!restoring?costHtml(ARMOR_COST[rk]):'')+'</div>'+act+'</div>';});
 return h+'</div></section>';
}
// Apprentis (et chevaliers, pour une promotion) qui ont une affinité suffisante avec une armure non portée.
function pressentis(c){if(S.armors[c.k]==='portee')return '';const L=S.aps.concat(S.knights.filter(k=>NEXT_RANK[k.rank]===c.rank)).filter(p=>c.rank!=='or'||p.sign===c.sign).map(p=>({p,v:armorAffinity(p,c).v})).filter(x=>x.v>=AFF_MIN[c.rank]).sort((a,b)=>b.v-a.v).slice(0,3);
 return L.length?'<div class="hint">Pressentie pour '+L.map(x=>esc(x.p.name)+' ('+affLabel(x.v).toLowerCase()+')').join(', ')+'</div>':'';}
export function viewChronique(){
 let h='<section class="sec"><div class="sec-h"><h2>Présages</h2></div><div class="grid2">';
 h+='<div class="count sea"><div class="k">Réveil de Poséidon</div><div class="v" data-until="'+POSEIDON_H+'">'+dur(POSEIDON_H-S.gt)+'</div><div class="hint">Il faudra envoyer des chevaliers contre les Marinas et abattre les piliers.</div></div>';
 h+='<div class="count hell"><div class="k">Guerre sainte contre Hadès</div><div class="v" data-until="'+HADES_H+'">'+dur(HADES_H-S.gt)+'</div><div class="hint">108 spectres monteront à l’assaut des douze maisons.</div></div>';
 h+='<div class="count ath"><div class="k">Athéna</div><div class="v">Sa réincarnation n’a pas encore été révélée.</div><div class="hint">Le Grand Pope scrute les étoiles chaque nuit.</div></div>';
 h+='</div></section><section class="sec"><div class="sec-h"><h2>Le Sanctuaire restauré</h2></div><p class="hint">Ce que le Grand Pope voit en songe : le Sanctuaire tel qu’il sera quand vous l’aurez relevé.</p><div class="vision">'+SANCT_VIEWS.map(v=>'<figure><img src="'+v.src+'" alt="" loading="lazy" width="832" height="466"><figcaption>'+esc(v.t)+'</figcaption></figure>').join('')+'</div></section>';
 h+='<section class="sec"><div class="sec-h"><h2>Journal du Sanctuaire</h2></div><div class="log">'+S.log.map(e=>'<div><span>Jour '+(Math.floor(e.t/24)+1)+'</span>'+esc(e.m)+'</div>').join('')+'</div></section>';
 return h;
}
export const VIEWS={monde:viewMonde,pope:viewPope,sanctuaire:viewSanctuaire,chevaliers:viewChevaliers,apprentis:viewApprentis,armures:viewArmures,chronique:viewChronique};
// En cas d'erreur d'affichage, on montre un message lisible (à envoyer en capture d'écran) au lieu d'un écran figé.
function errorBox(where,e){console.error(e);return '<div class="banner bad"><b>Erreur d’affichage ('+esc(where)+')</b><br>'+esc(String(e&&e.message||e))+'<br><small>'+esc(String(e&&e.stack||'').split('\n').slice(1,3).join(' · '))+'</small><br>Faites une capture d’écran pour Claude. Les autres onglets restent utilisables.</div>';}
export function render(){
 S._dirty=false;
 try{renderRes();renderTabs();}catch(e){console.error(e);}
 if(!VIEWS[S.tab])S.tab='sanctuaire';
 let html;try{html=VIEWS[S.tab]();}catch(e){html=errorBox('onglet '+S.tab,e);}
 $('#view').innerHTML=html;
 try{mountMap(document.getElementById('mapSlot'));syncAgents();}catch(e){console.error(e);}
 liveUpdate();
 if(modalFn){const sc=$('.sheet-card').scrollTop;let mh;try{mh=modalFn();}catch(e){mh=errorBox('fenêtre',e);}$('#sheetBody').innerHTML=mh;$('.sheet-card').scrollTop=sc;}
}
export function liveUpdate(){
 document.querySelectorAll('[data-res]').forEach(e=>{const r=e.dataset.res;e.textContent=fmt(S.res[r]);e.closest('.res').classList.toggle('full',S.res[r]>=cap(r)-.5);});
 document.querySelectorAll('[data-item]').forEach(e=>e.textContent=fmt(S.items[e.dataset.item]||0));
 document.querySelectorAll('[data-until]').forEach(e=>e.textContent=dur(+e.dataset.until-S.gt));
 document.querySelectorAll('[data-ps]').forEach(e=>{const a=+e.dataset.ps,b=+e.dataset.pe;e.style.width=clamp((S.gt-a)/(b-a)*100,0,100)+'%';});
 document.querySelectorAll('[data-apbar]').forEach(e=>{const a=S.aps.find(x=>x.id==e.dataset.apbar);if(a)e.style.width=clamp(a.xp/need(a.lv)*100,0,100)+'%';});
 document.querySelectorAll('[data-kbar]').forEach(e=>{const k=S.knights.find(x=>x.id==e.dataset.kbar);if(k)e.style.width=clamp(k.xp/(need(k.lv)*1.5)*100,0,100)+'%';});
 document.querySelectorAll('[data-nrg]').forEach(e=>{const p=byId(+e.dataset.nrg);if(p)e.style.width=clamp(p.nrg/emax(p)*100,0,100)+'%';});
 document.querySelectorAll('[data-nrgv]').forEach(e=>{const p=byId(+e.dataset.nrgv);if(p)e.textContent=Math.floor(p.nrg);});
 document.querySelectorAll('[data-craftbar]').forEach(e=>{const q=S.craft[e.dataset.craftbar];if(q&&q.length)e.style.width=clamp(q[0].prog/REC_BY[q[0].k].work*100,0,100)+'%';});
 if(S.forgeJob){document.querySelectorAll('[data-forgebar]').forEach(e=>e.style.width=clamp(S.forgeJob.prog/S.forgeJob.work*100,0,100)+'%');const fr=forgeRate();document.querySelectorAll('[data-forge-eta]').forEach(e=>e.textContent=dur((S.forgeJob.work-S.forgeJob.prog)/fr));}
 document.querySelectorAll('[data-power]').forEach(e=>e.textContent=fmt(sanctPower()));
 document.querySelectorAll('[data-day]').forEach(e=>e.textContent=Math.floor(S.gt/24)+1);
}

/* ---------- fenêtres ---------- */
export let modalFn=null,flash='';
export function openModal(fn){modalFn=fn;flash='';let h;try{h=fn();}catch(e){h=errorBox('fenêtre',e);}$('#sheetBody').innerHTML=h;$('#sheet').hidden=false;$('.sheet-card').scrollTop=0;}
export function closeModal(){modalFn=null;flash='';$('#sheet').hidden=true;}
export function flashHtml(){if(!flash)return '';const f=flash;flash='';return '<div class="flash">'+esc(f)+'</div>';}
export function statsHtml(p,kind){
 const sp=p.sp||0;
 let h='<div class="stats">'+[['fo','Force'],['vi','Vitesse'],['de','Dextérité'],['en','Endurance'],['ps','Psychokin.'],['co','Cosmos']].map(([k,n])=>'<div class="stat"'+tip(k)+'><div class="k">'+n+'</div><div class="v">'+p.st[k]+'</div>'+(sp>0?'<button class="plus" data-act="sp:'+kind+':'+p.id+':'+k+'" aria-label="+1 '+n+'">+</button>':'')+'</div>').join('')+'</div>';
 if(sp>0)h+='<div class="sp-row"><span><b>'+sp+'</b> point'+(sp>1?'s':'')+' de compétence à répartir</span><button class="btn sm ghost" data-act="spauto:'+kind+':'+p.id+'">Répartir automatiquement</button></div>';
 return h;
}
export function persoBlock(p){
 let h='<div class="bio"><div class="bio-h"><span class="chip">'+esc(NATS[p.nat].n)+'</span>'+traitChips(p)+'</div><p>'+p.bio.map(esc).join('<br>')+'</p></div>';
 const line=(T,t,cls)=>'<div class="trait"><b class="'+cls+'">'+T[t.k].n+' '+ROMAN[t.lv]+'</b><span><i>Au Sanctuaire</i> '+T[t.k].d(t.lv)+'</span><span><i>En combat</i> '+T[t.k].c(t.lv)+'</span><span><i>Avec les autres</i> '+T[t.k].s+'</span></div>';
 h+='<details class="dt"><summary>Qualités et défauts</summary><div class="tlist">'+(p.qual||[]).map(t=>line(QUAL,t,'q')).join('')+(p.flaw||[]).map(t=>line(FLAW,t,'f')).join('')+'</div></details>';
 h+=affinityBlock(p);
 return h;
}
// Avec qui ce personnage s'entend, et pourquoi (caractère, racines, histoire).
export function affinityBlock(p){
 const others=people().filter(o=>o.id!==p.id).map(o=>({o,c:compat(p,o)})).filter(x=>x.c.v!==0).sort((a,b)=>b.c.v-a.c.v);
 if(!others.length)return '';
 const row=x=>'<div class="aff '+(x.c.v>0?'pos':'neg')+'"'+tip(x.c.why.join('\n'))+'>'+ptImg(x.o,x.o.rank||null)+'<div><b>'+esc(x.o.name)+'</b><span>'+compatLabel(x.c.v)+'</span><small>'+esc(x.c.why[0].slice(2))+(x.c.why.length>1?' · …':'')+'</small></div></div>';
 const good=others.filter(x=>x.c.v>0).slice(0,4),bad=others.filter(x=>x.c.v<0).slice(-3).reverse();
 return '<details class="dt"><summary>Affinités <span class="aside">'+good.length+' entente'+(good.length>1?'s':'')+(bad.length?' · '+bad.length+' friction'+(bad.length>1?'s':''):'')+'</span></summary><p class="hint">Le caractère, les racines et l’histoire de chacun rapprochent ou éloignent les personnages. Au fil des jours, les amitiés se nouent ou s’effilochent d’elles-mêmes. Touchez un nom pour voir pourquoi.</p><div class="affs">'+good.concat(bad).map(row).join('')+'</div></details>';
}
// Séances d'entraînement : surtout de l'énergie, parfois un objet fabriqué ou du savoir.
export function trainingBlock(p,kind){
 let h='<div class="sec-h"><h2>Entraînement</h2></div><p class="hint">Les séances coûtent de l’énergie. Certaines demandent un objet fabriqué à l’artisanat ou à l’herboristerie.'+(fl(p,'distrait')?' Distrait : '+10*fl(p,'distrait')+' % de risque de séance perdue.':'')+'</p><div class="opts">';
 TRAININGS.forEach(t=>{const ok=canTrain(p,t);const extra=[t.e+' énergie'];if(t.item)extra.push('1 '+ITEMS[t.item].n.toLowerCase()+' (en réserve : '+(S.items[t.item]||0)+', fabriqué par les '+ITEM_TRADE[t.item]+')');if(t.savoir)extra.push(t.savoir(p)+' savoir');
  h+='<button class="opt" data-act="train:'+kind+':'+p.id+':'+t.k+'"'+(ok?'':' disabled')+'><b>'+t.n+'</b><span class="chip">'+t.gain+'</span><span class="d">'+extra.join(' · ')+'</span></button>';});
 return h+'</div>'+pairBlock(p,kind);
}
// S'entraîner à deux : le partenaire doit être disponible et accepter.
export function pairBlock(p,kind){
 const list=pairPartners(p);if(!list.length)return '';
 let h='<details class="dt" open><summary>S’entraîner avec… <span class="aside">'+PAIR_E+' énergie chacun</span></summary><p class="hint">Proposez une séance à deux. Le partenaire doit être disponible, et il peut refuser : ses chances d’accepter dépendent de votre affinité et de son caractère. Un maître accepte toujours avec son propre apprenti. Les deux gagnent de l’entraînement (l’élève un peu plus), et leur amitié grandit.</p><div class="list">';
 list.forEach(q=>{const c=compat(p,q),why=unavailable(q),ch=Math.round(acceptChance(p,q,c.v)*100),ref=refusedRecently(p,q);
  const ok=!why&&!ref&&p.nrg>=PAIR_E;
  h+='<div class="item fr">'+ptImg(q,q.rank||null)+'<div class="main"><div class="name">'+esc(q.name)+' '+(q.rank?rankChip(q.rank):'<span class="chip">Apprenti</span>')+(c.v?' <span class="chip '+(c.v>0?'ok':'f')+'"'+tip(c.why.join('\n'))+'>'+compatLabel(c.v)+'</span>':'')+'</div><div class="meta">'+nrgIcon(q)+'<span class="'+(why||ref?'warn':'ok')+'">'+(why?esc(why):ref?'a refusé tout à l’heure':'disponible · accepte à '+ch+' %')+'</span></div></div><button class="btn sm" data-act="pair:'+kind+':'+p.id+':'+q.id+'"'+(ok?'':' disabled')+'>Proposer</button></div>';});
 return h+'</div></details>';
}
export function selfWork(p,kind){
 let h='<details class="dt"><summary>Travail sur soi</summary><p class="hint">Corriger un défaut coûte 40 d’énergie et un objet préparé à l’herboristerie ou à l’artisanat. Renforcer une qualité coûte 50 d’énergie, un élixir et du savoir. Le succès n’est pas garanti ; la persévérance aide.</p><div class="opts">';
 (p.flaw||[]).forEach(t=>{const F=FLAW[t.k];const ch=Math.round(clamp(.45+.1*ql(p,'perseverant')-.1*(t.lv-1),.1,.9)*100);const ok=p.nrg>=40&&(S.items[F.cure]||0)>=1;
  h+='<button class="opt" data-act="cure:'+kind+':'+p.id+':'+t.k+'"'+(ok?'':' disabled')+'><b>Corriger : '+F.n.toLowerCase()+' '+ROMAN[t.lv]+'</b><span class="chip">'+ch+' %</span><span class="d">40 énergie · 1 '+ITEMS[F.cure].n.toLowerCase()+' (en réserve : '+(S.items[F.cure]||0)+')</span></button>';});
 (p.qual||[]).filter(t=>t.lv<3).forEach(t=>{const sav=30*t.lv;const ch=Math.round(clamp(.4+.05*ql(p,'perseverant'),.1,.9)*100);const ok=p.nrg>=50&&(S.items.elixir||0)>=1&&S.res.savoir>=sav;
  h+='<button class="opt" data-act="boost:'+kind+':'+p.id+':'+t.k+'"'+(ok?'':' disabled')+'><b>Renforcer : '+QUAL[t.k].n.toLowerCase()+' → '+ROMAN[t.lv+1]+'</b><span class="chip">'+ch+' %</span><span class="d">50 énergie · 1 élixir · '+sav+' savoir</span></button>';});
 if(!(p.flaw||[]).length&&!(p.qual||[]).some(t=>t.lv<3))h+='<p class="hint">Rien à travailler pour l’instant.</p>';
 return h+'</div></details>';
}
export function friendBlock(p){
 const fs=friendsOf(p);const fb=friendBonus(p);
 let h='<details class="dt"><summary>Amitiés <span class="aside">+'+Math.round(fb*100)+' % d’XP</span></summary>';
 h+='<p class="hint">Chaque niveau d’amitié donne +1 % d’XP aux deux personnes (+2 % entre un maître et son apprenti), plafonné à 30 %. Points disponibles : <b style="color:var(--gold-hi)">'+S.fp+'</b>.</p><div class="list">';
 people().filter(o=>o.id!==p.id).sort((a,b)=>friendLv(p.id,b.id)-friendLv(p.id,a.id)).forEach(o=>{const lv=friendLv(p.id,o.id);
  const c=compat(p,o);
  h+='<div class="item fr">'+ptImg(o,o.rank||null)+'<div class="main"><div class="name">'+esc(o.name)+(c.v?' <span class="chip '+(c.v>0?'ok':'f')+'"'+tip(c.why.join('\n'))+'>'+compatLabel(c.v)+'</span>':'')+'</div><div class="hearts"'+tip('hearts')+' aria-label="Amitié '+lv+' sur 10">'+'<i class="on"></i>'.repeat(lv)+'<i></i>'.repeat(10-lv)+'</div></div><button class="btn sm ghost" data-act="friend:'+p.id+':'+o.id+'"'+(S.fp<1||lv>=10?' disabled':'')+'>+1</button></div>';});
 return h+'</div></details>';
}
export function itemUse(p,kind){
 let h='';const pot=S.items.potion||0;
 if(pot>0)h+='<button class="btn sm ghost" data-act="potion:'+kind+':'+p.id+'"'+(p.nrg>=emax(p)?' disabled':'')+'>Boire une potion d’endurance (+40) · '+pot+' en réserve</button>';
 if((S.items.ambroisie||0)>0)h+='<button class="btn sm ghost" data-act="ambroisie:'+kind+':'+p.id+'">Goûter l’ambroisie : énergie pleine et 12 h de formation · '+S.items.ambroisie+'</button>';
 return h;
}
export function siteModal(id){return()=>{
 const l=S.b[id],W=WORK[id],cap=siteSlots(id),used=usedSlots(id);
 let h=flashHtml()+'<div><h2 class="mh">'+BUILD[id].n+'</h2>';
 if(id==='forge')h+='<p class="hint">Les forgerons restaurent les armures et progressent en travaillant.</p></div>';
 else if(id==='herbo'||id==='atelier')h+='<p class="hint">Lancez des fabrications ; les '+(id==='herbo'?'herboristes':'artisans')+' affectés ici les réalisent l’une après l’autre. Rythme : '+(craftRate(id)?fmt1(craftRate(id))+' h de travail par heure':'aucun, personne n’y travaille')+'.</p></div>';
 else h+='<p class="hint">Production : <b style="color:var(--marble)">'+(id==='jardin'?fmt1(siteProd(id))+' herbes':fmt(siteProd(id))+' '+RES[W.res].n.toLowerCase())+' / h</b>. Sans personne, le site tourne à 20 %. Chaque travailleur ajoute environ 40 % de la base.</p></div>';
 if(!l)return h+'<div class="empty">Ce site est en ruines. Bâtissez-le d’abord.</div>'+bldBlock(id);
 if(id==='herbo'||id==='atelier'){
  const q=S.craft[id];
  h+='<div class="sec-h"><h2>File de fabrication</h2><span class="aside">'+q.length+' / 6</span></div>';
  if(q.length)h+=q.map((j,i)=>'<div class="job"><div class="h"><span>'+ITEMS[j.k].n+'</span><span>'+(i===0?(craftRate(id)?dur((REC_BY[j.k].work-j.prog)/craftRate(id)):'en pause'):'en attente')+'</span></div>'+(i===0?bar(j.prog/REC_BY[j.k].work*100,'data-craftbar="'+id+'"','green'):'')+'</div>').join('');
  else h+='<p class="hint">Rien en cours.</p>';
  h+='<div class="sec-h"><h2>Recettes</h2></div><div class="opts">';
  RECIPES.filter(r=>r.ws===id&&(!r.lock||cb('U_'+r.lock))).forEach(r=>{const ok=q.length<6&&afford(r.inp);h+='<button class="opt" data-act="craft:'+r.k+'"'+(ok?'':' disabled')+'><b>'+ITEMS[r.k].n+'</b><span class="chip">'+fmt(S.items[r.k]||0)+' en réserve</span><span class="d">'+r.d+'</span><span class="d">'+Object.keys(r.inp).map(k=>r.inp[k]+' '+nameOf(k)+' ('+fmt(have(k))+')').join(' · ')+' · '+r.work+' h de travail</span></button>';});
  h+='</div>';
 }
 if(TOOL_SITES.includes(id)){const tl=S.tools[id]||0;const need=tl+1;h+='<div class="sec-h"><h2>Outillage</h2><span class="aside">niv. '+tl+' / 5 · +'+10*tl+' %</span></div>'+(tl<5?'<div class="btns" style="align-items:center"><button class="btn sm" data-act="tool:'+id+'"'+((S.items.outil||0)>=need?'':' disabled')+'>Améliorer les outils</button><span class="hint">'+need+' outil'+(need>1?'s':'')+' requis · '+(S.items.outil||0)+' en réserve</span></div>':'<p class="hint">Outillage au maximum.</p>');}
 h+='<div class="sec-h"><h2>Au travail</h2><span class="aside">'+used+' / '+cap+' postes</span></div><div class="list">';
 workersAt(id).forEach(w=>{h+='<div class="item">'+workerDot(w)+'<div class="main"><div class="name">'+esc(w.name)+'</div><div class="sub">Villageois · '+esc(NATS[w.nat].n)+' · niveau '+w.skill+'</div></div><button class="btn sm ghost" data-act="wjob:'+w.id+':none">Rappeler</button></div>';});
 apsAt(id).forEach(a=>{h+='<div class="item">'+ptImg(a,null)+'<div class="main"><div class="name">'+esc(a.name)+' <span class="chip">Apprenti</span></div><div class="sub">Formation −50 % · +1 '+STATN[W.stat]+' par jour'+(ql(a,'travailleur')?' · Travailleur':'')+'</div></div><button class="btn sm ghost" data-act="ajob:'+a.id+':none">Rappeler</button></div>';});
 if(!used)h+='<p class="hint" style="padding:10px 0">Personne ici pour l’instant.</p>';
 h+='</div>';
 const idle=S.workers.filter(w=>!w.job);
 h+='<div class="sec-h"><h2>Envoyer un villageois</h2><span class="aside">'+idle.length+' disponible'+(idle.length>1?'s':'')+'</span></div>';
 if(idle.length)h+='<div class="opts">'+idle.map(w=>'<button class="opt" data-act="wjob:'+w.id+':'+id+'"'+(used>=cap?' disabled':'')+'><b>'+esc(w.name)+'</b><span class="chip">niv. '+w.skill+'</span><span class="d">'+esc(NATS[w.nat].n)+'</span></button>').join('')+'</div>';
 else h+='<p class="hint">Aucun villageois libre. Recrutez-en au village des artisans, ou rappelez-en un d’un autre site.</p><button class="btn sm ghost" data-act="site:artisans">Aller au village</button>';
 const free=S.aps.filter(a=>!a.job);
 h+='<div class="sec-h"><h2>Envoyer un apprenti en renfort</h2></div><p class="hint">Il travaille ici et gagne de la '+STATN[W.stat]+', mais se forme deux fois moins vite.</p>';
 if(free.length)h+='<div class="opts">'+free.map(a=>'<button class="opt" data-act="ajob:'+a.id+':'+id+'"'+(used>=cap?' disabled':'')+'><b>'+esc(a.name)+'</b><span class="chip">niv. '+a.lv+'</span><span class="d">'+(ql(a,'travailleur')?'Travailleur : rendement ×'+fmt1(1+.25*ql(a,'travailleur')):'')+'</span></button>').join('')+'</div>';
 else h+='<p class="hint">Aucun apprenti disponible.</p>';
 return h+bldBlock(id);
};}
// Villageois : recruter, voir qui travaille où, affecter d'un toucher ceux qui attendent.
const WORK_SITES=['champs','carriere','mine','biblio','jardin','herbo','atelier','forge'];
function freeSites(){return WORK_SITES.filter(id=>S.b[id]>0&&usedSlots(id)<siteSlots(id));}
export function villagersSection(){
 const c=workerCost(),capV=villageCap(S.b.artisans),full=S.workers.length>=capV,idle=S.workers.filter(w=>!w.job),fs=freeSites();
 let h='<section class="sec"><div class="sec-h"><h2>Villageois</h2><span class="aside">'+S.workers.length+' / '+capV+'</span></div>';
 h+='<p class="hint">Les villageois de Rodorio produisent les ressources et font tourner les ateliers. Chacun mange 1 vivre par heure. Pour en accueillir plus, agrandissez le village des artisans.</p>';
 h+='<div class="btns" style="align-items:center"><button class="btn sm" data-act="hire"'+(full||!afford(c)?' disabled':'')+'>'+(full?'Village plein':'Recruter un villageois')+'</button>'+(full?'<button class="btn sm ghost" data-act="site:artisans">Agrandir le village</button>':costHtml(c))+'</div>';
 const by=WORK_SITES.filter(id=>workersAt(id).length).map(id=>'<span class="chip">'+SITES[id].n+' : '+workersAt(id).length+'</span>').join('');
 if(by)h+='<div class="inv">'+by+'</div>';
 if(idle.length){h+='<div class="list">';idle.forEach(w=>{h+='<div class="item vrow">'+workerDot(w)+'<div class="main"><div class="name">'+esc(w.name)+' <span class="chip warn">sans affectation</span></div><div class="vsites">'+(fs.length?fs.map(id=>'<button class="btn sm ghost" data-act="wjob:'+w.id+':'+id+'">'+SITES[id].n+'</button>').join(''):'<span class="hint">Aucun poste libre : bâtissez ou agrandissez un site.</span>')+'</div></div></div>';});h+='</div>';}
 else h+='<p class="hint">Tout le monde est au travail. Pour déplacer quelqu’un, touchez son site sur la carte.</p>';
 return h+'</section>';
}
export function workerDot(w){const L=looks(w);return '<span class="wdot" style="--sk:'+L.skin+';--hr:'+L.hair+'" aria-hidden="true"></span>';}
export function villageModal(){
 const c=workerCost(),capV=villageCap(S.b.artisans),full=S.workers.length>=capV;
 let h='<div><h2 class="mh">Village des artisans</h2><p class="hint">Les villageois de Rodorio montent travailler au Sanctuaire. Chacun mange 1 vivre par heure.</p></div>';
 h+='<div class="btns" style="align-items:center"><button class="btn" data-act="hire"'+(full||!afford(c)?' disabled':'')+'>'+(full?'Village plein':'Recruter un villageois')+'</button>'+(full?'':costHtml(c))+'</div>';
 h+='<div class="sec-h"><h2>Villageois</h2><span class="aside">'+S.workers.length+' / '+capV+'</span></div><div class="list">';
 S.workers.forEach(w=>{h+='<div class="item">'+workerDot(w)+'<div class="main"><div class="name">'+esc(w.name)+'</div><div class="sub">'+esc(NATS[w.nat].n)+' · niveau '+w.skill+' · '+(w.job?SITES[w.job].n:'<span style="color:var(--warn)">sans affectation</span>')+'</div></div>'+(w.job?'<button class="btn sm ghost" data-act="wjob:'+w.id+':none">Rappeler</button>':'')+'</div>';});
 return h+'</div>'+bldBlock('artisans');
}
export function housesModal(){
 let h='<div><h2 class="mh">Les douze maisons</h2><p class="hint">Du Bélier aux Poissons, l’escalier monte jusqu’au palais du Pope. Chaque niveau accélère de 10 % la formation des apprentis du signe.</p></div><div class="list">';
 const full=S.jobs.length>=slotsFor(S.b.artisans);
 SIGNS.forEach((s,i)=>{const l=S.houses[i],busy=S.jobs.some(j=>j.b==='h'+i),c=houseCost(i);const guard=S.knights.find(k=>k.rank==='or'&&k.sign===i);const ok=!busy&&!full&&l<HOUSE_MAX&&afford(c);
  h+='<div class="bld"><div class="t"><b><span class="sign" style="color:var(--gold-hi)">'+s.s+'</span> Maison '+de(s.n)+'</b><span class="lv">'+(l?'niv. '+l:'ruines')+'</span></div><div class="eff">'+(guard?'Gardée par '+esc(guard.name):'Sans gardien')+' · formation '+s.n+' +'+10*l+' %</div>'+(l<HOUSE_MAX?costHtml(c):'<div class="cost"><span>Niveau maximal</span></div>')+'<div class="act">'+(l<HOUSE_MAX?'<button class="btn sm" data-act="house:'+i+'"'+(ok?'':' disabled')+'>'+(busy?'En cours':full?'Chantiers pleins':l?'Améliorer':'Relever')+'</button><span class="time">'+dur(houseTime(i))+'</span>':'')+'</div></div>';});
 return h+'</div>';
}
export function armorModal(key){return()=>{const c=CONS_BY[key];if(!c)return '';const s=S.armors[c.k];const img=armorImg(c.k);
 const intro={or:'Seul un natif '+de(SIGNS[c.sign||0].n)+' peut prétendre à cette armure.',argent:'Une armure d’argent, pour un apprenti de niveau '+TRIAL_LV.argent+' au moins.',bronze:'Une armure de bronze, la première marche des chevaliers.'}[c.rank];
 let h='<div><h2 class="mh">'+esc(armorName(c))+'</h2><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">'+rankChip(c.rank)+'<span class="chip el-'+c.el+'">'+ELEM[c.el]+'</span>'+armorState(c)+'</div></div>';
 if(img)h+='<figure class="fullbody"><img class="'+(s==='brisee'?'broken':'')+'" src="'+img+'" alt="" width="400" height="600">'+(s==='brisee'?'<figcaption>Telle qu’elle sera une fois restaurée. Pour l’instant, elle gît en morceaux.</figcaption>':'')+'</figure>';
 h+='<p class="hint">'+intro+'</p>';
 if(s==='brisee')h+='<button class="btn ghost" data-act="tab:armures">Retour à l’atelier des armures</button>';
 return h;};}
export function knightModal(id){return()=>{const k=S.knights.find(x=>x.id===id);if(!k)return '<p>Ce chevalier n’est plus là.</p>';const c=CONS_BY[k.cons];const aps=S.aps.filter(a=>a.master===k.id);
 let h=flashHtml()+'<div class="sheet-head">'+ptImg(k,k.rank,true)+'<div class="main"><h2>'+esc(k.name)+'</h2><div style="display:flex;flex-wrap:wrap;gap:6px">'+rankChip(k.rank)+signChip(k.sign)+sexChip(k)+'</div><div class="hint">'+armorName(c)+' · '+(k.origin==='survivant'?'survivant'+G(k,'e')+' de la guerre sainte':'formé'+G(k,'e')+' au Sanctuaire')+'</div></div></div>';
 // Le personnage en pied, dessiné par le générateur, vêtu de son armure.
 h+='<figure class="fullbody"><img src="'+fullBody(k,k.rank)+'" alt="'+esc(k.name)+' en '+esc(armorLow(c))+'" width="300" height="675"><figcaption>'+esc(armorName(c))+'</figcaption></figure>';
 h+=persoBlock(k);
 h+='<div style="display:grid;gap:6px"><div class="hint">Niveau <b style="color:var(--marble)">'+k.lv+'</b> · cosmos '+cosmosLabel(k.st.co).toLowerCase()+' · puissance '+fmt(power(k,k.rank))+'</div>'+bar(k.xp/(need(k.lv)*1.5)*100,'data-kbar="'+k.id+'"')+nrgBar(k)+'</div>'+statsHtml(k,'k');
 h+=itemUse(k,'k');
 h+='<div class="hint">Techniques : '+(k.tech.length?k.tech.map(esc).join(' · '):'aucune')+'</div>';
 h+=planBlock(k,'k')+progBlock(k,'k')+trainingBlock(k,'k')+selfWork(k,'k')+friendBlock(k);
 h+='<div class="sec-h"><h2>Métier</h2></div><div class="opts">';
 h+='<button class="opt'+(k.role===null?' sel':'')+'" data-act="role:'+k.id+':none"><b>Aucun métier</b><span class="d">Tout son temps va à ses disciples et à son entraînement.</span></button>';
 const p=pope();
 Object.entries(ROLES).forEach(([rk,R])=>{const taken=rk==='pope'&&p&&p.id!==k.id;h+='<button class="opt'+(k.role===rk?' sel':'')+'" data-act="role:'+k.id+':'+rk+'"'+(taken?' disabled':'')+'><b>'+R.n+'</b><span class="d">'+R.d+(taken?' Déjà confié à '+esc(p.name)+'.':'')+'</span></button>';});
 h+='</div>';
 const nx=NEXT_RANK[k.rank];
 if(nx){h+='<div class="sec-h"><h2>Promotion</h2></div><p class="hint">Un chevalier très doué peut passer l’épreuve d’une armure '+(nx==='or'?'d’or (de sa maison seulement)':'d’argent')+' dès le niveau '+TRIAL_LV[nx]+'. Son armure actuelle redevient libre pour un autre.</p>';
  if(k.cd>S.gt)h+='<p class="hint">'+esc(k.name)+' se remet de sa dernière épreuve. Nouvel essai dans <b data-until="'+k.cd+'">'+dur(k.cd-S.gt)+'</b>.</p>';
  else if(k.lv>=TRIAL_LV[nx])h+='<button class="btn" data-act="trialOpen:'+k.id+'">Tenter une promotion</button>';
  h+=foreseen(k,nx);}
 if(isMaster(k)||aps.length){h+='<div class="sec-h"><h2>Ses disciples</h2><span class="aside">'+aps.length+' / 3</span></div>'+(aps.length?'<div class="list">'+aps.map(a=>{const af=affinity(a,k);return '<div class="item tap" data-act="ap:'+a.id+'">'+ptImg(a,null)+'<div class="main"><div class="name">'+esc(a.name)+'</div><div class="sub">Niv. '+a.lv+(af.t?' · '+af.t:'')+'</div></div><div></div></div>';}).join('')+'</div>':'<p class="hint">Aucun pour l’instant. Ouvrez la fiche d’un apprenti pour le confier à '+esc(k.name)+'.</p>');}
 return h;};}
export function apModal(id){return()=>{const a=S.aps.find(x=>x.id===id);if(!a)return '<p>Cet apprenti n’est plus là.</p>';const rate=xpRate(a);
 let h=flashHtml()+'<div class="sheet-head">'+ptImg(a,null,true)+'<div class="main"><h2>'+esc(a.name)+'</h2><div style="display:flex;flex-wrap:wrap;gap:6px">'+signChip(a.sign)+sexChip(a)+'<span class="chip">'+a.age+' ans</span><span class="chip '+(a.imp==='Exceptionnel'?'or':a.imp==='Prometteur'?'argent':'')+'">'+a.imp+(cb('REVEAL')?' · potentiel '+a.pot:'')+'</span></div><div class="hint">Cosmos '+cosmosLabel(a.st.co).toLowerCase()+(a.awk?'':' · pas encore éveillé (niv. 5)')+'</div></div></div>';
 h+=persoBlock(a);
 h+='<div style="display:grid;gap:6px"><div class="hint">Niveau <b style="color:var(--marble)" data-aplv="'+a.id+'">'+a.lv+'</b> · '+fmt(rate)+' XP / h'+(friendBonus(a)?' · amitiés +'+Math.round(friendBonus(a)*100)+' %':'')+(S.houses[a.sign]?' · maison +'+10*S.houses[a.sign]+' %':'')+'</div>'+bar(a.xp/need(a.lv)*100,'data-apbar="'+a.id+'"')+nrgBar(a)+'</div>'+statsHtml(a,'a');
 h+=itemUse(a,'a');
 if(a.cd>S.gt&&(S.items.onguent||0)>0)h+='<button class="btn sm ghost" data-act="onguent:'+a.id+'">Appliquer un onguent : fin du repos · '+S.items.onguent+' en réserve</button>';
 h+='<div class="hint">Techniques : '+(a.tech.length?a.tech.map(esc).join(' · '):'aucune (première au niveau 10)')+'</div>';
 if(a.job)h+='<div class="banner info">En renfort à : '+SITES[a.job].n.toLowerCase()+'. Réglez son temps ci-dessous. <button class="btn sm ghost" data-act="ajob:'+a.id+':none" style="margin-left:6px">Rappeler</button></div>';
 h+=planBlock(a,'a')+progBlock(a,'a')+trainingBlock(a,'a')+selfWork(a,'a')+friendBlock(a);
 h+='<div class="sec-h"><h2>Maître</h2></div><div class="opts">';
 const masters=S.knights;
 h+='<p class="hint">Tout chevalier peut former jusqu’à 3 disciples, selon le temps qu’il leur consacre (sa fiche, « Emploi du temps »).</p>';
 masters.forEach(k=>{const n=S.aps.filter(x=>x.master===k.id).length;const af=affinity(a,k);const full=n>=3&&a.master!==k.id;
  h+='<button class="opt'+(a.master===k.id?' sel':'')+'" data-act="assign:'+a.id+':'+k.id+'"'+(full?' disabled':'')+'><b>'+esc(k.name)+' <span class="sign">'+SIGNS[k.sign].s+'</span></b><span class="chip '+k.rank+'">'+RANKS[k.rank]+'</span><span class="d">'+n+' / 3 apprentis · '+plan(k).dis+' % de son temps'+(af.t?' · <span style="color:var(--gold-hi)">'+af.t+' (×'+af.x+')</span>':'')+'</span></button>';});
 if(a.master)h+='<button class="btn sm ghost" data-act="assign:'+a.id+':none">Retirer du maître</button>';
 h+='</div><div class="sec-h"><h2>Épreuve de l’armure</h2></div>';
 if(a.cd>S.gt)h+='<p class="hint">'+esc(a.name)+' se remet de sa dernière épreuve. Nouvel essai dans <b data-until="'+a.cd+'">'+dur(a.cd-S.gt)+'</b>.</p>';
 else if(a.lv<TRIAL_LV.bronze)h+='<p class="hint">Dès le niveau '+TRIAL_LV.bronze+', '+esc(a.name)+' pourra tenter d’obtenir une armure restaurée.</p>';
 else h+='<button class="btn" data-act="trialOpen:'+a.id+'">Choisir une armure</button>';
 h+='<p class="hint">Armures pressenties pour '+esc(a.name)+' : l’affinité vient de son élément, des compétences qu’'+(a.sex==='F'?'elle':'il')+' a travaillées et de ses maîtres. Restaurez celle qui l’attire le plus.</p>'+foreseen(a);
 if(a.lv>=8){h+='<div class="sec-h"><h2>Devenir garde</h2></div><p class="hint">Si '+esc(a.name)+' a raté son épreuve ou qu’un autre est plus prometteur, il peut servir comme garde : il quitte les apprentis, garde ses stats et défendra une maison, le village ou un site.</p>'+(guardArm===a.id?'<div class="btns"><button class="btn sm danger" data-act="mkguard:'+a.id+'">Confirmer : '+esc(a.name)+' devient garde</button><button class="btn sm ghost" data-act="guardCancel">Annuler</button></div>':'<button class="btn sm ghost" data-act="guardArm:'+a.id+'">Faire de '+esc(a.name)+' un garde</button>');}
 return h;};}
export let lastTrial=null;
export function trialModal(id){return()=>{const a=S.aps.find(x=>x.id===id)||S.knights.find(x=>x.id===id);
 if(lastTrial&&lastTrial.id===id){const t=lastTrial;return '<div class="result '+(t.win?'win':'lose')+'"><h3>'+(t.win?'L’armure a choisi '+esc(t.name):'L’armure reste muette')+'</h3><p class="hint">'+(t.win?esc(t.name)+' devient chevalier de '+RANKS[t.rank].toLowerCase()+' '+esc(de(t.cons))+'. Retrouvez-'+(t.sex==='F'?'la':'le')+' dans l’onglet Chevaliers.':esc(t.name)+' a échoué cette fois et doit se reposer '+t.cd+' h. Un onguent peut abréger ce repos.')+'</p></div><button class="btn" data-act="close">Continuer</button>';}
 if(!a)return '<p>Ce personnage n’est plus là.</p>';
 const kn=S.knights.includes(a);
 const avail=CONS.filter(c=>S.armors[c.k]==='restauree'&&(!kn||c.rank===NEXT_RANK[a.rank])).sort((x,y)=>armorAffinity(a,y).v-armorAffinity(a,x).v);
 let h='<div class="sheet-head">'+ptImg(a,kn?a.rank:null)+'<div class="main"><h2>Épreuve de '+esc(a.name)+'</h2><div class="hint">Niveau '+a.lv+' · '+signChip(a.sign)+'</div></div></div>';
 if(!avail.length)return h+'<div class="empty">Aucune armure restaurée n’attend de porteur. Restaurez-en une à l’Atelier des armures.</div>';
 h+='<p class="hint">Une armure n’accepte que ceux avec qui elle a une affinité : l’élément du signe, les compétences travaillées et les maîtres qui les ont formés. L’argent et l’or exigent des personnages très doués. Le caractère compte aussi.</p><div class="opts">';
 avail.forEach(c=>{const e=trialEval(a,c),af=e.af||armorAffinity(a,c);h+='<button class="opt" data-act="trial:'+a.id+':'+c.k+'"'+(e.ok?'':' disabled')+'><b>'+armorName(c)+'</b><span class="chip '+c.rank+'">'+(e.ok?Math.round(e.ch*100)+' %':RANKS[c.rank])+'</span><span class="d">'+affHtml(af)+(e.ok?'':'<br>'+esc(e.why))+'</span></button>';});
 return h+'</div>';};}
export function absenceModal(dt,before,sum){return()=>{
 let h='<div><h2 class="mh">Pendant votre absence</h2><p class="hint">'+dur(dt)+' se sont écoulées au Sanctuaire.</p></div>';
 h+='<div class="stats">'+RKEYS.map(r=>{const d=S.res[r]-before[r];return '<div class="stat"><div class="k">'+RES[r].n+'</div><div class="v" style="color:'+(d>=0?'var(--ok)':'var(--bad)')+'">'+(d>=0?'+':'')+fmt(d)+'</div></div>';}).join('')+'</div>';
 const made=Object.keys(sum.made);if(made.length)h+='<div class="hint">Fabriqué : '+made.map(k=>sum.made[k]+' × '+ITEMS[k].n.toLowerCase()).join(' · ')+'</div>';
 const lvs=Object.entries(sum.lv);
 if(lvs.length)h+='<div class="hint">'+lvs.map(([id,n])=>{const a=S.aps.find(x=>x.id==id);return a?esc(a.name)+' +'+n+' niv.':'';}).filter(Boolean).join(' · ')+'</div>';
 const pts=people().filter(p=>p.sp>0);if(pts.length)h+='<div class="banner info">'+pts.length+' personnage'+(pts.length>1?'s ont':' a')+' des points de compétence à répartir (pastilles « pts » dans les listes).</div>';
 if(sum.ev.length)h+='<div class="log">'+sum.ev.slice(0,30).map(m=>'<div style="grid-template-columns:1fr">'+esc(m)+'</div>').join('')+'</div>';
 if(RKEYS.some(r=>S.res[r]>=cap(r)-.5))h+='<div class="banner">Certaines réserves sont pleines. Agrandissez les Réserves pour ne rien perdre la prochaine fois.</div>';
 return h+'<button class="btn" data-act="close">Reprendre</button>';};}
export let resetArmed=false,ioMsg='';
export function settingsModal(){
 let h='<div><h2 class="mh">Réglages</h2><p class="hint">'+(typeof __APP_VERSION__!=='undefined'?__APP_VERSION__:'développement')+' · partie commencée il y a '+dur((Date.now()-S.created)/36e5)+' (temps réel).</p></div>';
 const sp=soundPrefs();const vol=(k,n)=>'<label class="vol"><span>'+n+'</span><input type="range" min="0" max="100" step="5" value="'+Math.round(sp[k]*100)+'" data-vol="'+k+'"></label>';
 h+='<div class="sec"><div class="sec-h"><h2>Son</h2></div><div class="btns"><button class="btn sm'+(sp.on?'':' ghost')+'" data-act="sound:on">Son activé</button><button class="btn sm'+(sp.on?' ghost':'')+'" data-act="sound:off">Silence</button></div>'+vol('amb','Ambiance (vent, cigales, grillons)')+vol('sfx','Bruitages')+'</div>';
 h+='<div class="sec"><div class="sec-h"><h2>Vitesse du temps</h2></div><p class="hint">Le mode test accélère tout par 60 (1 minute = 1 heure de jeu) pour juger l’équilibrage. Revenez au temps normal pour jouer.</p><div class="btns"><button class="btn sm'+(S.speed===1?'':' ghost')+'" data-act="speed:1">Temps normal</button><button class="btn sm'+(S.speed===60?'':' ghost')+'" data-act="speed:60">Mode test ×60</button></div></div>';
 h+='<div class="sec"><div class="sec-h"><h2>Sauvegarde</h2></div><p class="hint">La partie est enregistrée dans ce navigateur. Copiez régulièrement le code ci-dessous et gardez-le dans une note : il permet de restaurer la partie si les données de Chrome sont effacées.</p><textarea id="saveIo" aria-label="Code de sauvegarde" spellcheck="false"></textarea><div class="btns"><button class="btn sm" data-act="exportSave">Générer et copier le code</button><button class="btn sm ghost" data-act="importSave">Charger le code collé</button></div>'+(ioMsg?'<p class="hint" style="color:var(--gold-hi)">'+esc(ioMsg)+'</p>':'')+'</div>';
 h+='<div class="sec"><div class="sec-h"><h2>Nouvelle partie</h2></div>'+(resetArmed?'<div class="banner bad">Toute la progression sera perdue. Confirmez-vous ?</div><div class="btns"><button class="btn sm danger" data-act="resetGo">Oui, tout recommencer</button><button class="btn sm ghost" data-act="resetCancel">Annuler</button></div>':'<button class="btn sm ghost" data-act="resetArm">Recommencer une partie</button>')+'</div>';
 return h;
}

/* ---------- actions ---------- */
export function getP(kind,id){return kind==='k'?S.knights.find(q=>q.id===id):kind==='g'?(S.guards||[]).find(q=>q.id===id):S.aps.find(q=>q.id===id);}
// Un seul écouteur pour tous les boutons (attribut data-act), et un toucher hors de la fenêtre la ferme.
export function installClicks(){
 document.addEventListener('input',e=>{const d=e.target.dataset||{};if(d.vol)setSound({[d.vol]:+e.target.value/100});if(d.plan)onPlanInput(e.target,false);if(d.prog)onProgInput(e.target,false);});
 document.addEventListener('change',e=>{const d=e.target.dataset||{};if(d.vol==='sfx')sfx('confirm');if(d.plan)onPlanInput(e.target,true);if(d.prog)onProgInput(e.target,true);});
 document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(t&&!t.disabled){actWithSound(t.dataset.act);return;}if(e.target.id==='sheet'){sfx('close');lastTrial=null;closeModal();render();}});}
// Le bruitage qui accompagne chaque action du joueur.
const ACT_SOUND={tab:'tap',close:'close',dclose:'close',site:'open',knight:'open',ap:'open',guard:'open',armor:'open',houses:'open',settings:'open',trialOpen:'open',
 build:'build',house:'build',restore:'build',hire:'pay',craft:'pay',tool:'build',dtake:'card',dend:'turn',dboost:'pay',
 role:'confirm',assign:'confirm',accept:'confirm',post:'confirm',friend:'confirm',sp:'tap',spauto:'confirm',wjob:'confirm',ajob:'confirm',
 train:'study',pair:'confirm',duo:'confirm',potion:'confirm',ambroisie:'confirm',onguent:'confirm',huile:'confirm',cure:'confirm',boost:'confirm',claim:'milestone',dstart:'turn',dopen:'open',loadout:'confirm',event:'open',go:'turn',scene:'open',home:'open'};
function actWithSound(a){
 const k=a.split(':')[0],wasOver=!!(S.match&&S.match.over);
 if(k!=='trial'&&k!=='sound')sfx(ACT_SOUND[k]||'tap');
 act(a);
 if(k==='trial'&&lastTrial)sfx(lastTrial.win?'win':'lose');
 if(S.match&&S.match.over&&!wasOver)sfx(S.match.result==='win'?'win':'lose');
}
export function onMapTap(h){if(h.type==='pope')act('tab:pope');else if(h.type==='houses')openModal(housesModal);else openSite(h.id);}
export let guardArm=null,forfeitArm=false;
export function act(a){
 const [k,x,y,z]=a.split(':');
 switch(k){
 case'tab':S.tab=x;closeModal();render();window.scrollTo(0,0);return;
 case'close':lastTrial=null;closeModal();render();return;
 case'site':openSite(x);return;
 case'houses':openModal(housesModal);return;
 case'afilter':armorFilter=x;render();return;
 case'build':{const c=costOf(x);if(!afford(c)||S.jobs.length>=slotsFor(S.b.artisans)||S.jobs.some(j=>j.b===x))return;pay(c);S.jobs.push({b:x,start:S.gt,end:S.gt+timeOf(x),lvl:S.b[x]+1});log('Chantier lancé : '+BUILD[x].n+' (niveau '+(S.b[x]+1)+').');break;}
 case'house':{const i=+x,c=houseCost(i);if(S.houses[i]>=HOUSE_MAX||!afford(c)||S.jobs.length>=slotsFor(S.b.artisans)||S.jobs.some(j=>j.b==='h'+i))return;pay(c);S.jobs.push({b:'h'+i,start:S.gt,end:S.gt+houseTime(i),lvl:S.houses[i]+1});log('Chantier lancé : maison '+de(SIGNS[i].n)+' (niveau '+(S.houses[i]+1)+').');break;}
 case'hire':{const c=workerCost();if(S.workers.length>=villageCap(S.b.artisans)||!afford(c))return;pay(c);const w=makeWorker(null);S.workers.push(w);log(w.name+' arrive du village pour travailler au Sanctuaire.');break;}
 case'wjob':{const w=S.workers.find(q=>q.id===+x);if(!w)return;if(y==='none'){w.job=null;break;}if(usedSlots(y)>=siteSlots(y))return;if(w.job!==y)w.sxp=0;w.job=y;break;}
 case'ajob':{const ap=S.aps.find(q=>q.id===+x);if(!ap)return;if(y==='none'){ap.job=null;break;}if(usedSlots(y)>=siteSlots(y))return;ap.job=y;ap.wacc=0;break;}
 case'craft':{const r=REC_BY[x];if(!r||S.craft[r.ws].length>=6||!afford(r.inp))return;pay(r.inp);S.craft[r.ws].push({k:x,prog:0});break;}
 case'tool':{const tl=S.tools[x]||0;if(tl>=5||(S.items.outil||0)<tl+1)return;S.items.outil-=tl+1;S.tools[x]=tl+1;log('Les outils '+de(BUILD[x].n.split(' ')[0]).replace('du Oliveraies','des oliveraies')+' passent au niveau '+(tl+1)+'.');flash='Outillage amélioré : +'+10*(tl+1)+' % de production.';break;}
 case'knight':openModal(knightModal(+x));return;
 case'event':openModal(eventModal(+x));return;
 case'go':{if(!startExpedition(+x,+y))return;closeModal();save();render();openScene();return;}
 case'scene':closeModal();openScene();return;
 case'home':{if(!startHomeScene())return;save();render();openScene();return;}
 case'armor':openModal(armorModal(x));return;
 case'guard':openModal(guardModal(+x));return;
 case'dstart':{if(!pope())return;if(!startDuel(S.duel.loadout))return;save();render();openDuel();return;}
 case'dopen':openDuel();return;
 case'loadout':{ensureDuel();const lo=S.duel.loadout;if(lo.includes(x))S.duel.loadout=lo.filter(i=>i!==x);else if(lo.length<3&&S.relics.includes(x))lo.push(x);break;}
 case'guardArm':guardArm=+x;break;
 case'guardCancel':guardArm=null;break;
 case'mkguard':{const ap=S.aps.find(q=>q.id===+x);if(!ap||ap.lv<8)return;S.aps.splice(S.aps.indexOf(ap),1);const gd=makeGuardFrom(ap);S.guards.push(gd);guardArm=null;log(ap.name+' prête serment et devient garde du Sanctuaire.');save();closeModal();openModal(guardModal(gd.id));flash=gd.name+' est désormais garde. Choisissez son poste ci-dessous.';render();return;}
 case'post':{const gd=(S.guards||[]).find(q=>q.id===+x);if(!gd)return;gd.post=y;flash=gd.name+' prend son poste : '+postName(y)+'.';break;}
 case'claim':{const ar=ART_BY[x];if(!ar||(S.artefacts||[]).includes(x)||!artReady(ar))return;S.artefacts.push(x);recomputeCB();log('★ Le Sanctuaire reçoit un artefact : '+ar.n+'.');break;}
 case'ambroisie':{const p=getP(x,+y);if(!p||(S.items.ambroisie||0)<1)return;S.items.ambroisie--;p.nrg=emax(p);if(S.aps.includes(p)){p.xp+=xpRate(p)*12;let g=0;while(p.xp>=need(p.lv)&&g++<50)levelUpAp(p,null);}else if(S.knights.includes(p))p.xp+=knightRate(p)*12;else p.xp+=guardRate(p)*12;flash=p.name+' goûte l’ambroisie.';break;}
 case'huile':{if(!S.forgeJob||(S.items.huile||0)<1)return;S.items.huile--;S.forgeJob.prog=Math.min(S.forgeJob.work,S.forgeJob.prog+S.forgeJob.work*.5);break;}
 case'ap':openModal(apModal(+x));return;
 case'sp':{const p=getP(x,+y);if(!p||!(p.sp>0)||!STATN[z])return;p.sp--;p.st[z]++;break;}
 case'spauto':{const p=getP(x,+y);if(!p)return;while(p.sp>0){const ks=['fo','vi','de','en','ps','co'];let m=ks[0];ks.forEach(s=>{if(p.st[s]<p.st[m])m=s;});p.st[m]++;p.sp--;}break;}
 case'potion':{const p=getP(x,+y);if(!p||(S.items.potion||0)<1)return;S.items.potion--;p.nrg=Math.min(emax(p),p.nrg+40);flash=p.name+' boit une potion d’endurance.';break;}
 case'onguent':{const ap=S.aps.find(q=>q.id===+x);if(!ap||(S.items.onguent||0)<1)return;S.items.onguent--;ap.cd=S.gt;flash='Les blessures de '+ap.name+' sont soignées. Nouvelle épreuve possible.';break;}
 case'cure':{const p=getP(x,+y);if(!p)return;const t=(p.flaw||[]).find(f=>f.k===z);if(!t)return;const F=FLAW[z];if(p.nrg<40||(S.items[F.cure]||0)<1)return;p.nrg-=40;S.items[F.cure]--;
  const ch=clamp(.45+.1*ql(p,'perseverant')-.1*(t.lv-1),.1,.9);
  if(Math.random()<ch){t.lv--;if(t.lv<=0){p.flaw=p.flaw.filter(f=>f!==t);flash=p.name+' n’est plus '+F.n.toLowerCase()+' !';log(flash);}else flash=p.name+' progresse : '+F.n.toLowerCase()+' '+ROMAN[t.lv]+'.';}
  else flash=p.name+' n’y arrive pas cette fois. L’énergie et l’objet sont perdus.';break;}
 case'boost':{const p=getP(x,+y);if(!p)return;const t=(p.qual||[]).find(q=>q.k===z);if(!t||t.lv>=3)return;const sav=30*t.lv;if(p.nrg<50||(S.items.elixir||0)<1||S.res.savoir<sav)return;p.nrg-=50;S.items.elixir--;S.res.savoir-=sav;
  if(Math.random()<clamp(.4+.05*ql(p,'perseverant'),.1,.9)){t.lv++;flash=p.name+' : '+QUAL[z].n.toLowerCase()+' '+ROMAN[t.lv]+' !';log(flash);}else flash='Pas de progrès cette fois pour '+p.name+'.';break;}
 case'friend':{const a1=byId(+x),b1=byId(+y);if(!a1||!b1||S.fp<1)return;const fk=fkey(a1.id,b1.id);if((S.friend[fk]||0)>=10)return;S.fp--;S.friend[fk]=(S.friend[fk]||0)+1;break;}
 case'duo':{const ap=S.aps.find(q=>q.id===+x),kn=S.knights.find(q=>q.id===+y);if(!ap||!kn||ap.nrg<DUO_E||kn.nrg<DUO_E)return;ap.nrg-=DUO_E;kn.nrg-=DUO_E;
  const rate=10*arena()*(1+kn.lv/40+({or:.5,argent:.25,bronze:0})[kn.rank])*affinity(ap,kn).x*(1+friendBonus(ap))*(1-.06*fl(ap,'paresseux'));
  ap.xp+=rate*8;let g=0;while(ap.xp>=need(ap.lv)&&g++<50)levelUpAp(ap,null);
  const fk=fkey(ap.id,kn.id);S.friend[fk]=Math.min(10,(S.friend[fk]||0)+1);
  flash=kn.name+' entraîne '+ap.name+' : +'+fmt(rate*8)+' XP, amitié '+S.friend[fk]+'/10.';
  const teach=kn.qual.filter(t=>!ql(ap,t.k));if(teach.length&&ap.qual.length<3&&Math.random()<.15){const t=teach[Math.floor(Math.random()*teach.length)];ap.qual.push({k:t.k,lv:1});flash+=' '+ap.name+' apprend à être '+QUAL[t.k].n.toLowerCase()+' !';log(kn.name+' transmet sa qualité ('+QUAL[t.k].n.toLowerCase()+') à '+ap.name+'.');}
  break;}
 case'assign':{const ap=S.aps.find(q=>q.id===+x);if(!ap)return;if(y==='none'){ap.master=null;break;}const kn=S.knights.find(q=>q.id===+y);if(!kn)return;if(S.aps.filter(q=>q.master===kn.id).length>=3&&ap.master!==kn.id)return;ap.master=kn.id;ap.mentors=[...new Set((ap.mentors||[]).concat([kn.id]))];
  if(!plan(kn).dis){setShare(kn,'dis',30,planLocked(kn,'k'));flash=kn.name+' consacre désormais 30 % de son temps à ses disciples (réglable sur sa fiche).';}break;}
 case'role':{const kn=S.knights.find(q=>q.id===+x);if(!kn)return;const nr=y==='none'?null:y;if(nr==='pope'&&pope()&&pope().id!==kn.id)return;
  if(nr==='recruteur'&&kn.role!=='recruteur'&&!knightsWith('recruteur').length)S.recruitAcc=0;
  if(nr==='biblio'&&!(S.b.biblio>0)){flash='Il faut d’abord bâtir la bibliothèque.';break;}
  const was=kn.role;plan(kn);kn.role=nr;
  if(!nr)setShare(kn,'job',0);else if(!was||!kn.tm.job)setShare(kn,'job',50);
  if(nr)log(kn.name+' devient '+ROLES[nr].n+'.');break;}
 case'accept':{const i=+x,ap=S.pending[i];if(!ap||S.aps.length>=capacity())return;S.pending.splice(i,1);S.aps.push(ap);log(ap.name+' rejoint le Sanctuaire comme apprenti'+G(ap,'e')+'.');break;}
 case'dismiss':{const ap=S.pending.splice(+x,1)[0];if(ap)log(ap.name+' est reconduit'+G(ap,'e')+' chez sa famille.');break;}
 case'pair':{const p=getP(x,+y),q=byId(+z);if(!p||!q)return;const r=trainTogether(p,q,compat(p,q).v);flash=r.msg;if(r.ok)log(r.msg);break;}
 case'progdef':{const p=getP(x,+y);if(!p)return;p.tr=Object.assign({},PROG_DEF);flash='Programme rééquilibré.';break;}
 case'train':{const p=getP(x,+y);if(!p)return;const m=train(p,z);if(!m)return;flash=m;break;}
 case'trialOpen':lastTrial=null;openModal(trialModal(+x));return;
 case'trial':{const kp=S.knights.find(q=>q.id===+x),c0=CONS_BY[y];
  if(kp&&c0){const e=trialEval(kp,c0);if(!e.ok)return;const win=Math.random()<e.ch;const cd=ql(kp,'orgueilleux')?24:12;
   if(win){const old=CONS_BY[kp.cons];S.armors[old.k]='restauree';S.armors[c0.k]='portee';kp.rank=c0.rank;kp.cons=c0.k;kp.tech=kp.tech.concat([SIG_WORDS[kp.seed%SIG_WORDS.length]+' '+(c0.rank==='or'?'d’or':de(c0.n))]);
    if(c0.rank==='or'&&!S.houses[c0.sign])S.houses[c0.sign]=1;log('★ '+kp.name+' est promu'+G(kp,'e')+' : '+armorLow(c0)+' ! L’'+armorLow(old)+' attend un nouveau porteur.');}
   else{kp.cd=S.gt+cd;log(kp.name+' échoue à l’épreuve de l’'+armorLow(c0)+'.');}
   lastTrial={id:kp.id,win,name:kp.name,rank:c0.rank,cons:c0.n,sex:kp.sex,cd};save();render();return;}
  const ap=S.aps.find(q=>q.id===+x),c=CONS_BY[y];if(!ap||!c)return;const e=trialEval(ap,c);if(!e.ok)return;
  const win=Math.random()<e.ch;const cd=ql(ap,'orgueilleux')?24:12;
  if(win){S.aps.splice(S.aps.indexOf(ap),1);S.armors[c.k]='portee';
   const kn={id:ap.id,seed:ap.seed,sex:ap.sex,name:ap.name,nat:ap.nat,qual:ap.qual,flaw:ap.flaw,bio:ap.bio,sign:ap.sign,rank:c.rank,cons:c.k,lv:ap.lv,xp:0,st:Object.assign({},ap.st),role:null,tech:ap.tech.concat([SIG_WORDS[ap.seed%SIG_WORDS.length]+' '+(c.rank==='or'?'d’or':de(c.n))]),origin:'forme',pot:ap.pot,sp:ap.sp||0,nrg:ap.nrg,tr:ap.tr,tacc:ap.tacc,mentors:(ap.mentors||[]).concat(ap.master!=null?[ap.master]:[])};
   S.knights.push(kn);if(c.rank==='or'&&!S.houses[c.sign])S.houses[c.sign]=1;
   log('★ '+ap.name+' obtient l’'+armorLow(c)+' et devient chevalier de '+RANKS[c.rank].toLowerCase()+' !');}
  else{ap.xp*=Math.min(1,.33*ql(ap,'perseverant'));ap.cd=S.gt+cd;log(ap.name+' échoue à l’épreuve de l’'+armorLow(c)+'.');}
  lastTrial={id:ap.id,win,name:ap.name,rank:c.rank,cons:c.n,sex:ap.sex,cd};save();render();return;}
 case'restore':{const c=CONS_BY[x];const cost=ARMOR_COST[c.rank];if(S.forgeJob||S.b.forge<ARMOR_FORGE[c.rank]||bestSmith()<ARMOR_SMITH[c.rank]||!afford(cost)||S.armors[x]!=='brisee')return;pay(cost);S.forgeJob={cons:x,work:ARMOR_WORK[c.rank],prog:0};log('L’atelier commence la restauration de l’'+armorLow(c)+'.');break;}
 case'settings':resetArmed=false;ioMsg='';openModal(settingsModal);return;
 case'speed':S.speed=+x;break;
 case'sound':unlockAudio();setSound({on:x==='toggle'?!soundPrefs().on:x==='on'});if(soundPrefs().on)sfx('confirm');break;
 case'exportSave':{save();const code=exportCode(S);const ta=$('#saveIo');ta.value=code;ta.select();
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(code).then(()=>{ioMsg='Code copié dans le presse-papiers.';$('#sheetBody').innerHTML=settingsModal();$('#saveIo').value=code;},()=>{ioMsg='Copie automatique impossible : le code est sélectionné, copiez-le à la main.';});}else ioMsg='Le code est sélectionné, copiez-le à la main.';return;}
 case'importSave':{const v=$('#saveIo').value.trim();const o=importCode(v);if(o){setS(o);recomputeCB();ensureSchedules();S.lastReal=Date.now();save();ioMsg='Partie chargée.';}else{ioMsg='Ce code n’est pas reconnu. Vérifiez qu’il a été collé en entier.';}break;}
 case'resetArm':resetArmed=true;break;
 case'resetCancel':resetArmed=false;break;
 case'resetGo':try{localStorage.removeItem(KEY);}catch(e){}newGame();recomputeCB();save();closeModal();render();return;
 }
 save();render();
}
