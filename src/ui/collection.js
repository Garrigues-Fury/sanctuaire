/* Épreuves des chevaliers et menu de collectionneur (demandés par Seba le 2026-10-27).
   - Épreuves : la réserve d'entraînement à répartir, les mini-jeux (ouverts par le porteur de leur armure),
     et les objectifs de chacun de vos chevaliers.
   - Collection : une carte par constellation (88), avec son porteur, son épreuve et le bonus gagné à 100 %. */
import { CONS, CONS_BY, ELEM, RANKS, armorName } from '../core/data/world.js';
import { GAMES, GAME_OF_CONS, MG_LEVELS, BONUS_N, bonusText, epBonus } from '../core/data/minigames.js';
import { DAY_FULL, ensureMG, mgOf, mgUnlocked } from '../core/minigames.js';
import { bearerOf, cardStats, epreuveOf, isDone, objValue, progressOf, seenCons } from '../core/epreuves.js';
import { armorImg } from '../core/data/art.js';
import { people, power } from '../core/rules.js';
import { S } from '../core/state.js';
import { esc, fmt } from '../core/util.js';
import { bar, ptImg } from './app.js';
import { icon } from './icons.js';

const pct=v=>Math.round(v*100)+' %';
function objList(c,p){
 const e=epreuveOf(c);
 if(e.type==='jeu'){const d=(S.mg&&S.mg[e.game.k]&&S.mg[e.game.k].done)||0;return '<div class="obj"><span>Mini-jeu : '+esc(e.game.n)+'</span><b class="num">'+d+' / '+MG_LEVELS+'</b>'+bar(d/MG_LEVELS*100,'','green')+'</div>';}
 return e.objs.map(o=>{const [v,n]=objValue(o,p,c),ok=v>=n;return '<div class="obj'+(ok?' ok':'')+'"><span>'+(ok?'✓ ':'')+esc(o.t)+'</span><b class="num">'+Math.min(v,n)+' / '+n+'</b>'+bar(Math.min(1,v/n)*100,'','green')+'</div>';}).join('');
}

/* ---------- épreuves ---------- */
export function viewEpreuves(){
 ensureMG();
 const P=people().filter(p=>!S.pending.includes(p));
 let h='<section class="sec"><div class="sec-h"><h2>Réserve d’entraînement</h2><span class="aside"><b class="num">'+S.xpPool+'</b> h</span></div>';
 h+='<p class="hint">Les mini-jeux remplissent cette réserve. Donnez-en des heures à qui vous voulez : elles comptent comme autant d’heures d’entraînement.</p>';
 h+='<div class="pool"><select id="poolWho" aria-label="Personnage">'+P.map(p=>'<option value="'+p.id+'">'+esc(p.name)+' · niv. '+p.lv+'</option>').join('')+'</select><div class="btns"><button class="btn sm" data-act="pool:1"'+(S.xpPool>=1?'':' disabled')+'>+1 h</button><button class="btn sm" data-act="pool:5"'+(S.xpPool>=5?'':' disabled')+'>+5 h</button><button class="btn sm ghost" data-act="pool:all"'+(S.xpPool>0?'':' disabled')+'>Tout</button></div></div></section>';
 h+='<section class="sec"><div class="sec-h"><h2>Mini-jeux</h2><span class="aside">aujourd’hui : '+S.mgDay.n+' niveau'+(S.mgDay.n>1?'x':'')+' réussi'+(S.mgDay.n>1?'s':'')+'</span></div><p class="hint">Chaque jeu compte '+MG_LEVELS+' niveaux de plus en plus durs, puis il est fini. Il s’ouvre quand son armure a un porteur. Les '+DAY_FULL+' premiers niveaux réussis chaque jour rapportent tout ; ensuite, un quart.</p><div class="mg-list">';
 GAMES.forEach(g=>{const c=CONS_BY[g.cons],b=mgUnlocked(g.k),st=mgOf(g.k),next=Math.min(MG_LEVELS,st.done+1),fin=st.done>=MG_LEVELS;
  h+='<div class="mg-card'+(b?'':' locked')+(fin?' done':'')+'"><div class="mg-h">'+(b?ptImg(b,b.rank):'<span class="mg-lock">'+icon('block',22)+'</span>')+'<div><b>'+esc(g.n)+'</b><small>'+esc(armorName(c))+' · '+(b?'porteur : '+esc(b.name):'en attente d’un porteur')+'</small></div></div>'+
   '<p>'+esc(g.d)+'</p><div class="obj"><span>Niveaux</span><b class="num">'+st.done+' / '+MG_LEVELS+'</b>'+bar(st.done/MG_LEVELS*100,'','green')+'</div>'+
   '<small class="hint">Gains : réserve d’entraînement, et '+g.st.map(s=>({fo:'force',vi:'vitesse',de:'dextérité',en:'endurance',ps:'psychokinésie',co:'cosmos'})[s]).join(' et ')+' pour le porteur. À 100 % : '+bonusText(epBonus(g.cons))+'.</small>'+
   (b?'<div class="btns"><button class="btn" data-act="mg:'+g.k+':'+next+'">'+(fin?'Rejouer le niveau '+MG_LEVELS:'Jouer le niveau '+next)+'</button>'+(st.done>0?'<select data-mglv="'+g.k+'" aria-label="Rejouer un niveau"><option value="">Rejouer…</option>'+Array.from({length:Math.min(st.done,MG_LEVELS)},(_,i)=>'<option value="'+(i+1)+'">Niveau '+(i+1)+'</option>').join('')+'</select>':'')+'</div>':'<p class="hint">Débloqué quand un chevalier portera l’armure '+esc(armorName(c).replace(/^Armure /,''))+'.</p>')+'</div>';});
 h+='</div></section>';
 const mine=S.knights.filter(k=>k.cons&&CONS_BY[k.cons]).sort((a,b)=>progressOf(CONS_BY[b.cons])-progressOf(CONS_BY[a.cons]));
 h+='<section class="sec"><div class="sec-h"><h2>Épreuves de vos chevaliers</h2></div><p class="hint">Chaque chevalier a son épreuve : un mini-jeu à finir, ou des objectifs à remplir. À 100 %, le Sanctuaire gagne un bonus pour toujours, et sa carte de collection devient dorée.</p><div class="ep-list">';
 mine.forEach(k=>{const c=CONS_BY[k.cons],d=isDone(c.k);
  h+='<div class="ep'+(d?' done':'')+'"><div class="ep-h">'+ptImg(k,k.rank)+'<div><b>'+esc(k.name)+'</b><small>'+esc(armorName(c))+'</small></div><b class="num ep-p">'+(d?'✓':pct(progressOf(c)))+'</b></div>'+objList(c,k)+'<small class="hint">'+(d?'Accomplie : ':'À 100 % : ')+bonusText(epBonus(c.k))+'</small></div>';});
 return h+'</div></section>';
}

/* ---------- collection ---------- */
const RANK_ORDER=['or','argent','bronze'];
function card(c){
 const seen=seenCons().includes(c.k)||isDone(c.k),b=bearerOf(c),d=isDone(c.k),p=progressOf(c);
 const img=b?ptImg(b,b.rank):armorImg(c.k,true)?'<img class="pt" src="'+armorImg(c.k,true)+'" alt="">':'<span class="cc-q">'+(seen?esc(c.n[0]):'?')+'</span>';
 return '<button class="ccard '+c.rank+(d?' done':'')+(seen?'':' unseen')+'" data-act="ccard:'+c.k+'" aria-label="'+esc(c.n)+'">'+img+'<b>'+esc(c.n)+'</b><small>'+(d?'✓ accomplie':seen?pct(p):'inconnue')+'</small><i class="cc-bar"><i style="width:'+Math.round(p*100)+'%"></i></i></button>';
}
export function viewCollection(){
 const seen=seenCons(),done=S.epDone||[];
 const tot={};done.forEach(k=>{const b=epBonus(k);if(b)tot[b.key]=(tot[b.key]||0)+b.v;});
 let h='<section class="sec"><div class="coll-kpis"><div><b class="num">'+seen.length+'</b><span>cartes découvertes / 88</span></div><div><b class="num">'+done.length+'</b><span>épreuves accomplies</span></div><div><b class="num">'+GAMES.reduce((t,g)=>t+mgOf(g.k).done,0)+'</b><span>niveaux de mini-jeux / '+GAMES.length*MG_LEVELS+'</span></div></div>';
 h+=Object.keys(tot).length?'<p class="hint">Bonus gagnés : '+Object.entries(tot).map(([k,v])=>'+'+v+' % '+BONUS_N[k]).join(' · ')+'.</p>':'<p class="hint">Aucun bonus encore : finissez l’épreuve d’un chevalier pour dorer sa carte.</p>';
 h+='</section>';
 RANK_ORDER.forEach(r=>{const L=CONS.filter(c=>c.rank===r);
  h+='<section class="sec"><div class="sec-h"><h2>'+RANKS[r]+'</h2><span class="aside">'+L.filter(c=>isDone(c.k)).length+' / '+L.length+'</span></div><div class="coll">'+L.map(card).join('')+'</div></section>';});
 return h;
}
// Détail d'une carte (fenêtre).
export function cardModal(k){return()=>{
 const c=CONS_BY[k],b=bearerOf(c),s=cardStats(b),d=isDone(k),seen=seenCons().includes(k)||d,e=epreuveOf(c);
 let h='<div class="sheet-head">'+(b?ptImg(b,b.rank,true):'')+'<div class="main"><h2>'+esc(c.n)+'</h2><div class="hint">'+esc(armorName(c))+' · '+ELEM[c.el]+'</div></div></div>';
 if(!seen)return h+'<p class="hint">Cette armure n’a encore jamais eu de porteur au Sanctuaire.</p>';
 h+='<div class="sec-h"><h2>Épreuve</h2><span class="aside">'+(d?'✓ accomplie':pct(progressOf(c)))+'</span></div>'+(e.type==='jeu'?'<p class="hint">'+esc(e.game.d)+'</p>':'')+objList(c,b);
 h+='<p class="hint">'+(d?'Bonus gagné : ':'À 100 % : ')+bonusText(epBonus(k))+' pour tout le Sanctuaire.</p>';
 if(b)h+='<div class="sec-h"><h2>Palmarès de '+esc(b.name)+'</h2></div><div class="coll-kpis"><div><b class="num">'+s.lv+'</b><span>niveau</span></div><div><b class="num">'+fmt(power(b,b.rank))+'</b><span>puissance</span></div><div><b class="num">'+s.mw+'</b><span>missions réussies</span></div><div><b class="num">'+s.w+'</b><span>ennemis vaincus</span></div></div><button class="btn ghost" data-act="knight:'+b.id+'">Ouvrir sa fiche</button>';
 return h;
};}
