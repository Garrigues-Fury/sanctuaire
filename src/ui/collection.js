/* Épreuves des chevaliers et menu de collectionneur (demandés par Seba le 2026-10-27).
   - Épreuves : la réserve d'entraînement à répartir, les défis physiques réels (GPX ou sur l'honneur),
     et le mini-jeu de chacun de vos chevaliers.
   - Collection : une carte par constellation (88), avec son porteur, son épreuve et le bonus gagné à 100 %. */
import { CONS, CONS_BY, ELEM, RANKS, armorName } from '../core/data/world.js';
import { MG_LEVELS, BONUS_N, bonusText, epBonus, gameOf } from '../core/data/minigames.js';
import { DEFI_OF_CONS, DEFI_TYPES, DEFI_REST_H } from '../core/data/defis.js';
import { DAY_FULL, ensureMG, mgOf } from '../core/minigames.js';
import { defiOf, ensureDefis, nextStep } from '../core/defis.js';
import { bearerOf, cardStats, epreuveOf, isDone, progressOf, seenCons } from '../core/epreuves.js';
import { armorImg } from '../core/data/art.js';
import { people, power } from '../core/rules.js';
import { S } from '../core/state.js';
import { dur, esc, fmt } from '../core/util.js';
import { bar, ptImg } from './app.js';
import { icon } from './icons.js';

const pct=v=>Math.round(v*100)+' %';
const STN={fo:'force',vi:'vitesse',de:'dextérité',en:'endurance',ps:'psychokinésie',co:'cosmos'};
let defArm=null;
export function armDefi(k){defArm=defArm===k?null:k;}

// Le jeu d'une constellation : avancement et boutons pour jouer.
function gameBlock(c,b){
 const g=gameOf(c.k),st=mgOf(c.k),next=Math.min(MG_LEVELS,st.done+1),fin=st.done>=MG_LEVELS;
 let h='<div class="obj"><span>'+esc(g.n)+' <small class="chip">'+esc(g.dom)+'</small></span><b class="num">'+st.done+' / '+MG_LEVELS+'</b>'+bar(st.done/MG_LEVELS*100,'','green')+'</div>';
 if(!b)return h+'<p class="hint">S’ouvrira quand un chevalier portera cette armure.</p>';
 return h+'<div class="btns"><button class="btn sm" data-act="mg:'+c.k+':'+next+'">'+(fin?'Rejouer le niveau '+MG_LEVELS:'Jouer le niveau '+next)+'</button>'+(st.done>0?'<select data-mglv="'+c.k+'" aria-label="Rejouer un niveau"><option value="">Rejouer…</option>'+Array.from({length:Math.min(st.done,MG_LEVELS)},(_,i)=>'<option value="'+(i+1)+'">Niveau '+(i+1)+'</option>').join('')+'</select>':'')+'</div>';
}
// Un défi physique : palier suivant, repos, validation.
function defiBlock(c){
 const t=DEFI_OF_CONS[c.k],T=DEFI_TYPES[t],d=defiOf(c.k),st=nextStep(c.k),n=T.steps.length;
 let h='<div class="obj"><span>'+esc(T.n)+'</span><b class="num">'+d.done+' / '+n+'</b>'+bar(d.done/n*100,'','green')+'</div>';
 if(!st)return h+'<p class="hint">Défi terminé : bravo !</p>';
 h+='<p class="defi-next">Palier '+(st.i+1)+' : <b>'+esc(st.text)+'</b></p>';
 if(!st.ready)return h+'<p class="hint">Repos : prochain palier dans '+dur((st.readyAt-Date.now())/3600e3)+'. Le repos fait partie de l’entraînement.</p>';
 if(T.gpx)return h+'<label class="btn sm gpx">'+icon('map',16)+' Importer la sortie (fichier GPX)<input type="file" accept=".gpx,application/gpx+xml,application/xml,text/xml" data-gpx="'+c.k+'" hidden></label><p class="hint">Exporte la sortie depuis ton appli de sport (Strava, Komoot, Garmin…) au format GPX. Le fichier est lu sur le téléphone, rien n’est envoyé.</p>';
 return h+(defArm===c.k?'<div class="btns"><button class="btn sm" data-act="defyes:'+c.k+'">Oui, je l’ai vraiment fait</button><button class="btn sm ghost" data-act="defarm:'+c.k+'">Annuler</button></div>':'<button class="btn sm" data-act="defarm:'+c.k+'">C’est fait (sur l’honneur)</button>');
}

/* ---------- épreuves ---------- */
export function viewEpreuves(){
 ensureMG();ensureDefis();
 const P=people().filter(p=>!S.pending.includes(p));
 // défis physiques
 const DC=CONS.filter(c=>DEFI_OF_CONS[c.k]).sort((a,b)=>(nextStep(b.k)?.ready?1:0)-(nextStep(a.k)?.ready?1:0));
 let h='<section class="sec"><div class="sec-h"><h2>Défis du Sanctuaire</h2><span class="aside">dans la vraie vie</span></div><p class="hint">Ces épreuves, c’est vous qui les accomplissez. Dix paliers chacune, un par jour au plus ('+DEFI_REST_H+' h de repos). Échauffez-vous, écoutez votre corps, et ne trichez pas : c’est vous que le Sanctuaire veut rendre meilleur. Chaque palier rapporte de 6 à 15 h à la réserve et des statistiques au porteur de l’armure ; à 100 %, un bonus double.</p><div class="ep-list">';
 DC.forEach(c=>{const b=bearerOf(c),d=isDone(c.k);h+='<div class="ep'+(d?' done':'')+'"><div class="ep-h">'+(b?ptImg(b,b.rank):'<span class="mg-lock">'+icon('bolt',20)+'</span>')+'<div><b>'+esc(armorName(c))+'</b><small>'+(b?'porteur : '+esc(b.name):'sans porteur pour l’instant')+'</small></div><b class="num ep-p">'+(d?'✓':pct(progressOf(c)))+'</b></div>'+defiBlock(c)+'<small class="hint">'+(d?'Accompli : ':'À 100 % : ')+bonusText(epBonus(c.k))+'.</small></div>';});
 h+='</div></section>';
 h+='<section class="sec"><div class="sec-h"><h2>Réserve d’entraînement</h2><span class="aside"><b class="num">'+S.xpPool+'</b> h</span></div>';
 h+='<p class="hint">Les mini-jeux et les défis remplissent cette réserve. C’est vous qui choisissez à qui donner ces heures : elles comptent comme autant d’heures d’entraînement pour lui.</p>';
 h+='<div class="pool"><select id="poolWho" aria-label="Personnage">'+P.map(p=>'<option value="'+p.id+'">'+esc(p.name)+' · niv. '+p.lv+'</option>').join('')+'</select><div class="btns"><button class="btn sm" data-act="pool:1"'+(S.xpPool>=1?'':' disabled')+'>+1 h</button><button class="btn sm" data-act="pool:5"'+(S.xpPool>=5?'':' disabled')+'>+5 h</button><button class="btn sm ghost" data-act="pool:all"'+(S.xpPool>0?'':' disabled')+'>Tout</button></div></div></section>';
 // mini-jeux des chevaliers
 const mine=S.knights.filter(k=>k.cons&&CONS_BY[k.cons]&&gameOf(k.cons)).sort((a,b)=>progressOf(CONS_BY[b.cons])-progressOf(CONS_BY[a.cons]));
 h+='<section class="sec"><div class="sec-h"><h2>Les jeux de vos chevaliers</h2><span class="aside">aujourd’hui : '+S.mgDay.n+' niveau'+(S.mgDay.n>1?'x':'')+'</span></div><p class="hint">Chaque chevalier a son jeu : 20 niveaux de plus en plus durs (l’argent et l’or partent de plus haut), puis il est fini. Les '+DAY_FULL+' premiers niveaux réussis chaque jour rapportent tout, les suivants un quart.</p><div class="ep-list">';
 mine.forEach(k=>{const c=CONS_BY[k.cons],d=isDone(c.k),g=gameOf(c.k);
  h+='<div class="ep'+(d?' done':'')+'"><div class="ep-h">'+ptImg(k,k.rank)+'<div><b>'+esc(k.name)+'</b><small>'+esc(armorName(c))+' · gagne '+g.st.map(s=>STN[s]).join(' et ')+'</small></div><b class="num ep-p">'+(d?'✓':pct(progressOf(c)))+'</b></div><p class="hint">'+esc(g.d)+'</p>'+gameBlock(c,k)+'<small class="hint">'+(d?'Accomplie : ':'À 100 % : ')+bonusText(epBonus(c.k))+'.</small></div>';});
 return h+'</div></section>';
}

/* ---------- collection ---------- */
const RANK_ORDER=['or','argent','bronze'];
function card(c){
 const seen=seenCons().includes(c.k)||isDone(c.k)||!!DEFI_OF_CONS[c.k],b=bearerOf(c),d=isDone(c.k),p=progressOf(c);
 const img=b?ptImg(b,b.rank):armorImg(c.k,true)?'<img class="pt" src="'+armorImg(c.k,true)+'" alt="">':'<span class="cc-q">'+(seen?esc(c.n[0]):'?')+'</span>';
 return '<button class="ccard '+c.rank+(d?' done':'')+(seen?'':' unseen')+'" data-act="ccard:'+c.k+'" aria-label="'+esc(c.n)+'">'+img+'<b>'+esc(c.n)+'</b><small>'+(d?'✓ accomplie':seen?pct(p):'inconnue')+'</small><i class="cc-bar"><i style="width:'+Math.round(p*100)+'%"></i></i></button>';
}
export function viewCollection(){
 const seen=seenCons(),done=S.epDone||[];
 const tot={};done.forEach(k=>{const b=epBonus(k);if(b)tot[b.key]=(tot[b.key]||0)+b.v;});
 const lv=CONS.reduce((t,c)=>t+(gameOf(c.k)?mgOf(c.k).done:0),0);
 let h='<section class="sec"><div class="coll-kpis"><div><b class="num">'+seen.length+'</b><span>cartes découvertes / 88</span></div><div><b class="num">'+done.length+'</b><span>épreuves accomplies</span></div><div><b class="num">'+lv+'</b><span>niveaux de jeux réussis</span></div><div><b class="num">'+CONS.reduce((t,c)=>t+(DEFI_OF_CONS[c.k]?defiOf(c.k).done:0),0)+'</b><span>paliers de défis réels</span></div></div>';
 h+=Object.keys(tot).length?'<p class="hint">Bonus gagnés : '+Object.entries(tot).map(([k,v])=>'+'+v+' % '+BONUS_N[k]).join(' · ')+'.</p>':'<p class="hint">Aucun bonus encore : finissez l’épreuve d’un chevalier pour dorer sa carte.</p>';
 h+='</section>';
 RANK_ORDER.forEach(r=>{const L=CONS.filter(c=>c.rank===r);
  h+='<section class="sec"><div class="sec-h"><h2>'+RANKS[r]+'</h2><span class="aside">'+L.filter(c=>isDone(c.k)).length+' / '+L.length+'</span></div><div class="coll">'+L.map(card).join('')+'</div></section>';});
 return h;
}
// Détail d'une carte (fenêtre).
export function cardModal(k){return()=>{
 const c=CONS_BY[k],b=bearerOf(c),s=cardStats(b),d=isDone(k),e=epreuveOf(c),seen=seenCons().includes(k)||d||e.type==='defi';
 let h='<div class="sheet-head">'+(b?ptImg(b,b.rank,true):'')+'<div class="main"><h2>'+esc(c.n)+'</h2><div class="hint">'+esc(armorName(c))+' · '+ELEM[c.el]+'</div></div></div>';
 if(!seen)return h+'<p class="hint">Cette armure n’a encore jamais eu de porteur au Sanctuaire.</p>';
 h+='<div class="sec-h"><h2>Épreuve</h2><span class="aside">'+(d?'✓ accomplie':pct(progressOf(c)))+'</span></div>';
 h+=e.type==='defi'?'<p class="hint">Défi réel : '+esc(e.T.n.toLowerCase())+', en dix paliers.</p>'+defiBlock(c):'<p class="hint">'+esc(e.game.d)+'</p>'+gameBlock(c,b);
 h+='<p class="hint">'+(d?'Bonus gagné : ':'À 100 % : ')+bonusText(epBonus(k))+' pour tout le Sanctuaire.</p>';
 if(b)h+='<div class="sec-h"><h2>Palmarès de '+esc(b.name)+'</h2></div><div class="coll-kpis"><div><b class="num">'+s.lv+'</b><span>niveau</span></div><div><b class="num">'+fmt(power(b,b.rank))+'</b><span>puissance</span></div><div><b class="num">'+s.mw+'</b><span>missions réussies</span></div><div><b class="num">'+s.w+'</b><span>ennemis vaincus</span></div></div><button class="btn ghost" data-act="knight:'+b.id+'">Ouvrir sa fiche</button>';
 return h;
};}
