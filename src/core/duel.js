/* Lecture des astres, version Splendor : le Grand Pope affronte un dieu, une partie par jour.
   À son tour, on fait UNE action : prendre 3 gemmes d'éléments différents, ou 2 gemmes identiques
   (s'il en reste au moins 4), ou acheter une carte, ou réserver une carte (et recevoir un cosmos d'or, le joker).
   Actions libres en plus : un renfort par tour (une gemme contre des ressources du Sanctuaire) et le balayage d'une rangée.
   Les cartes achetées donnent une réduction permanente. Le premier à 15 ✦ en fin de manche gagne. */
import { BOOST, GODS, GOD_KEYS } from './data/gods.js';
import { CARDS2, GEMS, HAND_MAX, JOKERS, BANK_N, MAX_ROUNDS, RELICS, RELIC_BY, RESERVE_MAX, ROW_N, SACRED, WIN_PTS } from './data/stars.js';
import { EKEYS, ELEM, SIGNS } from './data/world.js';
import { afford, elemScores, pay, recomputeCB } from './rules.js';
import { S, log } from './state.js';
import { mulberry32, todayStr } from './util.js';

export const CARD_BY2={};CARDS2.forEach(c=>CARD_BY2[c.id]=c);RELICS.forEach(r=>CARD_BY2[r.id]=Object.assign({relic:true,t:'A',el:null},r));
export const cardOf=id=>CARD_BY2[id];
const SACRED_BY={};SACRED.forEach(s=>SACRED_BY[s.id]=s);export const sacredOf=id=>SACRED_BY[id];
const fem=g=>['eris','artemis','demeter'].includes(g);

export function ensureDuel(){
 if(!S.duel)S.duel={lastDate:'',lastGt:-999};
 if(!S.relics)S.relics=[];if(!S.duel.loadout)S.duel.loadout=[];
 if(S.match&&S.match.v!==2)S.match=null; // ancienne partie (avant la version Splendor) : abandonnée sans effet
}
export function duelAvailable(){ensureDuel();if(S.match)return false;if(S.speed!==1)return S.gt-(S.duel.lastGt??-999)>=24;return S.duel.lastDate!==todayStr();}
export function godState(k){if(!S.gods[k])S.gods[k]={lv:0,wins:0,losses:0,bonus:{feu:0,eau:0,air:0,terre:0}};return S.gods[k];}
// Bonus de départ du Sanctuaire : selon ses scores d'élément (rangs et cosmos de chacun), 2 au plus par élément.
export function myStart(){const E=elemScores(),b={};EKEYS.forEach(e=>b[e]=Math.min(2,Math.floor(E[e]/30)));return b;}
const zero=()=>({feu:0,eau:0,air:0,terre:0});
const zeroG=()=>({feu:0,eau:0,air:0,terre:0,or:0});
function shuffle(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const total=g=>GEMS.reduce((s,k)=>s+(g[k]||0),0);

export function startDuel(loadout){
 ensureDuel();if(!duelAvailable())return null;
 const god=GOD_KEYS[Math.floor(Math.random()*GOD_KEYS.length)],g=godState(god),G0=GODS[god];
 const seed=(Math.random()*2**31)|0,r=mulberry32(seed);
 const decks={1:[],2:[],3:[]};CARDS2.forEach(c=>decks[c.t].push(c.id));[1,2,3].forEach(t=>shuffle(decks[t],r));
 const rows={1:decks[1].splice(0,ROW_N),2:decks[2].splice(0,ROW_N),3:decks[3].splice(0,ROW_N)};
 const relicDeck=shuffle(RELICS.map(x=>x.id).filter(id=>!S.relics.includes(id)),r);
 const me={gems:zeroG(),bonus:myStart(),pts:0,cards:[],reserved:[],relics:[],sacred:[],cap:HAND_MAX};
 // une gemme de départ par chevalier, de l'élément de son signe (4 au plus)
 S.knights.slice(0,4).forEach(k=>{const e=knightEl(k);me.gems[e]++;});
 const ai={gems:zeroG(),bonus:zero(),pts:0,cards:[],reserved:[],relics:[],sacred:[],cap:HAND_MAX};
 // Le dieu gagne un bonus de départ tous les six niveaux (niveaux gagnés contre le Sanctuaire),
 // et ses acquis (un par défaite du Sanctuaire) lui donnent des gemmes de départ, 3 au plus par élément.
 for(let i=0;i<Math.floor(g.lv/6);i++)ai.bonus[G0.aff[i%2]]++;
 EKEYS.forEach(e=>ai.gems[e]+=Math.min(3,g.bonus[e]||0));
 ai.gems[G0.aff[0]]+=2;ai.gems[G0.aff[1]]+=1;for(let i=0;i<Math.ceil(g.lv/2);i++)ai.gems[G0.aff[i%2]]++;
 const bank={};EKEYS.forEach(e=>bank[e]=BANK_N);bank.or=JOKERS;
 EKEYS.forEach(e=>{bank[e]=Math.max(0,bank[e]-me.gems[e]-ai.gems[e]);});
 const m={v:2,god,seed,round:1,bank,decks,rows,relicDeck,relicRow:relicDeck.splice(0,2),sacred:shuffle(SACRED.map(s=>s.id),r).slice(0,3),me,ai,
  log:[],over:false,result:null,sweeps:0,boosted:false,maxRounds:MAX_ROUNDS,loadout:(loadout||S.duel.loadout||[]).filter(id=>S.relics.includes(id)).slice(0,3),fx:[]};
 S.match=m;
 m.loadout.forEach(id=>applyRelic(m,'me',id,true));
 S.duel.lastDate=todayStr();S.duel.lastGt=S.gt;
 note(m,'Le Pope lève les yeux vers les astres. '+G0.n+' accepte le défi.');
 log('Lecture des astres : duel contre '+G0.n+'.');
 return m;
}
export function knightEl(k){return SIGNS[k.sign].el;}
function note(m,t){m.log.unshift(t);if(m.log.length>40)m.log.length=40;}

/* ---------- effets des artefacts ---------- */
const has=(P,id)=>P.relics.includes(id);
function applyRelic(m,side,id,fromLoadout){
 const P=m[side],o=side==='me'?m.ai:m.me;if(!P.relics.includes(id))P.relics.push(id);
 const grab=n=>{const k=Math.min(n,m.bank.or);m.bank.or-=k;P.gems.or+=k;};
 switch(id){
  case'masque':P.pts+=1;grab(1);break;
  case'bouclier':{const e=EKEYS.slice().sort((a,b)=>o.bonus[b]-o.bonus[a])[0];if(o.bonus[e]>0)o.bonus[e]--;o.noReserve=true;break;}
  case'urne':P.cap=12;grab(1);break;
  case'couronne':{const e=EKEYS.slice().sort((a,b)=>P.bonus[a]-P.bonus[b])[0];P.bonus[e]++;break;}
  case'sablier':m.maxRounds+=3;grab(1);break;
 }
 if(side==='me'&&!fromLoadout&&!S.relics.includes(id)){S.relics.push(id);log('★ Nouvel artefact pour la lecture des astres : '+RELIC_BY[id].n+'.');}
}

/* ---------- coûts ---------- */
// Ce qu'il manque pour acheter une carte, après réductions et gemmes, avant les cosmos d'or.
export function deficit(card,P){let d=0;for(const e in card.cost){d+=Math.max(0,card.cost[e]-(P.bonus[e]||0)-(P.gems[e]||0));}return d;}
export function canBuy(card,P){return deficit(card,P)<=P.gems.or;}
export function netCost(card,P){const o={};for(const e in card.cost)o[e]=Math.max(0,card.cost[e]-(P.bonus[e]||0));return o;}
function visibleIds(m){return[3,2,1].flatMap(t=>m.rows[t]).concat(m.relicRow);}

/* ---------- actions ---------- */
function refill(m,id){
 for(const t of[1,2,3]){const i=m.rows[t].indexOf(id);if(i>=0){m.rows[t].splice(i,1,...(m.decks[t].length?[m.decks[t].shift()]:[]));return;}}
 const i=m.relicRow.indexOf(id);if(i>=0)m.relicRow.splice(i,1,...(m.relicDeck.length?[m.relicDeck.shift()]:[]));
}
export function canTake(m,P,colors){
 if(!colors.length)return false;if(colors.includes('or'))return false;
 const same=colors.length===2&&colors[0]===colors[1];
 if(same){if((m.bank[colors[0]]||0)<4)return false;}
 else{if(new Set(colors).size!==colors.length||colors.length>3)return false;if(colors.some(c=>(m.bank[c]||0)<1))return false;
  // moins de 3 gemmes : seulement si la réserve n'en propose pas plus
  if(colors.length<3&&EKEYS.filter(e=>m.bank[e]>0).length>colors.length)return false;}
 return total(P.gems)+colors.length<=P.cap;
}
export function take(side,colors){
 const m=S.match,P=m[side];if(!canTake(m,P,colors))return false;
 colors.forEach(c=>{m.bank[c]--;P.gems[c]++;});
 const extra=colors.length===2&&colors[0]===colors[1]&&has(P,'lance')&&m.bank[colors[0]]>0&&total(P.gems)<P.cap;
 if(extra){m.bank[colors[0]]--;P.gems[colors[0]]++;}
 m.fx.push({side,kind:'take',gems:extra?colors.concat(colors[0]):colors.slice()});
 note(m,who(m,side)+' prend '+describeGems(extra?colors.concat(colors[0]):colors)+'.');
 return true;
}
export function buy(side,id){
 const m=S.match,P=m[side],c=cardOf(id);if(!c)return false;
 if(!(visibleIds(m).includes(id)||P.reserved.includes(id))||!canBuy(c,P))return false;
 const spent=zeroG();
 for(const e in c.cost){let need=Math.max(0,c.cost[e]-(P.bonus[e]||0));const g=Math.min(need,P.gems[e]);P.gems[e]-=g;m.bank[e]+=g;spent[e]+=g;need-=g;P.gems.or-=need;m.bank.or+=need;spent.or+=need;}
 if(P.reserved.includes(id))P.reserved=P.reserved.filter(x=>x!==id);else refill(m,id);
 P.cards.push(id);let pts=c.pts;if(c.t===3&&has(P,'sceptre'))pts++;P.pts+=pts;
 if(c.el)P.bonus[c.el]++;
 m.fx.push({side,kind:'buy',card:id,spent});
 note(m,who(m,side)+' acquiert « '+c.n+' »'+(pts?' (+'+pts+' ✦)':'')+'.');
 if(c.relic)applyRelic(m,side,id,false);
 return true;
}
export function reserve(side,id){
 const m=S.match,P=m[side];if(P.reserved.length>=RESERVE_MAX||P.noReserve)return false;
 let cid=id;
 if(String(id).startsWith('deck:')){const t=+id.slice(5);if(!m.decks[t].length)return false;cid=m.decks[t].shift();}
 else{if(!visibleIds(m).includes(id)||cardOf(id).relic)return false;refill(m,id);}
 P.reserved.push(cid);
 const n=Math.min(has(P,'lampe')?2:1,m.bank.or,Math.max(0,P.cap-total(P.gems)));m.bank.or-=n;P.gems.or+=n;
 m.fx.push({side,kind:'reserve',card:cid,or:n});
 note(m,who(m,side)+' réserve une carte'+(side==='me'?' : « '+cardOf(cid).n+' »':'')+(n?' et reçoit '+n+' cosmos d’or':'')+'.');
 return true;
}
// Balayer une rangée : les cartes visibles retournent sous la pioche, 4 nouvelles apparaissent.
export function sweepCost(){const m=S.match;if(has(m.me,'chouette')&&!m.sweptFree)return{};const k=Math.pow(1.5,m.sweeps);return{vivres:Math.round(40*k/5)*5,marbre:Math.round(25*k/5)*5};}
export function sweep(t){
 const m=S.match;if(m.over||!m.decks[t].length)return false;const c=sweepCost();if(!afford(c))return false;pay(c);
 if(!Object.keys(c).length)m.sweptFree=true;else m.sweeps++;
 const old=m.rows[t];m.decks[t]=m.decks[t].concat(old);m.rows[t]=m.decks[t].splice(0,ROW_N);
 m.fx.push({side:'me',kind:'sweep',row:t});note(m,'Le Pope balaie le ciel du rang '+['','I','II','III'][t]+'.');
 return true;
}
// Renfort : une gemme de l'élément choisi contre des ressources du Sanctuaire, une fois par tour.
export function boostCost(e){const m=S.match;const c={};c[BOOST[e].res]=Math.round(BOOST[e].q*.5*Math.pow(1.6,m.boosts||0)*(has(m.me,'peplos')?.5:1)/5)*5;return c;}
export function boost(e){
 const m=S.match,P=m.me;if(m.over||m.boosted||!m.bank[e]||total(P.gems)>=P.cap)return false;const c=boostCost(e);if(!afford(c))return false;
 pay(c);m.bank[e]--;P.gems[e]++;m.boosts=(m.boosts||0)+1;m.boosted=true;
 m.fx.push({side:'me',kind:'take',gems:[e],boost:true});note(m,'Renfort du Sanctuaire : +1 gemme '+ELEM[e].toLowerCase()+'.');return true;
}
function checkSacred(m,side){
 const P=m[side];
 for(const id of m.sacred.slice()){const s=SACRED_BY[id];if(Object.keys(s.need).every(e=>P.bonus[e]>=s.need[e])){m.sacred=m.sacred.filter(x=>x!==id);P.sacred.push(id);P.pts+=s.pts;m.fx.push({side,kind:'sacred',id});note(m,s.n+' se tourne vers '+(side==='me'?'le Sanctuaire':GODS[m.god].n)+' (+'+s.pts+' ✦).');break;}}
}
const who=(m,side)=>side==='me'?'Le Pope':GODS[m.god].n;
function describeGems(cs){const c={};cs.forEach(x=>c[x]=(c[x]||0)+1);return Object.keys(c).map(k=>c[k]+' '+ELEM[k].toLowerCase()).join(', ');}

// Fin de l'action du joueur : constellations, tour du dieu, fin de manche.
export function endTurn(){
 const m=S.match;if(!m||m.over)return;
 checkSacred(m,'me');
 aiTurn(m);checkSacred(m,'ai');
 m.boosted=false;
 if(m.me.pts>=WIN_PTS||m.ai.pts>=WIN_PTS||m.round>=m.maxRounds){finishDuel();return;}
 m.round++;
}
// Passer son tour (l'écran appelle ensuite endTurn pour faire jouer le dieu).
export function pass(){const m=S.match;if(!m||m.over)return false;note(m,'Le Pope médite et passe son tour.');m.fx.push({side:'me',kind:'pass'});return true;}
// Actions possibles du joueur (pour savoir s'il est bloqué).
export function anyAction(){const m=S.match,P=m.me;return visibleIds(m).concat(P.reserved).some(id=>canBuy(cardOf(id),P))||EKEYS.some(e=>m.bank[e]>0)&&total(P.gems)<P.cap||(P.reserved.length<RESERVE_MAX);}

/* ---------- le dieu ---------- */
function cardScore(m,c,P){const aff=c.el&&GODS[m.god].aff.includes(c.el)?.6:0;let s=c.pts*2+(c.relic?1.5:1)+aff;
 // un bonus qui rapproche d'une constellation sacrée vaut plus
 m.sacred.forEach(id=>{const n=SACRED_BY[id].need;if(c.el&&n[c.el]&&P.bonus[c.el]<n[c.el])s+=.7;});return s;}
function aiTurn(m){autoMove(m,'ai');}
// Le coup que jouerait le dieu à la place de « side » (sert aussi aux tests).
export function autoMove(m,side){
 const P=m[side],ids=visibleIds(m).concat(P.reserved);
 const buyable=ids.filter(id=>canBuy(cardOf(id),P)).sort((a,b)=>cardScore(m,cardOf(b),P)-cardScore(m,cardOf(a),P));
 if(buyable.length){buy(side,buyable[0]);return;}
 // une cible : le meilleur rapport valeur / gemmes manquantes
 const target=ids.map(id=>({id,c:cardOf(id)})).sort((a,b)=>cardScore(m,b.c,P)/(1+deficit(b.c,P)-P.gems.or)-cardScore(m,a.c,P)/(1+deficit(a.c,P)-P.gems.or))[0];
 const needs={};if(target)for(const e in target.c.cost)needs[e]=Math.max(0,target.c.cost[e]-(P.bonus[e]||0)-(P.gems[e]||0));
 const room=P.cap-total(P.gems);
 const big=Object.keys(needs).find(e=>needs[e]>=2&&m.bank[e]>=4);
 if(big&&room>=2&&canTake(m,P,[big,big])){take(side,[big,big]);return;}
 let pick=EKEYS.filter(e=>m.bank[e]>0).sort((a,b)=>(needs[b]||0)-(needs[a]||0)||m.bank[b]-m.bank[a]).slice(0,Math.min(3,room));
 const avail=EKEYS.filter(e=>m.bank[e]>0).length;
 if(pick.length===Math.min(3,avail)&&pick.length&&canTake(m,P,pick)){take(side,pick);return;}
 if(target&&!P.noReserve&&P.reserved.length<RESERVE_MAX&&!target.c.relic&&!P.reserved.includes(target.id)&&reserve(side,target.id))return;
 note(m,who(m,side)+' observe le ciel et passe son tour.');m.fx.push({side,kind:'pass'});
}

/* ---------- fin de partie ---------- */
export function finishDuel(forfeit){
 const m=S.match;if(!m||m.over)return;m.over=true;const g=godState(m.god),G0=GODS[m.god];
 let res;if(forfeit)res='lose';else if(m.me.pts!==m.ai.pts)res=m.me.pts>m.ai.pts?'win':'lose';else res=m.me.cards.length<m.ai.cards.length?'win':m.me.cards.length>m.ai.cards.length?'lose':'draw';
 m.result=res;
 if(res==='win'){g.losses++;S.faveur=(S.faveur||0)+m.me.pts;log('★ Le Pope l’emporte sur '+G0.n+' ('+m.me.pts+' ✦ contre '+m.ai.pts+').');}
 else if(res==='lose'){g.wins++;g.lv++;const bestEl=EKEYS.slice().sort((a,b)=>(m.ai.bonus[b]||0)-(m.ai.bonus[a]||0))[0];g.bonus[bestEl]=(g.bonus[bestEl]||0)+1;log(G0.n+' l’emporte et en sort grandi'+(fem(m.god)?'e':'')+' (niveau '+g.lv+').');}
 else log('Duel indécis contre '+G0.n+'.');
}
// Après une victoire : garder une carte de la partie, dont l'effet devient permanent pour le Sanctuaire.
export function keepCard(id){const m=S.match;if(!m||m.result!=='win')return;const c=cardOf(id);if(!c||c.relic||!m.me.cards.includes(id))return;
 S.perm.push({n:c.n,el:c.el,t:c.t,eff:c.eff,unlock:null,fav:c.pts,god:m.god});recomputeCB();log('Le Sanctuaire garde à jamais « '+c.n+' ».');S.match=null;}
export function closeDuel(){S.match=null;}
