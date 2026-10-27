/* Aide contextuelle : une bulle explique un symbole.
   À la souris : au survol. Au doigt : toucher un symbole l'explique ; sur un bouton, un appui long (sans déclencher l'action).
   Tout élément portant data-tip (ou title) en profite. Les textes courants sont rassemblés ici. */
import { esc } from '../core/util.js';

export const TIP={
 nrg:'Énergie : se recharge seule avec le temps (environ 4 par heure). Elle sert aux entraînements, au travail sur soi, aux entraînements à deux et aux expéditions (30).',
 sp:'Points de compétence à répartir : chaque niveau en donne. Ouvrez la fiche et touchez « + » sur une caractéristique.',
 lv:'Niveau : il monte avec l’expérience, gagnée en temps réel, à l’entraînement et en expédition.',
 fo:'Force : les dégâts de vos coups en combat. Au Sanctuaire, elle aide à la carrière, à la mine et à l’atelier.',
 vi:'Vitesse : esquiver et faire esquiver en combat.',
 de:'Dextérité : la précision. En combat, l’ennemi esquive moins et les coups précis font 50 % de dégâts en plus. Utile à l’atelier, et pour certaines actions en mission.',
 ps:'Psychokinésie : la force de l’esprit. En combat, une barrière amortit les coups (jusqu’à 20 %) et le cosmos démarre plus haut. Utile à l’herboristerie, et pour certaines actions en mission.',
 en:'Endurance : les points de vie et la défense en combat, et une formation plus rapide. Utile aux champs et au jardin.',
 co:'Cosmos : la puissance des techniques et du coup ultime. Il compte pour les épreuves d’armure et pour la lecture des astres.',
 hearts:'Amitié, de 0 à 10 : chaque niveau donne +1 % d’XP aux deux personnes (+2 % entre maître et apprenti), 30 % au plus.',
 power:'Puissance du Sanctuaire : la force cumulée de vos chevaliers, apprentis et maisons relevées.',
 cons:'Score des constellations : le poids de vos chevaliers selon leur rang et leur niveau. Certaines cartes et alertes le demandent.',
 elem:'Score d’élément : le poids de vos personnages nés sous cet élément (rang et cosmos compris). Il donne des bonus de départ dans la lecture des astres.',
 danger:'Danger, de ★ (bronze débutant) à ★★★★★ (chevalier d’or).',
 faveur:'Faveur d’Athéna : les ✦ gagnés dans la lecture des astres et en expédition.',
 or:'Chevalier d’or : les douze gardiens des maisons du zodiaque, au sommet de la hiérarchie.',
 vet:'Vétéran : survivant de la guerre sainte précédente. Ses points forts dépassent le niveau 20 en compétences (sur 30).',
 argent:'Chevalier d’argent : l’élite intermédiaire, 24 armures.',
 bronze:'Chevalier de bronze : la première marche des chevaliers, 52 armures.',
 garde:'Garde : un apprenti qui défend une maison, le village ou un site. Il continue de s’entraîner.',
 vivres:'Vivres : nourrissent tout le monde (chacun en mange chaque heure). En cas de famine, l’entraînement ralentit de moitié.',
 marbre:'Marbre : pour bâtir et relever les maisons.',
 metal:'Métal : pour bâtir, forger les armures et fabriquer des lingots.',
 savoir:'Savoir : pour les bâtiments avancés, l’étude et les armures d’argent et d’or.'
};
export const tip=(t)=>' data-tip="'+esc(TIP[t]||t)+'"';

let el=null,timer=null,longShown=false;
function show(target){
 const text=target.dataset.tip;if(!text)return;
 if(!el){el=document.createElement('div');el.id='gtip';el.setAttribute('role','tooltip');document.body.appendChild(el);}
 el.innerHTML=esc(text).replace(/\n/g,'<br>');el.hidden=false;
 const r=target.getBoundingClientRect(),w=Math.min(300,window.innerWidth-24);el.style.maxWidth=w+'px';
 const tw=el.offsetWidth,th=el.offsetHeight;
 let x=r.left+r.width/2-tw/2;x=Math.max(12,Math.min(window.innerWidth-tw-12,x));
 let y=r.top-th-8;if(y<8)y=r.bottom+8;
 el.style.left=x+'px';el.style.top=y+'px';
}
function hide(){if(el)el.hidden=true;}
const interactive=t=>t.closest('button,a,[data-act],[data-sc],[data-du],input,summary');
export function installTips(){
 // les title deviennent des bulles (et le navigateur n'affiche plus sa propre bulle)
 const adopt=t=>{if(t&&t.title&&!t.dataset.tip){t.dataset.tip=t.title;t.removeAttribute('title');}};
 document.addEventListener('mouseover',e=>{const t=e.target.closest('[data-tip],[title]');if(!t||t.closest('#duel .gm'))return;adopt(t);show(t);});
 document.addEventListener('mouseout',e=>{if(e.target.closest('[data-tip]'))hide();});
 document.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse')return;const t=e.target.closest('[data-tip],[title]');hide();if(!t)return;adopt(t);
  if(!interactive(t)){show(t);setTimeout(hide,2600);return;}
  clearTimeout(timer);longShown=false;timer=setTimeout(()=>{longShown=true;show(t);setTimeout(hide,2600);},450);
 },true);
 const cancel=()=>clearTimeout(timer);
 document.addEventListener('pointerup',cancel,true);document.addEventListener('pointercancel',cancel,true);document.addEventListener('scroll',()=>{cancel();hide();},true);
 // après un appui long, on n'active pas le bouton
 document.addEventListener('click',e=>{if(longShown){longShown=false;e.stopPropagation();e.preventDefault();}},true);
}
