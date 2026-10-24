/* Écran de la lecture des astres (plein écran) : marché de cartes, réserve de gemmes, plateau du Pope et du dieu.
   Animations : les gemmes et les cartes volent d'un endroit à l'autre, les nouvelles cartes se retournent,
   le dieu joue à son tour. Toucher une gemme affiche son nom. */
import { GODS } from '../core/data/gods.js';
import { BOOST } from '../core/data/gods.js';
import { GEMS, GEM_N, RELIC_BY, RESERVE_MAX, WIN_PTS } from '../core/data/stars.js';
import { EKEYS, ELEM } from '../core/data/world.js';
import { RES } from '../core/data/economy.js';
import { effText } from '../core/data/cards.js';
import { anyAction, boost, boostCost, buy, canBuy, canTake, cardOf, endTurn, finishDuel, keepCard, closeDuel, netCost, pass, reserve, sacredOf, sweep, sweepCost, take } from '../core/duel.js';
import { afford, pope } from '../core/rules.js';
import { save } from '../core/save.js';
import { S } from '../core/state.js';
import { esc, fmt } from '../core/util.js';
import { cardArt, cardBack } from '../art/cards.js';
import { sfx } from '../audio/audio.js';
import { portrait } from './portraits.js';
import { render as renderApp } from './app.js';

let root=null,sel=[],detail=null,busy=false,boostOpen=false,confirmQuit=false;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const gemChip=(e,n,attrs='',cls='')=>'<span class="gm g-'+e+' '+cls+'" tabindex="0" data-tip="'+esc(GEM_N[e])+'" title="'+esc(GEM_N[e])+'" '+attrs+'><i></i><b>'+n+'</b></span>';
const tot=g=>GEMS.reduce((s,k)=>s+(g[k]||0),0);

export function openDuel(){
 if(!S.match)return;
 if(!root){root=document.createElement('div');root.id='duel';document.body.appendChild(root);root.addEventListener('click',onClick);root.addEventListener('focusin',onTip);}
 root.hidden=false;sel=[];detail=null;draw();
}
function close(){if(root)root.hidden=true;renderApp();}

/* ---------- rendu ---------- */
function cardHtml(id,P,{where='market'}={}){
 const c=cardOf(id),net=netCost(c,P),ok=canBuy(c,P);
 const chips=Object.keys(c.cost).map(e=>{const short=Math.max(0,net[e]-(P.gems[e]||0));return '<span class="cc g-'+e+(short?' short':'')+(net[e]<c.cost[e]?' disc':'')+'" title="'+esc(GEM_N[e])+(net[e]<c.cost[e]?' (réduit par vos bonus)':'')+'"><b>'+net[e]+'</b></span>';}).join('');
 return '<button class="sc-card'+(ok?' ok':'')+(c.relic?' relic':'')+'" data-card="'+id+'" data-where="'+where+'" aria-label="'+esc(c.n)+'"><img src="'+cardArt(c)+'" alt="">'+
  (c.pts?'<span class="pts">'+c.pts+'</span>':'')+(c.el?'<span class="bon g-'+c.el+'" title="Bonus permanent : '+ELEM[c.el]+'"></span>':'<span class="bon relic" title="Artefact">✶</span>')+
  '<span class="costs">'+chips+'</span><span class="nm">'+esc(c.n)+'</span></button>';
}
function draw(){
 const m=S.match;if(!m){close();return;}
 const G0=GODS[m.god],P=m.me,A=m.ai,pp=pope();
 let h='<div class="du-top"><div class="du-side me" data-me><img class="du-av" src="'+(pp?portrait(pp,pp.rank):'')+'" alt=""><div><small>Sanctuaire</small><b class="du-pts" data-pts="me">✦ '+P.pts+'</b></div></div>'+
  '<div class="du-mid"><span>Manche '+m.round+' / '+m.maxRounds+'</span><small>premier à '+WIN_PTS+' ✦</small></div>'+
  '<div class="du-side ai" data-ai><div><small>'+esc(G0.n)+'</small><b class="du-pts" data-pts="ai">✦ '+A.pts+'</b></div><span class="du-god">'+esc(G0.n[0])+'</span></div>'+
  '<button class="du-x" data-du="close" aria-label="Fermer (la partie reste en cours)">✕</button></div>';
 // plateau du dieu
 h+='<div class="du-tray ai-tray"><span class="lbl">'+esc(G0.n)+'</span>'+GEMS.map(e=>gemChip(e,A.gems[e]||0,'data-aigem="'+e+'"','sm')).join('')+'<span class="sep"></span>'+EKEYS.map(e=>'<span class="bn g-'+e+'" title="Bonus '+ELEM[e]+'">'+(A.bonus[e]||0)+'</span>').join('')+(A.reserved.length?'<span class="rsv" title="Cartes réservées">⧉ '+A.reserved.length+'</span>':'')+'</div>';
 // constellations sacrées
 h+='<div class="du-sacred">'+m.sacred.map(id=>{const s=sacredOf(id);return '<div class="sa" data-sacred="'+id+'" title="'+esc(s.n)+' : '+s.pts+' ✦ pour qui réunit ces bonus"><b>'+esc(s.n)+'</b><span>'+Object.keys(s.need).map(e=>'<i class="bn g-'+e+(P.bonus[e]>=s.need[e]?' met':'')+'">'+s.need[e]+'</i>').join('')+'</span><em>'+s.pts+' ✦</em></div>';}).join('')+'</div>';
 // marché
 h+='<div class="du-market">';
 [3,2,1].forEach(t=>{const sc=sweepCost(),can=m.decks[t].length&&afford(sc)&&!m.over;
  h+='<div class="du-row"><div class="deck" data-deck="'+t+'"><button class="deckb" data-du="deck:'+t+'" title="Pioche du rang '+['','I','II','III'][t]+' : réserver la carte du dessus"><img src="'+cardBack(t)+'" alt=""><b>'+m.decks[t].length+'</b></button><button class="sweep" data-du="sweep:'+t+'"'+(can?'':' disabled')+' title="Balayer : 4 nouvelles cartes pour '+(Object.keys(sc).length?Object.keys(sc).map(r=>fmt(sc[r])+' '+RES[r].n.toLowerCase()).join(' + '):'rien (Chouette d’Athéna)')+'">⟲</button></div>'+m.rows[t].map(id=>cardHtml(id,P)).join('')+'</div>';});
 if(m.relicRow.length)h+='<div class="du-row relics"><div class="deck rl"><span>Artefacts</span></div>'+m.relicRow.map(id=>cardHtml(id,P)).join('')+'</div>';
 h+='</div>';
 // réserve de gemmes
 h+='<div class="du-bank"><span class="lbl">Réserve des astres</span>'+GEMS.map(e=>{const n=m.bank[e]||0,k=sel.filter(x=>x===e).length;return '<button class="bk g-'+e+(k?' on':'')+(e==='or'?' joker':'')+'" data-bank="'+e+'" data-du="pick:'+e+'"'+(n&&e!=='or'?'':' disabled')+' title="'+esc(GEM_N[e])+'"><i></i><b>'+n+'</b>'+(k?'<em>'+k+'</em>':'')+'</button>';}).join('')+'</div>';
 // plateau du Pope
 h+='<div class="du-tray me-tray" data-mytray><span class="lbl">Vos gemmes <small>'+tot(P.gems)+' / '+P.cap+'</small></span><div class="row">'+GEMS.map(e=>gemChip(e,P.gems[e]||0,'data-mygem="'+e+'"')).join('')+'</div>'+
  '<span class="lbl">Vos bonus</span><div class="row" data-mybonus>'+EKEYS.map(e=>'<span class="bn big g-'+e+'" title="Bonus permanent '+ELEM[e]+' : réduit le coût de vos cartes">'+(P.bonus[e]||0)+'</span>').join('')+'</div>'+
  (P.reserved.length?'<span class="lbl">Réservées</span><div class="row rsvrow">'+P.reserved.map(id=>cardHtml(id,P,{where:'reserved'})).join('')+'</div>':'')+
  (P.relics.length?'<span class="lbl">Artefacts</span><div class="row">'+P.relics.map(id=>'<span class="relic-tag" title="'+esc(RELIC_BY[id].d)+'">✶ '+esc(RELIC_BY[id].n)+'</span>').join('')+'</div>':'')+'</div>';
 // actions
 const takeOk=!m.over&&canTake(m,P,sel);
 h+='<div class="du-acts"><button class="btn" data-du="take"'+(takeOk&&!busy?'':' disabled')+'>Prendre '+(sel.length?sel.map(e=>'<i class="dot g-'+e+'"></i>').join(''):'des gemmes')+'</button>'+
  '<button class="btn ghost" data-du="boost"'+(m.boosted||m.over||busy?' disabled':'')+'>Renfort</button><button class="btn ghost" data-du="pass"'+(m.over||busy?' disabled':'')+'>Passer</button></div>';
 if(boostOpen&&!m.boosted)h+='<div class="du-boost">'+EKEYS.map(e=>{const c=boostCost(e);return '<button class="opt" data-du="boostgo:'+e+'"'+(afford(c)&&m.bank[e]?'':' disabled')+'><b><i class="dot g-'+e+'"></i> +1 '+ELEM[e]+'</b><span class="d">'+Object.keys(c).map(r=>fmt(c[r])+' '+RES[r].n.toLowerCase()).join('')+'</span></button>';}).join('')+'<p class="hint">Une fois par tour, sans perdre votre action.</p></div>';
 h+='<p class="du-help">Votre tour : prenez 3 gemmes d’éléments différents, ou 2 identiques (s’il en reste 4), ou achetez une carte, ou réservez-en une (+1 cosmos d’or). Touchez une carte pour la voir en grand.</p>';
 h+='<div class="du-log">'+m.log.slice(0,4).map((l,i)=>'<div'+(i===0?' class="new"':'')+'>'+esc(l)+'</div>').join('')+'</div>';
 h+='<div class="du-quit">'+(confirmQuit?'<button class="btn sm danger" data-du="forfeit">Confirmer l’abandon (défaite)</button> <button class="btn sm ghost" data-du="noquit">Continuer</button>':'<button class="btn sm ghost" data-du="quit">Abandonner la partie</button>')+'</div>';
 if(detail)h+=detailHtml(detail);
 if(m.over)h+=endHtml(m);
 root.innerHTML=h;
}
function detailHtml(id){
 const m=S.match,P=m.me,c=cardOf(id),net=netCost(c,P),ok=canBuy(c,P)&&!m.over,inRes=P.reserved.includes(id);
 const canRes=!inRes&&!c.relic&&P.reserved.length<RESERVE_MAX&&!m.over;
 return '<div class="du-detail" data-du="nodetail"><div class="dd-card" data-du="stay"><img src="'+cardArt(c)+'" alt=""><div class="dd-info"><h3>'+esc(c.n)+'</h3>'+
  '<p>'+(c.relic?'Artefact · ':'Rang '+['','I','II','III'][c.t]+' · ')+(c.pts?c.pts+' ✦':'aucun ✦')+(c.el?' · bonus permanent <i class="dot g-'+c.el+'"></i> '+ELEM[c.el]:'')+'</p>'+
  (c.relic?'<p class="eff">'+esc(c.d)+'</p><p class="hint">Une fois acheté, il rejoint votre collection pour toujours : vous pourrez l’emporter dans vos prochains duels.</p>':'<p class="hint">Si vous la gardez après une victoire : effet permanent pour le Sanctuaire.</p>')+
  '<div class="dd-cost">'+Object.keys(c.cost).map(e=>'<span><i class="dot g-'+e+'"></i> '+ELEM[e]+' : <b>'+net[e]+'</b>'+(net[e]<c.cost[e]?' <s>'+c.cost[e]+'</s>':'')+' · vous en avez '+(P.gems[e]||0)+'</span>').join('')+(P.gems.or?'<span><i class="dot g-or"></i> Cosmos d’or disponibles : '+P.gems.or+'</span>':'')+'</div>'+
  '<div class="btns"><button class="btn" data-du="buy:'+id+'"'+(ok&&!busy?'':' disabled')+'>Acheter</button>'+(canRes?'<button class="btn ghost" data-du="res:'+id+'"'+(busy?' disabled':'')+'>Réserver (+1 cosmos d’or)</button>':'')+'<button class="btn ghost" data-du="nodetail">Fermer</button></div></div></div></div>';
}
function endHtml(m){
 const G0=GODS[m.god],win=m.result==='win';
 let h='<div class="du-end"><div class="de-box '+m.result+'"><h2>'+(win?'Victoire sur '+esc(G0.n):m.result==='draw'?'Les astres restent muets':esc(G0.n)+' l’emporte')+'</h2><p>'+m.me.pts+' ✦ contre '+m.ai.pts+' ✦</p>';
 const newRelics=m.me.relics.filter(id=>!m.loadout.includes(id));
 if(newRelics.length)h+='<p class="hint">Nouvel artefact dans votre collection : '+newRelics.map(id=>esc(RELIC_BY[id].n)).join(', ')+'.</p>';
 const keep=m.me.cards.filter(id=>!cardOf(id).relic);
 if(win&&keep.length)h+='<p class="hint">Choisissez une carte : son effet devient permanent pour le Sanctuaire.</p><div class="de-keep">'+keep.map(id=>'<button class="de-k" data-du="keep:'+id+'"><img src="'+cardArt(cardOf(id))+'" alt=""><span>'+esc(cardOf(id).n)+'</span><small>'+Object.keys(cardOf(id).eff).map(k=>esc(effText(k,cardOf(id).eff[k]))).join(' · ')+'</small></button>').join('')+'</div>';
 else h+='<p class="hint">'+(win?'':m.result==='draw'?'Personne ne prend l’ascendant aujourd’hui.':esc(G0.n)+' gagne en puissance. Il sera plus dur à vaincre.')+'</p><button class="btn" data-du="done">Quitter la chambre des astres</button>';
 return h+'</div></div>';
}

/* ---------- animations ---------- */
function rectOf(sel){const el=root.querySelector(sel);return el?el.getBoundingClientRect():null;}
function snapshot(){const s={};root.querySelectorAll('[data-card],[data-bank],[data-mygem],[data-aigem],[data-deck],[data-sacred]').forEach(el=>{const k=el.dataset.card?'card:'+el.dataset.card:el.dataset.bank?'bank:'+el.dataset.bank:el.dataset.mygem?'mygem:'+el.dataset.mygem:el.dataset.aigem?'aigem:'+el.dataset.aigem:el.dataset.deck?'deck:'+el.dataset.deck:'sacred:'+el.dataset.sacred;s[k]=el.getBoundingClientRect();});s.ids=new Set([...root.querySelectorAll('[data-card]')].map(e=>e.dataset.card));return s;}
function fly(from,to,html,{ms=520,scale=1}={}){
 if(!from||!to)return Promise.resolve();
 const el=document.createElement('div');el.className='du-fly';el.innerHTML=html;el.style.left=from.left+'px';el.style.top=from.top+'px';el.style.width=from.width+'px';el.style.height=from.height+'px';document.body.appendChild(el);
 const dx=to.left+to.width/2-(from.left+from.width/2),dy=to.top+to.height/2-(from.top+from.height/2);
 const a=el.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+dx*.5+'px,'+(dy*.5-40)+'px) scale('+(1+scale)/1.6+')',opacity:1,offset:.5},{transform:'translate('+dx+'px,'+dy+'px) scale('+scale+')',opacity:.2}],{duration:ms,easing:'cubic-bezier(.4,.1,.3,1)'});
 return a.finished.then(()=>el.remove()).catch(()=>el.remove());
}
async function animate(fx,before){
 const after=snapshot();
 // nouvelles cartes : elles se retournent
 root.querySelectorAll('[data-card]').forEach(el=>{if(!before.ids.has(el.dataset.card))el.classList.add('flip-in');});
 const jobs=[];
 fx.forEach(f=>{
  const me=f.side==='me';
  if(f.kind==='take')f.gems.forEach((e,i)=>jobs.push(sleep(i*90).then(()=>fly(f.boost?rectOf('[data-du="boost"]'):before['bank:'+e],after[(me?'mygem:':'aigem:')+e],'<span class="gm g-'+e+'"><i></i></span>',{ms:560}))));
  if(f.kind==='buy'||f.kind==='reserve'){const c=cardOf(f.card);const from=before['card:'+f.card]||before['deck:'+c.t];const to=me?(f.kind==='buy'?rectOf('[data-mybonus]'):rectOf('.rsvrow')||rectOf('[data-mytray]')):rectOf('.ai-tray');
   jobs.push(fly(from,to,'<img src="'+(f.kind==='reserve'&&!me?cardBack(c.t):cardArt(c))+'" style="width:100%;height:100%;border-radius:8px">',{ms:650,scale:.35}));
   if(f.spent)Object.keys(f.spent).forEach(e=>{for(let i=0;i<Math.min(3,f.spent[e]);i++)jobs.push(sleep(i*70).then(()=>fly(after[(me?'mygem:':'aigem:')+e],after['bank:'+e],'<span class="gm g-'+e+'"><i></i></span>',{ms:480})));});}
  if(f.kind==='sacred'){const el=root.querySelector('[data-pts="'+f.side+'"]');if(el){el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');}jobs.push(fly(before['sacred:'+f.id],rectOf('[data-pts="'+f.side+'"]'),'<div class="sa-fly">✦</div>',{ms:800,scale:.5}));sfx('milestone');}
  if(f.kind==='buy'){const el=root.querySelector('[data-pts="'+f.side+'"]');if(el&&cardOf(f.card).pts){el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');}}
 });
 await Promise.all(jobs);
}
// Joue une action du Pope, puis le tour du dieu, avec les animations.
async function play(action,endsTurn=true){
 const m=S.match;if(!m||m.over||busy)return;busy=true;
 m.fx=[];let before=snapshot();
 const ok=action();if(!ok){busy=false;draw();return;}
 const mine=m.fx.slice();detail=null;sel=[];boostOpen=false;draw();await animate(mine,before);
 if(endsTurn){
  await sleep(380);root.querySelector('[data-ai]')?.classList.add('thinking');await sleep(420);
  m.fx=[];before=snapshot();endTurn();const godFx=m.fx.slice();
  draw();root.querySelector('[data-ai]')?.classList.add('acting');sfx(godFx.some(f=>f.kind==='buy')?'card':'turn');await animate(godFx,before);
  if(m.over){sfx(m.result==='win'?'win':'lose');}
 }
 save();busy=false;draw();
}

/* ---------- interactions ---------- */
function onTip(e){const t=e.target.closest('[data-tip]');if(!t)return;showTip(t);}
function showTip(t){tipAt(t,t.dataset.tip);}
function tipAt(t,text){root.querySelectorAll('.tip').forEach(x=>x.remove());const r=t.getBoundingClientRect(),d=document.createElement('div');d.className='tip';d.textContent=text;d.style.left=(r.left+r.width/2)+'px';d.style.top=(r.top-6)+'px';root.appendChild(d);setTimeout(()=>d.remove(),1400);}
function onClick(e){
 const tipEl=e.target.closest('[data-tip]');if(tipEl){showTip(tipEl);}
 const cardEl=e.target.closest('[data-card]');
 const t=e.target.closest('[data-du]');
 if(!t&&cardEl&&!e.target.closest('.du-detail')){if(busy)return;detail=cardEl.dataset.card;sfx('open');draw();return;}
 if(!t)return;if(t.disabled)return;
 const [k,x]=t.dataset.du.split(':'),m=S.match;
 if(k==='stay')return;
 switch(k){
  case'close':sfx('close');close();return;
  case'nodetail':detail=null;draw();return;
  case'pick':{if(busy||m.over)return;const n=sel.filter(c=>c===x).length;
   if(n){sel=sel.filter(c=>c!==x);if(n===1&&sel.length===0&&(m.bank[x]||0)>=4)sel=[x,x];}
   else{if(sel.length===2&&sel[0]===sel[1])sel=[x];else if(sel.length<3)sel.push(x);}
   sfx('tap');draw();return;}
  case'take':{const pick=sel.slice();play(()=>take('me',pick));sfx('confirm');return;}
  case'buy':sfx('card');play(()=>buy('me',x));return;
  case'res':sfx('card');play(()=>reserve('me',x));return;
  case'deck':{if(busy||m.over)return;if(m.me.reserved.length>=RESERVE_MAX){tipAt(t,'Déjà 3 cartes réservées');return;}sfx('card');play(()=>reserve('me','deck:'+x));return;}
  case'sweep':sfx('build');play(()=>sweep(+x),false);return;
  case'boost':boostOpen=!boostOpen;sfx('tap');draw();return;
  case'boostgo':sfx('pay');play(()=>boost(x),false);return;
  case'pass':sfx('turn');play(()=>pass());return;
  case'quit':confirmQuit=true;draw();return;
  case'noquit':confirmQuit=false;draw();return;
  case'forfeit':confirmQuit=false;finishDuel(true);sfx('lose');save();draw();return;
  case'keep':keepCard(x);sfx('milestone');save();close();return;
  case'done':closeDuel();save();close();return;
 }
}
