/* Écran de scène, en plein écran : dialogues façon RPG (portraits, texte qui s'écrit, choix) et combat au tour par tour. */
import { REGIONS } from '../core/data/worldmap.js';
import { SCENES } from '../core/data/scenes.js';
import { ELEM } from '../core/data/world.js';
import { COST, autoPick, canUse, heroAction } from '../core/combat.js';
import { fill, pickText, reqLabel, reqOk, rollChance } from '../core/dialogue.js';
import { activeKnight, beginFight, choose, currentNode, doRoll, endFight, finishScene, goTo } from '../core/expeditions.js';
import { save } from '../core/save.js';
import { S } from '../core/state.js';
import { esc } from '../core/util.js';
import { sfx } from '../audio/audio.js';
import { portrait } from './portraits.js';
import { mountBattle } from '../battle/battle.js';
import { beastKind, svgBeast } from '../art/beast.js';
import { dataUrl } from '../art/character.js';
import { render } from './app.js';

let root=null,tw=null,twKey='',target=null,autoTimer=null,lastLog=0,results=null,lastRoll=null,ctl=null,animating=false;

function speaker(who){
 const a=S.world.active,v=a.vars;
 if(who==='narr')return null;
 if(who==='k')return{p:activeKnight(),rank:activeKnight().rank,name:v.k};
 if(who==='k2'){const k=S.knights.find(x=>x.id===a.k2);return k?{p:k,rank:k.rank,name:k.name}:null;}
 if(who==='ap'){const p=S.aps.find(x=>x.id===a.apId);return p?{p,rank:null,name:p.name}:null;}
 if(who==='pope'){const p=S.knights.find(x=>x.role==='pope');return p?{p,rank:p.rank,name:p.name+', Grand Pope'}:null;}
 const c=a.cast[who];if(!c)return null;
 const names={ancien:'Ancien de '+(v.v||'Rodorio'),parent:c.name+', '+(c.sex==='F'?'mère':'père')+' de '+v.enfant,enfant:v.enfant,villageois:c.name+', villageois'+(c.sex==='F'?'e':''),chef:v.chef,rival:'Serviteur de '+v.dieu};
 const foe=a.ev?a.ev.foe:'bandits';
 if(who==='chef'&&foe==='betes')return{beast:beastKind(v.chef),name:v.chef};
 return{p:c,rank:null,opts:{faction:who==='chef'?foe:who==='rival'?'hermes':undefined,elder:who==='ancien'},name:names[who]||c.name};
}
const beastBust=k=>dataUrl(svgBeast(k,3).replace(/viewBox="[^"]*"/,'viewBox="0 430 240 240"').replace(/width="\d+" height="\d+"/,'width="256" height="256"'));
const img=(s,cls)=>s?'<img class="sc-pt '+(cls||'')+'" src="'+(s.beast?beastBust(s.beast):portrait(s.p,s.rank,s.opts))+'" alt="">':'';

export function openScene(){
 if(!S.world||!S.world.active)return;
 if(!root){root=document.createElement('div');root.id='scene';document.body.appendChild(root);root.addEventListener('click',onClick);}
 root.hidden=false;results=null;draw();
}
function close(){stopAuto();dropBattle();if(root)root.hidden=true;render();}
function stopAuto(){autoTimer=null;}
function dropBattle(){if(ctl){ctl.destroy();ctl=null;}}
const regionOf=a=>a.ev?REGIONS[a.ev.region]:{n:'Le Sanctuaire',bg:['#c9784a','#2a1c22']};

function draw(){
 const a=S.world.active;
 if(results){dropBattle();root.innerHTML=resultsHtml();return;}
 if(!a){close();return;}
 const R=regionOf(a);
 root.style.setProperty('--bg1',R.bg[0]);root.style.setProperty('--bg2',R.bg[1]);
 const place=a.ev?a.vars.v+' · '+a.ev.nat:'Le Sanctuaire';
 const top='<div class="sc-top"><span>'+esc(place)+'</span><button class="sc-x" data-sc="close" aria-label="Fermer (la scène reste en attente)">✕</button></div>';
 if(a.battle){
  // Le canevas du combat reste en place : on ne redessine que les barres et les boutons.
  if(!ctl||!root.querySelector('#btStage')){dropBattle();root.innerHTML=top+'<div class="bt-stage" id="btStage"></div><div id="btHud"></div><div class="bt-acts" id="btActs"></div><div class="bt-log" id="btLog"></div>';
   ctl=mountBattle(root.querySelector('#btStage'),{battle:a.battle,knight:activeKnight(),faction:a.ev?a.ev.foe:'bandits',colors:R.bg,
    onTarget:i=>{if(a.battle.foes[i]&&a.battle.foes[i].hp>0){target=i;sfx('tap');ctl.refresh();}},getTarget:()=>target});}
  hud(a);return;
 }
 dropBattle();
 root.innerHTML=top+dialogueHtml(a);
 typewrite(a);
}

/* ---------- dialogue ---------- */
function dialogueHtml(a){
 const node=currentNode(),sp=speaker(node.who),k=activeKnight();
 const other=sp&&node.who!=='k'?sp:lastOther(a);
 let h='<div class="sc-stage">'+img({p:k,rank:k.rank},'left'+(node.who==='k'?' on':''))+(other?img(other,'right'+(node.who!=='k'&&node.who!=='narr'?' on':'')):'')+'</div>';
 const text=fill(pickText(node.text,node.who==='k'?k:sp&&sp.p),a.vars);
 h+='<div class="sc-box'+(node.who==='narr'?' narr':'')+'" data-sc="skip">'+(sp?'<div class="sc-name">'+esc(sp.name)+'</div>':'')+
  (lastRoll!=null?'<div class="sc-roll '+(lastRoll?'ok':'ko')+'">'+(lastRoll?'Réussite !':'Échec…')+'</div>':'')+
  '<p class="sc-text" data-full="'+esc(text)+'"></p><div class="sc-ctl" hidden>'+controls(node,k)+'</div></div>';
 return h;
}
function lastOther(a){const ns=SCENES[a.scene].nodes;const w=Object.values(ns).map(n=>n.who).find(w=>w!=='k'&&w!=='narr');return w?speaker(w):null;}
function controls(node,k){
 if(node.choices)return node.choices.map((c,i)=>{const ok=reqOk(c.req,k,S),lab=reqLabel(c.req);return '<button class="sc-choice" data-sc="ch:'+i+'"'+(ok?'':' disabled')+'>'+(lab?'<span class="req">['+esc(lab)+']</span> ':'')+esc(fill(c.t,S.world.active.vars))+'</button>';}).join('');
 if(node.roll){const p=Math.round(rollChance(node.roll,k)*100);return '<button class="btn" data-sc="roll">Tenter ('+p+' %)</button>';}
 if(node.fight)return '<button class="btn" data-sc="fight">Combattre</button><button class="btn ghost" data-sc="fightauto">Combat automatique</button>';
 if(node.end)return '<button class="btn" data-sc="end">Terminer</button>';
 return '<button class="btn" data-sc="next">Continuer ▸</button>';
}
function typewrite(a){
 const el=root.querySelector('.sc-text'),ctl=root.querySelector('.sc-ctl');if(!el)return;
 const full=el.dataset.full,key=a.scene+'|'+a.node;
 if(tw)clearInterval(tw);
 if(key===twKey||matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=full;ctl.hidden=false;return;}
 twKey=key;let i=0;tw=setInterval(()=>{i+=2;el.textContent=full.slice(0,i);if(i>=full.length){clearInterval(tw);tw=null;ctl.hidden=false;}},22);
}
function finishTyping(){if(tw){clearInterval(tw);tw=null;}const el=root.querySelector('.sc-text');if(el){el.textContent=el.dataset.full;root.querySelector('.sc-ctl').hidden=false;}}

/* ---------- combat ---------- */
function bar(v,max,cls){return '<div class="sc-bar '+(cls||'')+'"><i style="width:'+Math.max(0,v/max*100).toFixed(1)+'%"></i></div>';}
// Barres du héros, boutons d'action et dernières lignes du journal (sous le canevas du combat).
function hud(a){
 const b=a.battle,h=b.hero,k=activeKnight();
 const alive=b.foes.filter(f=>f.hp>0);if(target==null||!alive.some(f=>f.i===target))target=alive.length?alive[0].i:null;
 const H=root.querySelector('#btHud'),A=root.querySelector('#btActs'),L=root.querySelector('#btLog');if(!H)return;
 H.innerHTML='<div class="bt-hero">'+img({p:k,rank:k.rank},'mini')+'<div class="main"><div class="sc-name">'+esc(h.name)+' <span class="chip el-'+h.el+'">'+ELEM[h.el]+'</span><span class="bt-hp">'+h.hp+' / '+h.max+'</span></div>'+bar(h.hp,h.max,'green')+'<div class="pips" aria-label="Cosmos '+h.cos+' sur 10">'+'<i class="on"></i>'.repeat(h.cos)+'<i></i>'.repeat(10-h.cos)+'</div></div></div>';
 L.innerHTML=b.log.slice(-2).reverse().map((l,i)=>'<div class="'+(l.big?'big ':'')+(l.warn?'warn ':'')+(i===0?'new':'')+'">'+esc(l.m)+'</div>').join('');
 if(b.over&&!animating){A.innerHTML='<button class="btn wide" data-sc="afterfight">Continuer ▸</button>';return;}
 const dis=x=>canUse(b,x)&&!animating&&!autoTimer?'':' disabled';
 A.innerHTML='<button class="btn act" data-sc="act:strike"'+dis('strike')+'><b>Frapper</b></button><button class="btn act" data-sc="act:tech"'+dis('tech')+'><b>'+esc(h.tech)+'</b><span class="cost">'+COST.tech+' ✦</span></button><button class="btn act gold" data-sc="act:sig"'+dis('sig')+'><b>'+esc(h.sig)+'</b><span class="cost">'+COST.sig+' ✦ · ultime</span></button><button class="btn act ghost" data-sc="act:guard"'+dis('guard')+'><b>Garde</b><span class="cost">+3 ✦</span></button>'+
  '<button class="btn ghost wide" data-sc="'+(autoTimer?'stopauto':'auto')+'"'+(b.over?' disabled':'')+'>'+(autoTimer?'Reprendre la main':'Combat automatique')+'</button>';
}
async function playTurn(act,tgt){
 const a=S.world.active,b=a&&a.battle;if(!b||b.over||animating||!canUse(b,act))return;
 animating=true;hud(a);
 const before=b.log.length;
 if(act==='sig')sfx('milestone');else if(act==='guard')sfx('confirm');else if(act==='tech')sfx('study');
 heroAction(b,act,tgt);
 const fresh=b.log.slice(before);
 setTimeout(()=>{if(fresh.some(l=>l.t==='hero'&&l.dmg))sfx('hit');},act==='sig'?1500:act==='tech'?500:240);
 const foeHits=fresh.filter(l=>l.t==='foe'&&l.dmg).length;
 save();
 try{await ctl.play(act,fresh);}catch(e){console.error(e);}
 if(foeHits)sfx('hurt');
 if(b.over)sfx(b.result==='win'?'win':'lose');
 animating=false;if(S.world.active===a)hud(a);
}

/* ---------- fin ---------- */
function resultsHtml(){
 const {end,out}=results;
 const T={win:['Victoire','Le village est sauvé.'],peace:['Paix conclue','Parfois, les mots suffisent.'],recruit:['Une recrue !','Le Sanctuaire compte un enfant de plus.'],lose:['Défaite','On se relève. On revient.'],leave:['Retour bredouille','Il y aura d’autres occasions.'],home:['Une journée au Sanctuaire','']}[end]||['Fin',''];
 return '<div class="sc-results '+end+'"><h2>'+T[0]+'</h2>'+(T[1]?'<p class="hint">'+T[1]+'</p>':'')+'<ul>'+out.map(o=>'<li>'+esc(o)+'</li>').join('')+'</ul><button class="btn" data-sc="close">Retour</button></div>';
}

function onClick(e){
 const t=e.target.closest('[data-sc]');if(!t||t.disabled)return;e.stopPropagation();
 const [k,x]=t.dataset.sc.split(':');
 if(k==='skip'){if(tw){finishTyping();}return;}
 if(k==='close'){if(results){results=null;}close();return;}
 const a=S.world.active;if(!a)return;
 const prevRoll=lastRoll;lastRoll=null;
 switch(k){
  case'next':sfx('tap');goTo(currentNode().next);break;
  case'ch':sfx('confirm');choose(+x);break;
  case'roll':{const ok=doRoll(rollChance(currentNode().roll,activeKnight()));lastRoll=ok;sfx(ok?'confirm':'lose');break;}
  case'fight':sfx('turn');beginFight();lastLog=0;break;
  case'fightauto':sfx('turn');beginFight();target=null;draw();ctl.ready.then(()=>startAuto());return;
  case'act':playTurn(x,target);return;
  case'auto':startAuto();hud(a);return;
  case'stopauto':stopAuto();hud(a);return;
  case'afterfight':if(animating)return;endFight();dropBattle();break;
  case'end':{const end=currentNode().end;const out=finishScene();results={end,out};sfx(end==='lose'||end==='leave'?'close':'milestone');save();draw();return;}
 }
 save();draw();
}
// Combat automatique : les tours s'enchaînent, chacun entièrement animé.
async function startAuto(){
 if(autoTimer)return;const token={};autoTimer=token;
 while(autoTimer===token){const a=S.world.active,b=a&&a.battle;if(!b||b.over)break;while(animating)await new Promise(r=>setTimeout(r,60));if(autoTimer!==token)break;const p=autoPick(b);await playTurn(p.a,p.target);await new Promise(r=>setTimeout(r,250));}
 if(autoTimer===token)autoTimer=null;const a=S.world.active;if(a&&a.battle)hud(a);
}
