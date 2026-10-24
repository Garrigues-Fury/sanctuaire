/* Point d'entrée : charge la partie, rattrape le temps écoulé, puis fait avancer le jeu chaque seconde. */
import '@fontsource/marcellus-sc/400.css';
import '@fontsource/alegreya-sans/400.css';
import '@fontsource/alegreya-sans/500.css';
import '@fontsource/alegreya-sans/700.css';
import '@fontsource/alegreya-sans/800.css';
import './styles/main.css';
import { newGame } from './core/people.js';
import { advance, newSum, recomputeCB } from './core/rules.js';
import { load, save } from './core/save.js';
import { S, setS } from './core/state.js';
import { setMapTapHandler } from './map/map.js';
import { sfx, unlockAudio } from './audio/audio.js';
import { absenceModal, installClicks, liveUpdate, modalFn, onMapTap, openModal, render } from './ui/app.js';

// Rattrape un écart de temps réel dtReal (en heures) et montre le résumé d'absence s'il dépasse 6 minutes de jeu.
function catchUp(dtReal){
 const before=Object.assign({},S.res),sum=newSum(),dt=dtReal*S.speed;
 advance(dt,sum);save();render();
 if(dt>=.1)openModal(absenceModal(dt,before,sum));
}
let saveTick=0;
function tick(){
 const n=Date.now();const dt=(n-S.lastReal)/36e5;S.lastReal=n;
 if(dt>.05){catchUp(dt);return;}
 advance(dt*S.speed,null);
 if(S._dirty&&!modalFn)render();else liveUpdate();
 if(++saveTick>=10){saveTick=0;save();}
}
function start(){
 setS(load());
 const fresh=!S;if(fresh){newGame();save();}
 recomputeCB();
 S.tab=S.tab||'sanctuaire';
 installClicks();setMapTapHandler(onMapTap);
 // Écran titre : un toucher pour entrer ; le résumé d'absence attend dessous.
 const title=document.getElementById('title');
 // Le premier toucher (écran titre ou ailleurs) autorise le son.
 document.addEventListener('pointerdown',unlockAudio,true);
 const enter=()=>{unlockAudio();sfx('open');title.classList.add('out');setTimeout(()=>{title.hidden=true;},600);};
 title.addEventListener('click',enter);title.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')enter();});
 render();
 if(!fresh){const dt=(Date.now()-S.lastReal)/36e5;S.lastReal=Date.now();if(dt>.01)catchUp(dt);}
 setInterval(tick,1000);
 // Au retour sur l'appli, on rattrape tout de suite au lieu d'attendre la seconde suivante.
 document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else tick();});
 window.addEventListener('pagehide',save);
 // Demande au navigateur de ne pas effacer la sauvegarde pour libérer de la place.
 if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
}
start();
