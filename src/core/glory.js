/* Les exploits à célébrer (demandés par Seba le 2026-10-28) : au retour dans le jeu, chaque personnage qui a progressé
   a son moment de gloire en plein écran (ui/glory.js), puis vient la liste habituelle des événements.
   - Une carte par personnage, qui regroupe tout ce qu'il a accompli depuis la dernière fois : niveaux, compétences,
     technique, éveil du cosmos, armure gagnée, épreuve accomplie.
   - Une carte par bâtiment ou maison du zodiaque terminé, avec ce que le nouveau niveau apporte.
   La file est gardée dans la sauvegarde (S.glory) jusqu'à ce qu'elle soit vue. */
import { S } from './state.js';

const MAX=40;
export function gloryQueue(){if(!S.glory)S.glory=[];return S.glory;}
function trim(){const G=gloryQueue();while(G.length>MAX){const i=G.findIndex(c=>c.k==='p'&&!c.ev.length);G.splice(i>=0?i:0,1);}}
function personCard(p,lvUp){
 const G=gloryQueue();let c=G.find(x=>x.k==='p'&&x.pid===p.id);
 if(!c){c={k:'p',pid:p.id,lv0:lvUp?p.lv-1:p.lv,lv:p.lv,ev:[]};G.push(c);trim();}
 return c;
}
// Un personnage progresse : type = 'lv' (niveau gagné), 'skill', 'tech', 'awk', 'armor', 'ep'.
export function gloryNote(p,type,val){
 if(!S||!p||p.npc)return;
 const c=personCard(p,type==='lv');c.lv=p.lv;
 if(type!=='lv'&&!c.ev.some(e=>e.t===type&&e.v===val))c.ev.push({t:type,v:val==null?null:val});
}
// Un bâtiment (ou une maison « h3 ») atteint le niveau lvl.
export function gloryBuild(b,lvl){
 if(!S)return;const G=gloryQueue();const c=G.find(x=>x.k==='b'&&x.b===b);
 if(c)c.lvl=lvl;else{G.push({k:'b',b,lvl0:lvl-1,lvl});trim();}
}
export function clearGlory(){S.glory=[];}
