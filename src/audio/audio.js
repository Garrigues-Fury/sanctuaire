/* Sons du jeu.
   - Ambiance synthétisée en direct (aucun fichier) : vent, cigales le jour, grillons la nuit, marteau de la forge.
   - Bruitages : fichiers CC0 de Kenney (public/audio/), plus cloche et carillons synthétisés.
   Le navigateur n'autorise le son qu'après un premier toucher : on démarre au toucher de l'écran titre. */
import { S, onEvent } from '../core/state.js';
import { hourOf, skyAt } from '../map/ambience.js';

const PREF_KEY='sanctuaire-son';
let prefs={on:true,amb:.6,sfx:.8};
try{Object.assign(prefs,JSON.parse(localStorage.getItem(PREF_KEY)||'{}'));}catch(e){}
export function soundPrefs(){return prefs;}
function savePrefs(){try{localStorage.setItem(PREF_KEY,JSON.stringify(prefs));}catch(e){}}

let ctx=null,master,ambBus,sfxBus,amb=null,buffers={},noise=null,clankTimer=0,cricketTimer=0;
const FILES=['toucher','ouvrir','fermer','valider','fabrique','echec','chantier','marteau1','marteau2','marteau3','pieces','carte','tour','porte','livre'];

export function unlockAudio(){
 if(ctx){if(ctx.state==='suspended'&&prefs.on&&!document.hidden)ctx.resume();return;}
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 ctx=new AC();master=ctx.createGain();master.connect(ctx.destination);
 ambBus=ctx.createGain();sfxBus=ctx.createGain();ambBus.connect(master);sfxBus.connect(master);
 applyPrefs();
 FILES.forEach(n=>fetch('audio/'+n+'.ogg').then(r=>r.arrayBuffer()).then(b=>ctx.decodeAudioData(b)).then(d=>{buffers[n]=d;}).catch(()=>{}));
 startAmbience();
 document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend();else if(prefs.on)ctx.resume();});
}
function applyPrefs(){if(!ctx)return;const t=ctx.currentTime;master.gain.setTargetAtTime(prefs.on?1:0,t,.1);ambBus.gain.setTargetAtTime(prefs.amb,t,.1);sfxBus.gain.setTargetAtTime(prefs.sfx,t,.1);if(prefs.on&&!document.hidden)ctx.resume();}
export function setSound(patch){Object.assign(prefs,patch);savePrefs();applyPrefs();}

/* ---------- ambiance ---------- */
function noiseBuffer(){if(noise)return noise;const len=ctx.sampleRate*4;noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let b=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;b=.97*b+.03*w;d[i]=b*6+w*.15;}return noise;}
function lfo(freq,depth,target,offset){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=freq;g.gain.value=depth;o.connect(g).connect(target);o.start();if(offset!=null)target.value=offset;return o;}
function startAmbience(){
 const src=ctx.createBufferSource();src.buffer=noiseBuffer();src.loop=true;
 // vent : bruit grave filtré, qui enfle doucement
 const wf=ctx.createBiquadFilter();wf.type='bandpass';wf.Q.value=.8;lfo(.07,220,wf.frequency,420);
 const wg=ctx.createGain();wg.gain.value=0;lfo(.05,.025,wg.gain);
 // cigales : bruit aigu haché très vite, par vagues
 const cf=ctx.createBiquadFilter();cf.type='bandpass';cf.frequency.value=5200;cf.Q.value=6;
 const chop=ctx.createGain();chop.gain.value=.5;lfo(48,.5,chop.gain);
 const cg=ctx.createGain();cg.gain.value=0;
 src.connect(wf).connect(wg).connect(ambBus);src.connect(cf).connect(chop).connect(cg).connect(ambBus);
 src.start();
 const night=ctx.createGain();night.gain.value=0;night.connect(ambBus);
 amb={wind:wg,cicada:cg,night};
 setInterval(updateAmbience,2000);updateAmbience();
}
function updateAmbience(){
 if(!ctx||!amb||!S)return;const n=skyAt(hourOf(S)).lights,t=ctx.currentTime;
 const onMap=S.tab==='sanctuaire';
 amb.wind.gain.setTargetAtTime(.05+.03*n,t,1.5);
 amb.cicada.gain.setTargetAtTime((1-n)*(onMap?.05:.025)*(.6+.4*Math.sin(t/9)),t,2);
 amb.night.gain.setTargetAtTime(n*(onMap?.06:.03),t,2);
 // grillons : petites séries de chants aigus, la nuit seulement
 if(n>.3&&t>cricketTimer){cricketTimer=t+.8+Math.random()*2.2;chirp(t+.05);}
 // marteau de la forge, quand l'atelier des armures travaille et qu'on regarde la carte
 if(onMap&&S.forgeJob&&t>clankTimer){clankTimer=t+2+Math.random()*3;setTimeout(()=>play('marteau'+(1+Math.floor(Math.random()*3)),{vol:.18,rate:.9+Math.random()*.2}),Math.random()*1500);}
}
function chirp(t0){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=4300+Math.random()*400;g.gain.value=0;o.connect(g).connect(amb.night);
 const k=2+Math.floor(Math.random()*3);for(let i=0;i<k;i++){const s=t0+i*.07;g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(.5,s+.01);g.gain.linearRampToValueAtTime(0,s+.045);}
 o.start(t0);o.stop(t0+k*.07+.05);}

/* ---------- bruitages ---------- */
export function play(name,o={}){
 if(!ctx||!prefs.on||document.hidden)return;const b=buffers[name];if(!b)return;
 const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=b;s.playbackRate.value=o.rate||1;g.gain.value=o.vol==null?.6:o.vol;s.connect(g).connect(sfxBus);s.start();
}
// Cloche : quelques partiels inharmoniques qui s'éteignent lentement.
function bell(freq,vol=.25,delay=0){
 if(!ctx||!prefs.on||document.hidden)return;const t=ctx.currentTime+delay;
 [[1,1],[2.01,.5],[2.76,.35],[4.07,.2],[5.43,.12]].forEach(([m,a])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=freq*m;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol*a,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+2.8/m+.4);o.connect(g).connect(sfxBus);o.start(t);o.stop(t+3.5);});
}
function chime(notes,vol=.18,step=.11){notes.forEach((f,i)=>bell(f,vol,i*step));}
const SFX={
 tap:()=>play('toucher',{vol:.35}),
 open:()=>play('ouvrir',{vol:.3}),
 close:()=>play('fermer',{vol:.3}),
 confirm:()=>play('valider',{vol:.4}),
 pay:()=>play('pieces',{vol:.35}),
 build:()=>play('chantier',{vol:.5}),
 built:()=>bell(392,.22),                       // une cloche grave : un chantier se termine
 levelup:()=>chime([659,880],.12),
 milestone:()=>chime([523,659,784,1047],.15),  // cosmos éveillé ou nouvelle technique
 crafted:()=>play('fabrique',{vol:.45}),
 recruit:()=>play('porte',{vol:.4}),
 armor:()=>chime([392,523,659,784],.2,.16),
 card:()=>play('carte',{vol:.5}),
 turn:()=>play('tour',{vol:.5}),
 win:()=>chime([523,659,784,1047,1319],.2,.13),
 lose:()=>{play('echec',{vol:.5});bell(196,.2,.15);},
 study:()=>play('livre',{vol:.4}),
 hit:()=>play('marteau'+(1+Math.floor(Math.random()*3)),{vol:.35,rate:1.5+Math.random()*.3}),
 hurt:()=>play('chantier',{vol:.4,rate:1.4}),
 alert:()=>bell(523,.12)
};
// État du son, pour les vérifications.
export function audioState(){return{ctx:ctx?ctx.state:'pas démarré',loaded:Object.keys(buffers).length,of:FILES.length};}
export function sfx(name){const f=SFX[name];if(f)f();}
onEvent(t=>sfx(t));
if(import.meta.env.DEV)window.__audio={audioState,soundPrefs,sfx};
