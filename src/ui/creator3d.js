/* Créateur de personnage 3D (prototype) : le chevalier en 3D, son armure, et des curseurs de physique.
   La 3D est chargée seulement à l'ouverture (bibliothèque et modèle téléchargés une fois, puis gardés hors ligne). */
import { looks } from '../core/appearance.js';
import { CONS_BY } from '../core/data/world.js';
import { save } from '../core/save.js';
import { S } from '../core/state.js';
import { esc } from '../core/util.js';
import { specOf } from '../art/character.js';

const SLIDERS=[['height','Taille'],['build','Carrure'],['bust','Poitrine','F'],['waist','Tour de taille'],['hips','Hanches'],['thighs','Cuisses'],['round','Rondeurs']];
const EL_GEM={feu:0xff5a3a,eau:0x4fb6ff,air:0xd8f0ff,terre:0x62d884};
const EL_CLOTH={feu:0xb3302a,eau:0x2b5bb2,air:0xdfe7f2,terre:0x4b6b33};
const MOTIF=['curl','horns','twin','crescent','mane','wings','scales','tail','wings','backhorns','water','fins'];
// Physique de départ : celui que le générateur 2D avait tiré, pour rester cohérent.
export function lookOf(p){
 if(p.look3d)return p.look3d;
 const s=specOf(p,{rank:p.rank});
 return{height:.5,build:s.strong?.5+s.strong*.4:.45,bust:s.bust==null?.45:s.bust,waist:s.round?.7:.45,hips:.5+(s.curvy||0)*.2,thighs:.5,round:s.round||0};
}
let root=null,view=null,cur=null;
export async function openCreator(p){
 if(!root){root=document.createElement('div');root.id='creator3d';document.body.appendChild(root);
  root.addEventListener('input',e=>{const k=e.target.dataset.l;if(!k||!cur)return;cur.look[k]=+e.target.value/100;view&&view.update(cur.look,cur.col);});
  root.addEventListener('click',e=>{const a=e.target.closest('[data-c3]');if(!a)return;const k=a.dataset.c3;
   if(k==='close'){close(true);}else if(k==='reset'){cur.p.look3d=null;cur.look=Object.assign({},lookOf(cur.p));root.querySelectorAll('[data-l]').forEach(i=>i.value=Math.round(cur.look[i.dataset.l]*100));view&&view.update(cur.look,cur.col);}});}
 const c=CONS_BY[p.cons]||{el:'eau',rank:'bronze'},L=looks(p);
 cur={p,look:Object.assign({},lookOf(p)),col:{skin:L.skin,hair:specOf(p,{rank:p.rank}).hair}};
 root.hidden=false;
 root.innerHTML='<div class="c3-top"><b>'+esc(p.name)+'</b><span class="hint">essai 3D</span><button class="sc-x" data-c3="close" aria-label="Fermer">✕</button></div><div class="c3-stage" id="c3Stage"><div class="c3-wait">Chargement du personnage 3D…<br><small>La première fois, environ 17 Mo à télécharger.</small></div></div>'+
  '<div class="c3-sl">'+SLIDERS.filter(s=>!s[2]||s[2]===p.sex).map(([k,n])=>'<label class="vol"><span>'+n+'</span><input type="range" min="0" max="100" value="'+Math.round(cur.look[k]*100)+'" data-l="'+k+'" aria-label="'+n+'"></label>').join('')+'</div>'+
  '<div class="btns"><button class="btn ghost" data-c3="reset">Revenir au physique d’origine</button><button class="btn" data-c3="close">Enregistrer</button></div><p class="hint">Faites tourner le personnage au doigt. L’armure suit le corps.</p>';
 try{
  const { mountAvatar }=await import('../three/avatar3d.js');
  const st=root.querySelector('#c3Stage');
  view=await mountAvatar(st,{sex:p.sex,rank:c.rank,motif:c.rank==='or'?MOTIF[c.sign]:'water',gem:EL_GEM[c.el],cloth:EL_CLOTH[c.el],look:cur.look,colors:cur.col,capture:import.meta.env.DEV});
  st.querySelector('.c3-wait')&&st.querySelector('.c3-wait').remove();
  if(import.meta.env.DEV)window.__c3=view;
 }catch(e){console.error(e);const st=root.querySelector('#c3Stage');if(st)st.innerHTML='<div class="c3-wait">Impossible d’afficher la 3D sur cet appareil.<br><small>'+esc(String(e.message||e))+'</small></div>';}
}
function close(keep){if(keep&&cur)cur.p.look3d=Object.assign({},cur.look);save();if(view){view.dispose();view=null;}if(root)root.hidden=true;cur=null;}
