/* Moments de gloire, en plein écran (demandés par Seba le 2026-10-28) : au retour dans le jeu, chaque personnage qui a
   progressé apparaît en grand, sous une pluie de lauriers, avec ce qu'il a accompli. Un toucher passe au suivant ;
   « Tout passer » mène directement à la liste des événements. Même chose pour les bâtiments terminés. */
import { BUILD } from '../core/data/economy.js';
import { CONS_BY, SIGNS, armorName, de } from '../core/data/world.js';
import { SANCT_VIEWS } from '../core/data/art.js';
import { byId } from '../core/rules.js';
import { clearGlory, gloryQueue } from '../core/glory.js';
import { save } from '../core/save.js';
import { S } from '../core/state.js';
import { esc } from '../core/util.js';
import { sfx } from '../audio/audio.js';
import { fullBody } from './portraits.js';
import { icon } from './icons.js';

const CHEERS=[
 'Félicitations, {n} !',
 'Bravo, {n} : le Sanctuaire est fier de {toi}.',
 'Au bout d’un entraînement insensé, {n} a franchi un cap.',
 'La déesse Athéna a vu en {lui} un espoir nouveau.',
 'Les étoiles de sa constellation brillent un peu plus fort ce soir.',
 'Les anciens murmurent son nom dans les couloirs du Sanctuaire.',
 'Sueur, sang et cosmos : {n} ne lâche rien.',
 'Le Grand Pope hoche la tête. {n} est sur la bonne voie.',
 'Même les maîtres les plus durs ont dû l’admettre : {n} progresse.',
 'Dans l’arène, on ne parle plus que {delui}.',
 'Un pas de plus vers la légende.',
 'Le cosmos de {n} brûle plus haut que jamais.',
 'Les apprentis regardent {n} avec des étoiles plein les yeux.',
 'Rien ne résiste à la persévérance de {n}.',
 'Un exploit que la Chronique retiendra.',
 'Athéna sourit : {n} grandit, jour après jour.'
];
const BUILD_CHEERS=['Les bâtisseurs ont tenu parole.','Pierre après pierre, le Sanctuaire renaît.','Les villageois applaudissent : le chantier est terminé !','Le marbre brille de nouveau au soleil couchant.','Une victoire de plus sur les ruines.'];
const B_ICON={champs:'wheat',carriere:'block',mine:'ingot',biblio:'book',jardin:'leaf',herbo:'leaf',atelier:'hammer',arene:'sword',dortoirs:'users',entrepot:'block',forge:'armor',artisans:'users'};
const pick=a=>a[Math.floor(Math.random()*a.length)];
let root=null,cards=[],i=0,after=null;

export function hasGlory(){return!!(S&&S.glory&&S.glory.length);}
// Ouvre la séquence ; then() est appelé à la fin (par exemple, le résumé d'absence).
export function openGlory(then){
 cards=gloryQueue().filter(c=>c.k==='b'||byId(c.pid));after=then||null;i=0;
 clearGlory();save();
 if(!cards.length){if(after)after();return;}
 if(!root){root=document.createElement('div');root.id='glory';document.body.appendChild(root);root.addEventListener('click',onClick);}
 root.hidden=false;draw();sfx('milestone');
}
function done(){if(root)root.hidden=true;cards=[];const f=after;after=null;if(f)f();}
function onClick(e){
 if(e.target.closest('[data-gl="skip"]')){sfx('close');done();return;}
 i++;if(i>=cards.length){done();return;}
 sfx('milestone');draw();
}
function laurels(){let s='';for(let k=0;k<16;k++){const l=Math.random()*100,d=Math.random()*2.5,t=3.5+Math.random()*3,r=Math.random()*360,sz=18+Math.random()*16;
 s+='<i class="laurel" style="left:'+l.toFixed(1)+'%;animation-delay:'+d.toFixed(2)+'s;animation-duration:'+t.toFixed(2)+'s;--r:'+r.toFixed(0)+'deg;width:'+sz.toFixed(0)+'px"><svg viewBox="0 0 24 40"><path d="M12 39 C12 26 12 14 12 2" stroke="#8a6a1e" stroke-width="1.4" fill="none"/>'+
  [6,13,20,27].map(y=>'<ellipse cx="7" cy="'+y+'" rx="5" ry="2.6" transform="rotate(-35 7 '+y+')" fill="#e8c35a"/><ellipse cx="17" cy="'+(y+3)+'" rx="5" ry="2.6" transform="rotate(35 17 '+(y+3)+')" fill="#d4a93c"/>').join('')+'</svg></i>';}
 return '<div class="laurels" aria-hidden="true">'+s+'</div>';}
// Ce que le personnage a accompli, en clair.
function feats(c,p){
 const out=[];
 if(c.lv>c.lv0)out.push(c.lv-c.lv0>1?'Gagne '+(c.lv-c.lv0)+' niveaux : niveau '+c.lv:'Atteint le niveau '+c.lv);
 c.ev.forEach(e=>{
  if(e.t==='skill')out.push('Découvre une compétence : '+e.v);
  if(e.t==='tech')out.push('Découvre une technique : '+e.v);
  if(e.t==='awk')out.push('Son cosmos s’éveille pour la première fois');
  if(e.t==='armor'&&CONS_BY[e.v])out.push('Obtient l’'+armorName(CONS_BY[e.v]).replace(/^A/,'a'));
  if(e.t==='ep'&&CONS_BY[e.v])out.push('Accomplit l’épreuve de '+CONS_BY[e.v].n);
 });
 return out;
}
function draw(){
 const c=cards[i],n=cards.length,foot='<div class="gl-foot"><span>Touchez pour continuer · '+(i+1)+' / '+n+'</span><button class="btn sm ghost" data-gl="skip">Tout passer ›</button></div>';
 if(c.k==='b'){
  const house=/^h\d+$/.test(c.b),hi=house?+c.b.slice(1):0,name=house?'Maison '+de(SIGNS[hi].n):BUILD[c.b].n;
  const now=house?houseText(hi,c.lvl):BUILD[c.b].eff(c.lvl),before=house?(c.lvl0>0?houseText(hi,c.lvl0):'en ruines'):BUILD[c.b].eff(Math.max(0,c.lvl0));
  root.innerHTML='<div class="gl-card build" style="--bg:url('+SANCT_VIEWS[i%SANCT_VIEWS.length].src+')">'+laurels()+'<div class="gl-ico">'+icon(house?'temple':B_ICON[c.b]||'hammer',84)+'</div>'+
   '<h2>'+esc(name)+'</h2><p class="gl-sub">Niveau '+c.lvl+'</p><p class="gl-cheer">'+esc(pick(BUILD_CHEERS))+'</p>'+
   '<div class="gl-feats"><div><b>Désormais</b> '+esc(now)+'</div>'+(c.lvl0>0||house?'<div class="was">Avant : '+esc(before)+'</div>':'')+'</div>'+foot+'</div>';
  return;
 }
 const p=byId(c.pid),rank=S.knights.includes(p)?p.rank:(S.guards||[]).includes(p)?'garde':null,cons=p.cons&&CONS_BY[p.cons];
 const sub=(cons?armorName(cons):rank==='garde'?'Garde du Sanctuaire':'Apprenti'+(p.sex==='F'?'e':''))+' · niveau '+p.lv;
 const cheer=pick(CHEERS).replace(/\{n\}/g,p.name).replace(/\{lui\}/g,p.sex==='F'?'elle':'lui').replace(/\{toi\}/g,'toi').replace(/\{delui\}/g,p.sex==='F'?'d’elle':'de lui');
 root.innerHTML='<div class="gl-card">'+laurels()+'<img class="gl-img" src="'+fullBody(p,rank)+'" alt="'+esc(p.name)+'">'+
  '<div class="gl-text"><h2>'+esc(p.name)+'</h2><p class="gl-sub">'+esc(sub)+'</p><p class="gl-cheer">'+esc(cheer)+'</p><div class="gl-feats">'+feats(c,p).map(f=>'<div>'+esc(f)+'</div>').join('')+'</div></div>'+foot+'</div>';
}
function houseText(hi,l){return'+'+10*l+' % d’XP pour les apprentis '+de(SIGNS[hi].n)+', et une maison plus solide face aux attaques';}
