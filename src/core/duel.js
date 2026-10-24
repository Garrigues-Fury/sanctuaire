/* Lecture des astres : logique du duel quotidien. */
import { AI_MAX, BOOST, DUEL_TURNS, DUEL_WIN, EFFBASE, EFFPOOL, GODS, GOD_KEYS, NAMES_EL } from './data/gods.js';
import { CONS_BY, EKEYS, ELEM, de } from './data/world.js';
import { cap, cb, elemScores, recomputeCB } from './rules.js';
import { S, log } from './state.js';
import { mulberry32, todayStr } from './util.js';

export function duelAvailable(){if(S.match)return false;if(S.speed!==1)return S.gt-(S.duel.lastGt??-999)>=24;return S.duel.lastDate!==todayStr();}
export function myBase(){const E=elemScores(),o={};EKEYS.forEach(e=>o[e]=2+Math.round(E[e]/3));return o;}
export function myCons(){const o={};S.knights.forEach(k=>{o[k.cons]=(o[k.cons]||0)+Math.max(1,Math.round(k.st.co/4));});return o;}
export function godState(k){if(!S.gods[k])S.gods[k]={lv:0,wins:0,losses:0,bonus:{feu:0,eau:0,air:0,terre:0}};return S.gods[k];}
export function godBase(k,mine){const g=godState(k),G0=GODS[k];let tot=0;EKEYS.forEach(e=>tot+=mine[e]);tot*=(.65+.1*g.lv);const w={};let ws=0;EKEYS.forEach(e=>{w[e]=G0.aff.includes(e)?2:1;ws+=w[e];});const o={};EKEYS.forEach(e=>o[e]=Math.max(1,Math.round(tot*w[e]/ws))+(g.bonus[e]||0));return o;}
export function genDeck(P,rnd){
 const used={feu:0,eau:0,air:0,terre:0};let id=0;const deck={1:[],2:[],3:[]};
 const mk=(t)=>{const el=EKEYS[Math.floor(rnd()*4)];const names=NAMES_EL[el];const n=names[used[el]++%names.length]+(used[el]>names.length?' II':'');
  const nEl=t===1?2:t===2?(rnd()<.5?2:3):(rnd()<.5?3:4);const others=EKEYS.slice().sort(()=>rnd()-.5).slice(0,nEl);
  const total=Math.max(nEl,Math.round(P*(t===1?1+rnd()*.4:t===2?1.8+rnd()*.6:3+rnd()*.8)));const cost={};let left=total;
  others.forEach((e,i)=>{const v=i===others.length-1?left:Math.max(1,Math.round(total/nEl*(.6+rnd()*.8)));cost[e]=Math.max(1,Math.min(left-(others.length-1-i),v));left-=cost[e];});
  const give=Math.max(1,Math.round(P*(.08+.08*t)));const fav=t===1?(rnd()<.25?1:0):t===2?(rnd()<.6?1:2):(rnd()<.5?2:3);
  const ep=EFFPOOL[el][Math.floor(rnd()*4)];const eff={};eff[ep[0]]=Math.max(1,Math.round(ep[1]*EFFBASE[t]));
  return{id:'d'+(id++),t,n,el,cost,give,fav,eff};};
 for(let i=0;i<14;i++)deck[1].push(mk(1));for(let i=0;i<12;i++)deck[2].push(mk(2));for(let i=0;i<8;i++)deck[3].push(mk(3));
 // cartes de constellation (réservées au Sanctuaire)
 const cons=myCons();Object.keys(cons).forEach(k=>{if(rnd()<.6){const c=CONS_BY[k];const t=c.rank==='or'?3:2;const e2=c.el;const cap=cons[k];
  const card={id:'d'+(id++),t,n:'Étoile '+de(c.n),el:e2,cost:{},give:Math.max(1,Math.round(P*(.15+.08*t))),fav:t===3?3:2,eff:{},cons:k};card.cost[e2]=Math.max(1,Math.round(P*.6));card.cost['c:'+k]=Math.max(1,Math.round(cap*.8));
  const ep=EFFPOOL[e2][Math.floor(rnd()*4)];card.eff[ep[0]]=Math.max(1,Math.round(ep[1]*EFFBASE[t]*1.3));deck[t].push(card);}});
 if(!cb('U_ambroisie'))deck[2].push({id:'d'+(id++),t:2,n:'Secret de l’ambroisie',el:'air',cost:{eau:Math.round(P*1),air:Math.round(P*.6)},give:1,fav:1,eff:{},unlock:'ambroisie'});
 if(!cb('U_huile'))deck[2].push({id:'d'+(id++),t:2,n:'Rite de l’huile sacrée',el:'feu',cost:{feu:Math.round(P*.9),terre:Math.round(P*.7)},give:1,fav:1,eff:{},unlock:'huile'});
 [1,2,3].forEach(t=>deck[t].sort(()=>rnd()-.5));
 return deck;
}
export function startDuel(){
 if(!duelAvailable())return;
 const godK=GOD_KEYS[Math.floor(Math.random()*GOD_KEYS.length)];
 const base=myBase();let P=0;EKEYS.forEach(e=>P+=base[e]);P=Math.max(3,P/4);
 const rnd=mulberry32((Math.random()*2**31)|0);const decks=genDeck(P,rnd);
 const m={god:godK,turn:1,P,decks,market:{1:[],2:[],3:[]},me:{base,cons:myCons(),bonus:{},boost:{},fav:0,cards:[],spent:{},boosts:0},ai:{base:godBase(godK,base),bonus:{},fav:0,cards:[]},log:[],over:false,result:null};
 S.match=m;[1,2,3].forEach(t=>mRefill(t));
 S.duel.lastDate=todayStr();S.duel.lastGt=S.gt;
 m.log.unshift('Le Pope lève les yeux vers les astres. '+GODS[godK].n+' accepte le défi.');
 log('Lecture des astres : duel contre '+GODS[godK].n+'.');
}
export function mRefill(t){const m=S.match;while(m.market[t].length<3&&m.decks[t].length)m.market[t].push(m.decks[t].shift());}
export function pool(side){const m=S.match,s=m[side],o={};EKEYS.forEach(e=>o[e]=(s.base[e]||0)+(s.bonus[e]||0)+(s.boost?s.boost[e]||0:0));if(side==='me')for(const k in s.cons)o['c:'+k]=s.cons[k];return o;}
export function canPay(card,side){if(side==='ai'&&card.cons)return false;const p=pool(side),sp=S.match[side].spent||{};for(const k in card.cost){if((p[k]||0)-(sp[k]||0)<card.cost[k])return false;}return true;}
export function takeCard(card,side){const m=S.match,s=m[side];s.spent=s.spent||{};for(const k in card.cost)s.spent[k]=(s.spent[k]||0)+card.cost[k];
 m.market[card.t]=m.market[card.t].filter(c=>c.id!==card.id);mRefill(card.t);s.cards.push(card);s.fav+=card.fav;s.pending=(s.pending||[]);s.pending.push(card);}
export function settle(side){const s=S.match[side];(s.pending||[]).forEach(c=>{s.bonus[c.el]=(s.bonus[c.el]||0)+c.give;});s.pending=[];s.spent={};}
export function cardValue(c,side){const aff=GODS[S.match.god].aff.includes(c.el)?.6:0;let cs=0;for(const k in c.cost)cs+=c.cost[k];return(c.fav*3+c.give*1.4+aff)/Math.max(1,cs*.25);}
export function aiTurn(){
 const m=S.match;m.ai.spent={};const bought=[];
 for(let g=0;g<AI_MAX;g++){const cand=[1,2,3].flatMap(t=>m.market[t]).filter(c=>canPay(c,'ai'));if(!cand.length)break;cand.sort((a,b)=>cardValue(b)-cardValue(a));const c=cand[0];takeCard(c,'ai');bought.push(c.n+(c.fav?' (✦'+c.fav+')':''));}
 if(m.turn%3===0){const e=GODS[m.god].aff[Math.floor(Math.random()*2)];m.ai.boost=m.ai.boost||{};m.ai.boost[e]=(m.ai.boost[e]||0)+1;bought.push('invoque +1 '+ELEM[e].toLowerCase());}
 settle('ai');
 m.log.unshift('Tour '+m.turn+' · '+GODS[m.god].n+' : '+(bought.length?bought.join(', '):'passe son tour')+'.');
}
export function endTurn(){
 const m=S.match;if(!m||m.over)return;
 const mine=(m.me.pending||[]).map(c=>c.n+(c.fav?' (✦'+c.fav+')':''));
 m.log.unshift('Tour '+m.turn+' · Sanctuaire : '+(mine.length?mine.join(', '):'aucune carte')+'.');
 settle('me');aiTurn();
 if(m.me.fav>=DUEL_WIN||m.ai.fav>=DUEL_WIN||m.turn>=DUEL_TURNS){finishDuel();return;}
 m.turn++;
}
export function totalBonus(s){let t=0;for(const e in s.bonus)t+=s.bonus[e];return t;}
export function finishDuel(forfeit){
 const m=S.match;m.over=true;const g=godState(m.god);
 let res;if(forfeit)res='lose';else if(m.me.fav!==m.ai.fav)res=m.me.fav>m.ai.fav?'win':'lose';else{const a=totalBonus(m.me),b=totalBonus(m.ai);res=a===b?'draw':a>b?'win':'lose';}
 m.result=res;
 if(res==='win'){g.losses++;S.faveur=(S.faveur||0)+m.me.fav;log('★ Le Pope l’emporte sur '+GODS[m.god].n+' ('+m.me.fav+' ✦ contre '+m.ai.fav+').');if(!m.me.cards.length){S.match=null;}}
 else if(res==='lose'){g.wins++;g.lv++;const bestEl=EKEYS.slice().sort((a,b)=>(m.ai.bonus[b]||0)-(m.ai.bonus[a]||0))[0];g.bonus[bestEl]=(g.bonus[bestEl]||0)+1;log(GODS[m.god].n+' l’emporte et en sort grandi'+(m.god==='eris'||m.god==='artemis'||m.god==='demeter'?'e':'')+' (niveau '+g.lv+').');}
 else log('Duel indécis contre '+GODS[m.god].n+'.');
}
export function keepCard(id){const m=S.match;if(!m||m.result!=='win')return;const c=m.me.cards.find(x=>x.id===id);if(!c)return;
 S.perm.push({n:c.n,el:c.el,t:c.t,eff:c.eff,unlock:c.unlock||null,fav:c.fav,god:m.god});recomputeCB();log('Le Sanctuaire garde à jamais « '+c.n+' ».');S.match=null;}
export function boostCost(e){const m=S.match;const c={};c[BOOST[e].res]=Math.round(BOOST[e].q*m.P/4*Math.pow(1.5,m.me.boosts||0));return c;}
