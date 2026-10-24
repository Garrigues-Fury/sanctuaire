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
import { render } from './app.js';

let root=null,tw=null,twKey='',target=null,autoTimer=null,lastLog=0,results=null,lastRoll=null;

function speaker(who){
 const a=S.world.active,v=a.vars;
 if(who==='narr')return null;
 if(who==='k')return{p:activeKnight(),rank:activeKnight().rank,name:v.k};
 if(who==='k2'){const k=S.knights.find(x=>x.id===a.k2);return k?{p:k,rank:k.rank,name:k.name}:null;}
 if(who==='ap'){const p=S.aps.find(x=>x.id===a.apId);return p?{p,rank:null,name:p.name}:null;}
 if(who==='pope'){const p=S.knights.find(x=>x.role==='pope');return p?{p,rank:p.rank,name:p.name+', Grand Pope'}:null;}
 const c=a.cast[who];if(!c)return null;
 const names={ancien:'Ancien de '+(v.v||'Rodorio'),parent:c.name+', '+(c.sex==='F'?'mère':'père')+' de '+v.enfant,enfant:v.enfant,villageois:c.name+', villageois'+(c.sex==='F'?'e':''),chef:v.chef,rival:'Serviteur de '+v.dieu};
 return{p:c,rank:who==='chef'||who==='rival'?'garde':null,name:names[who]||c.name};
}
const img=(s,cls)=>s?'<img class="sc-pt '+(cls||'')+'" src="'+portrait(s.p,s.rank)+'" alt="">':'';

export function openScene(){
 if(!S.world||!S.world.active)return;
 if(!root){root=document.createElement('div');root.id='scene';document.body.appendChild(root);root.addEventListener('click',onClick);}
 root.hidden=false;results=null;draw();
}
function close(){stopAuto();if(root)root.hidden=true;render();}
function stopAuto(){if(autoTimer){clearInterval(autoTimer);autoTimer=null;}}

function draw(){
 const a=S.world.active;
 if(results){root.innerHTML=resultsHtml();return;}
 if(!a){close();return;}
 const R=a.ev?REGIONS[a.ev.region]:{n:'Le Sanctuaire',bg:['#c9784a','#2a1c22']};
 root.style.setProperty('--bg1',R.bg[0]);root.style.setProperty('--bg2',R.bg[1]);
 const place=a.ev?a.vars.v+' · '+a.ev.nat:'Le Sanctuaire';
 let h='<div class="sc-top"><span>'+esc(place)+'</span><button class="sc-x" data-sc="close" aria-label="Fermer (la scène reste en attente)">✕</button></div>';
 h+=a.battle?battleHtml(a):dialogueHtml(a);
 root.innerHTML=h;
 if(!a.battle)typewrite(a);
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
function battleHtml(a){
 const b=a.battle,h=b.hero;
 const alive=b.foes.filter(f=>f.hp>0);if(target==null||!alive.some(f=>f.i===target))target=alive.length?alive[0].i:null;
 let s='<div class="bt-foes">'+b.foes.map(f=>'<button class="foe'+(f.hp<=0?' dead':'')+(f.i===target?' sel':'')+'" data-sc="tgt:'+f.i+'" data-foe="'+f.i+'"><b>'+esc(f.n)+'</b><span class="chip el-'+f.el+'">'+ELEM[f.el]+'</span>'+(f.charge?'<span class="chip warn">prépare un coup !</span>':'')+bar(f.hp,f.max,'red')+'<small>'+f.hp+' / '+f.max+'</small></button>').join('')+'</div>';
 s+='<div class="bt-log">'+b.log.slice(-5).reverse().map((l,i)=>'<div class="'+(l.big?'big ':'')+(l.warn?'warn ':'')+(l.t)+(i===0?' new':'')+'">'+esc(l.m)+'</div>').join('')+'</div>';
 s+='<div class="bt-hero" data-hero>'+img({p:activeKnight(),rank:activeKnight().rank},'mini')+'<div class="main"><div class="sc-name">'+esc(h.name)+' <span class="chip el-'+h.el+'">'+ELEM[h.el]+'</span></div>'+bar(h.hp,h.max,'green')+'<small>'+h.hp+' / '+h.max+' PV</small><div class="pips" aria-label="Cosmos '+h.cos+' sur 10">'+'<i class="on"></i>'.repeat(h.cos)+'<i></i>'.repeat(10-h.cos)+'</div></div></div>';
 if(b.over){s+='<div class="bt-end '+b.result+'">'+({win:'Victoire !',lose:'Défaite…',retreat:'Personne ne l’emporte.'})[b.result]+'</div><div class="bt-acts"><button class="btn" data-sc="afterfight">Continuer ▸</button></div>';return s;}
 const dis=x=>canUse(b,x)&&!autoTimer?'':' disabled';
 s+='<div class="bt-acts"><button class="btn" data-sc="act:strike"'+dis('strike')+'>Frapper</button><button class="btn" data-sc="act:tech"'+dis('tech')+'>'+esc(h.tech)+' <span class="cost">'+COST.tech+'✦</span></button><button class="btn gold" data-sc="act:sig"'+dis('sig')+'>'+esc(h.sig)+' <span class="cost">'+COST.sig+'✦</span></button><button class="btn ghost" data-sc="act:guard"'+dis('guard')+'>Garde</button>'+
  '<button class="btn ghost" data-sc="'+(autoTimer?'stopauto':'auto')+'">'+(autoTimer?'Reprendre la main':'Automatique')+'</button></div>';
 s+='<p class="bt-help">Touchez un ennemi pour le viser. Le cosmos (✦) monte à chaque tour, quand on vous frappe et quand vous vous mettez en garde. Quand un chef prépare un coup, la garde réduit les dégâts de moitié.</p>';
 return s;
}
function playTurn(act,tgt){
 const b=S.world.active.battle,before=b.log.length;
 if(act==='sig')sfx('milestone');else if(act==='guard')sfx('confirm');
 heroAction(b,act,tgt);
 const fresh=b.log.slice(before);
 if(fresh.some(l=>l.t==='hero'&&l.dmg))sfx('hit');
 if(fresh.some(l=>l.t==='foe'&&l.dmg))setTimeout(()=>sfx('hurt'),180);
 if(b.over){stopAuto();setTimeout(()=>sfx(b.result==='win'?'win':'lose'),300);}
 save();draw();
 // petit tremblement sur les cibles touchées
 fresh.forEach(l=>{if(l.dmg){const el=l.t==='hero'?root.querySelector('[data-foe="'+l.target+'"]'):root.querySelector('[data-hero]');if(el){el.classList.add('shake');}}});
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
  case'fightauto':sfx('turn');beginFight();draw();startAuto();return;
  case'tgt':target=+x;sfx('tap');draw();lastRoll=prevRoll;return;
  case'act':playTurn(x,target);return;
  case'auto':startAuto();return;
  case'stopauto':stopAuto();draw();return;
  case'afterfight':endFight();break;
  case'end':{const end=currentNode().end;const out=finishScene();results={end,out};sfx(end==='lose'||end==='leave'?'close':'milestone');save();draw();return;}
 }
 save();draw();
}
function startAuto(){stopAuto();autoTimer=setInterval(()=>{const b=S.world.active&&S.world.active.battle;if(!b||b.over){stopAuto();draw();return;}const p=autoPick(b);playTurn(p.a,p.target);},650);draw();}
