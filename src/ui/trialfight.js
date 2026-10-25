/* Combat d'épreuve joué en direct (demandé par Seba le 2026-10-25) : votre apprenti contre un autre disciple,
   ou face à un chevalier « sempai » qui évalue ses fondamentales. Même scène animée que les expéditions. */
import { mountBattle } from '../battle/battle.js';
import { COST, autoPick, canUse, duelStats, heroAction, newDuelBattle } from '../core/combat.js';
import { SKILLS } from '../core/data/skills.js';
import { ELEM, RANKS, armorLow, de } from '../core/data/world.js';
import { save } from '../core/save.js';
import { KIND_N, duelSetup, evaluate, settleDuel } from '../core/trial.js';
import { esc } from '../core/util.js';
import { sfx } from '../audio/audio.js';
import { portrait } from './portraits.js';
import { render } from './app.js';

let root=null,ctl=null,F=null,animating=false,auto=null;

export function openTrialFight(ap,c,e,cd){
 const su=duelSetup(ap,c);
 const b=newDuelBattle(ap,su.o,{boostA:su.boostA,boostB:su.boostB,hpB:su.hpB,seed:(Math.random()*2**31)|0});
 F={ap,c,e,cd,o:su.o,kind:su.kind,b,out:null};
 if(!root){root=document.createElement('div');root.id='trialfight';document.body.appendChild(root);root.addEventListener('click',onClick);}
 root.hidden=false;draw();
}
function close(){auto=null;if(ctl){ctl.destroy();ctl=null;}if(root)root.hidden=true;F=null;render();}
const img=(p,rank)=>'<img class="sc-pt mini" src="'+portrait(p,rank)+'" alt="">';
function bar(v,max,cls){return '<div class="sc-bar '+(cls||'')+'"><i style="width:'+Math.max(0,v/max*100).toFixed(1)+'%"></i></div>';}
function draw(){
 if(F.out){if(ctl){ctl.destroy();ctl=null;}root.innerHTML=resultHtml();return;}
 const top='<div class="sc-top"><span>'+esc(KIND_N[F.kind].replace(/^./,x=>x.toUpperCase()))+' · '+esc(armorLow(F.c))+'</span><button class="sc-x" data-tf="giveup" aria-label="Abandonner">✕</button></div>';
 if(!ctl||!root.querySelector('#tfStage')){
  root.innerHTML=top+'<p class="bt-help">'+(F.kind==='sempai'?esc(F.o.name)+' retient ses coups : il veut voir '+esc(F.ap.name)+' placer des coups, réussir une technique, esquiver et tenir. Perdre n’empêche pas d’obtenir l’armure.':'Le vainqueur reçoit l’armure.')+'</p><div class="bt-stage" id="tfStage"></div><div id="tfHud"></div><div class="bt-acts" id="tfActs"></div><div class="bt-log" id="tfLog"></div>';
  ctl=mountBattle(root.querySelector('#tfStage'),{battle:F.b,knight:F.ap,foePeople:[F.o],faction:'bandits',colors:['#c9784a','#2a1c22'],onTarget:()=>{},getTarget:()=>0});
 }
 hud();
}
function hud(){
 const b=F.b,h=b.hero,f=b.foes[0];
 const H=root.querySelector('#tfHud'),A=root.querySelector('#tfActs'),L=root.querySelector('#tfLog');if(!H)return;
 H.innerHTML='<div class="bt-hero">'+img(F.ap,null)+'<div class="main"><div class="sc-name">'+esc(h.name)+' <span class="chip el-'+h.el+'">'+ELEM[h.el]+'</span><span class="bt-hp">'+h.hp+' / '+h.max+'</span></div>'+bar(h.hp,h.max,'green')+
  '<div class="pips" aria-label="Cosmos '+h.cos+' sur 10">'+'<i class="on"></i>'.repeat(h.cos)+'<i></i>'.repeat(10-h.cos)+'</div></div></div>'+
  '<div class="bt-hero">'+img(F.o,F.o.rank||null)+'<div class="main"><div class="sc-name">'+esc(f.n)+(F.o.rank?' <span class="chip '+F.o.rank+'">'+RANKS[F.o.rank]+'</span>':'')+'<span class="bt-hp">'+f.hp+' / '+f.max+'</span></div>'+bar(f.hp,f.max)+'</div></div>';
 if(F.kind==='sempai'){const ev=evaluate(duelStats(b),false);H.innerHTML+='<div class="bt-help">Vu par le sempai : '+ev.items.map(x=>(x.ok?'✓ ':'○ ')+esc(x.n)).join(' · ')+'</div>';}
 L.innerHTML=b.log.slice(-2).reverse().map((l,i)=>'<div class="'+(l.big?'big ':'')+(i===0?'new':'')+'">'+esc(l.m)+'</div>').join('');
 if(b.over&&!animating){A.innerHTML='<button class="btn wide" data-tf="finish">Voir le verdict ▸</button>';return;}
 const dis=x=>canUse(b,x)&&!animating&&!auto?'':' disabled';
 A.innerHTML='<button class="btn act" data-tf="act:strike"'+dis('strike')+'><b>Frapper</b></button><button class="btn act" data-tf="act:tech"'+dis('tech')+'><b>'+esc(h.tech)+'</b><span class="cost">'+COST.tech+' ✦</span></button><button class="btn act gold" data-tf="act:sig"'+dis('sig')+'><b>'+esc(h.sig)+'</b><span class="cost">'+COST.sig+' ✦ · ultime</span></button><button class="btn act ghost" data-tf="act:guard"'+dis('guard')+'><b>Garde</b><span class="cost">+3 ✦</span></button>'+
  '<button class="btn ghost wide" data-tf="'+(auto?'stopauto':'auto')+'">'+(auto?'Reprendre la main':'Combat automatique')+'</button>';
}
async function playTurn(act){
 const b=F.b;if(!b||b.over||animating||!canUse(b,act))return;
 animating=true;hud();
 const before=b.log.length;
 if(act==='sig')sfx('milestone');else if(act==='guard')sfx('confirm');else if(act==='tech')sfx('study');
 heroAction(b,act,0);
 const fresh=b.log.slice(before);
 setTimeout(()=>{if(fresh.some(l=>l.t==='hero'&&l.dmg))sfx('hit');},act==='sig'?1500:act==='tech'?500:240);
 try{await ctl.play(act,fresh);}catch(e){console.error(e);}
 if(fresh.some(l=>l.t==='foe'&&l.dmg))sfx('hurt');
 if(b.over)sfx(b.result==='win'?'win':'lose');
 animating=false;if(F)hud();
}
async function startAuto(){
 if(auto)return;const token={};auto=token;
 while(F&&auto===token&&!F.b.over){while(animating)await new Promise(r=>setTimeout(r,60));if(auto!==token)break;await playTurn(autoPick(F.b).a);await new Promise(r=>setTimeout(r,250));}
 if(auto===token)auto=null;if(F&&!F.out)hud();
}
// Fin du combat : on applique les règles de l'épreuve (le vainqueur reçoit l'armure ; le sempai évalue).
function finish(giveUp){
 const b=F.b,won=!giveUp&&b.result==='win';
 F.out=settleDuel(F.ap,F.c,F.e,F.cd,F.o,{win:won,st:giveUp?{hits:0,techs:0,dodges:0,rounds:0}:duelStats(b),log:b.log.map(l=>l.m)});
 save();sfx(F.out.win?'win':'lose');draw();
}
function resultHtml(){
 const o=F.out,ap=F.ap,c=F.c,sem=o.kind==='sempai';
 let h='<div class="sc-results '+(o.win?'win':'lose')+'"><h2>'+(o.win?'L’armure a choisi '+esc(ap.name):sem?esc(ap.name)+' n’est pas encore prêt'+(ap.sex==='F'?'e':''):esc(o.rival)+' l’emporte')+'</h2>';
 if(sem)h+='<p class="hint">Ce que '+esc(o.rival)+' a vu ('+o.eval.score+' / 5, il en faut 4'+(o.fought?', mais '+esc(ap.name)+' a gagné le combat':'')+') :</p><ul>'+o.eval.items.map(x=>'<li style="color:var(--'+(x.ok?'ok':'bad')+')">'+(x.ok?'✓ ':'✗ ')+esc(x.n)+' : '+esc(x.t)+'</li>').join('')+'</ul>';
 h+='<p class="hint">'+(o.win?esc(ap.name)+' devient chevalier de '+RANKS[c.rank].toLowerCase()+' '+esc(de(c.n))+'.':o.rivalWon?esc(o.rival)+' reçoit l’armure'+(o.rivalNpc?' et rejoint le Sanctuaire':'')+'.':esc(ap.name)+' doit se reposer '+F.cd+' h avant de retenter sa chance.')+'</p>';
 return h+'<button class="btn" data-tf="close">Retour</button></div>';
}
function onClick(ev){
 const t=ev.target.closest('[data-tf]');if(!t||t.disabled)return;ev.stopPropagation();
 const [k,x]=t.dataset.tf.split(':');
 if(k==='close'){close();return;}
 if(!F)return;
 if(k==='act'){playTurn(x);return;}
 if(k==='auto'){startAuto();hud();return;}
 if(k==='stopauto'){auto=null;hud();return;}
 if(k==='finish'){if(!animating)finish(false);return;}
 if(k==='giveup'){if(F.out){close();return;}if(confirm('Abandonner le combat ? L’épreuve sera perdue.')){auto=null;finish(true);}return;}
}
