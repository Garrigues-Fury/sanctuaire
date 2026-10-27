/* Missions dans le monde : la liste (onglet Monde) et la fenêtre où l'on compose l'équipe. */
import { KIND_N, MISSION_BY } from '../core/data/missions.js';
import { SKILLS } from '../core/data/skills.js';
import { QUAL } from '../core/data/traits.js';
import { ELEM, RANKS, SIGNS } from '../core/data/world.js';
import { MIS_E, ensureMissions, missionChance, missionText, notReady } from '../core/missions.js';
import { hasSkill } from '../core/skills.js';
import { S } from '../core/state.js';
import { dur, esc } from '../core/util.js';
import { ptImg } from './app.js';

export const MP={cur:null};
const stars=L=>'★'.repeat(L)+'<i>'+'★'.repeat(5-L)+'</i>';
const STN={fo:'force',vi:'vitesse',de:'dextérité',en:'endurance',ps:'psychokinésie',co:'cosmos'};
function needLine(m){
 return '<div class="mrow">'+m.skills.map(id=>'<span class="chip"'+(SKILLS[id]?' title="'+esc(SKILLS[id].d)+'"':'')+'>'+esc(SKILLS[id]?SKILLS[id].n:id)+'</span>').join('')+'</div>'+
  '<div class="hint">Comptent aussi : '+m.st.map(k=>STN[k]).join(', ')+(m.el?' · élément '+ELEM[m.el].toLowerCase()+' favorable':'')+((m.q||[]).length?' · qualités utiles : '+m.q.map(q=>QUAL[q].n.toLowerCase()).join(', '):'')+'</div>';
}
export function missionsSection(){
 const M=ensureMissions();
 let h='<section class="sec"><div class="sec-h"><h2>Missions</h2><span class="aside">'+M.list.length+' en attente · '+(M.wins||0)+' réussie'+((M.wins||0)>1?'s':'')+'</span></div>';
 h+='<p class="hint">Catastrophes, secours, combats, enquêtes : chaque mission demande des compétences précises. Envoyez de 1 à 3 chevaliers qui conviennent ('+MIS_E+' d’énergie chacun). La mission se règle seule à son retour ; elle fait progresser l’équipe et la rapproche. Une mission ignorée disparaît au bout de 3 jours, sans conséquence. Un échec peut blesser, jamais tuer.</p>';
 if(M.active.length)h+='<div class="sec-h"><h2>En cours</h2></div><div class="list">'+M.active.map(a=>{const m=MISSION_BY[a.k];return '<div class="item"><span class="evicon rec">⌛&#xFE0E;</span><div class="main"><div class="name">'+esc(m.n)+' · '+esc(a.v)+'</div><div class="sub">'+a.team.map(id=>{const k=S.knights.find(x=>x.id===id);return k?esc(k.name):'';}).join(', ')+'</div><div class="meta"><span class="danger">'+stars(a.L)+'</span><span>retour dans <b data-until="'+a.end+'">'+dur(a.end-S.gt)+'</b></span><span>réussite ≈ '+Math.round(a.ch*100)+' %</span></div></div></div>';}).join('')+'</div>';
 h+='<div class="list">';
 if(!M.list.length)h+='<div class="empty">Aucune mission pour l’instant. Il en arrive toutes les 8 à 14 heures.</div>';
 M.list.slice().sort((a,b)=>a.until-b.until).forEach(ev=>{const m=MISSION_BY[ev.k];
  h+='<div class="item tap" data-act="mission:'+ev.id+'"><span class="evicon atk">'+({nature:'⛰',secours:'✚',combat:'✕',enquete:'?',diplomatie:'☉'}[m.kind]||'!')+'&#xFE0E;</span><div class="main"><div class="name">'+esc(m.n)+' · '+esc(ev.v)+'</div><div class="sub">'+KIND_N[m.kind]+' · '+esc(ev.nat)+' · '+ev.h+' h · '+m.team[0]+(m.team[1]>m.team[0]?' à '+m.team[1]:'')+' chevalier'+(m.team[1]>1?'s':'')+'</div><div class="meta"><span class="danger">'+stars(ev.L)+'</span><span>disparaît dans <b data-until="'+ev.until+'">'+dur(ev.until-S.gt)+'</b></span></div></div><div class="right">›</div></div>';});
 (M.reports||[]).length&&(h+='</div><details class="dt"><summary>Derniers retours de mission</summary><div class="list">'+M.reports.map(r=>'<div class="item"><div class="main"><div class="name">'+(r.win?(r.great?'Réussite éclatante':'Réussite'):'Échec')+' · '+esc(MISSION_BY[r.k].n)+' · '+esc(r.v)+'</div><div class="sub">'+esc(r.team.join(', '))+'</div><div class="hint">'+esc(r.out.join(' · '))+'</div></div></div>').join('')+'</div></details><div>');
 return h+'</div></section>';
}
export function missionModal(){
 const M=ensureMissions(),cur=MP.cur,ev=cur&&M.list.find(e=>e.id===cur.id);if(!ev)return '<p>Cette mission n’est plus disponible.</p>';
 const m=MISSION_BY[ev.k],team=cur.team.map(id=>S.knights.find(k=>k.id===id)).filter(Boolean),c=missionChance(ev,team);
 let h='<div><h2 class="mh">'+esc(m.n)+'</h2><p class="hint">'+esc(missionText(ev))+'</p></div>';
 h+='<div class="evhead"><span class="danger big">'+stars(ev.L)+'</span><span class="chip">'+KIND_N[m.kind]+'</span><span class="chip">'+ev.h+' h</span></div>';
 h+='<div class="sec-h"><h2>Ce qu’il faut</h2></div>'+needLine(m);
 const col=c.ch>=.7?'ok':c.ch>=.4?'warn':'bad';
 h+='<div class="sec-h"><h2>L’équipe</h2><span class="aside">'+team.length+' / '+m.team[1]+'</span></div>';
 h+=team.length?'<div class="banner info">Réussite estimée : <b class="ch-'+col+'">'+Math.round(c.ch*100)+' %</b>'+(c.have.length?' · compétences présentes : '+c.have.map(id=>esc(SKILLS[id].n.toLowerCase())).join(', '):' · aucune compétence utile')+(c.ratio<.7?' · équipe trop faible pour ce danger':c.ratio>2?' · équipe largement au-dessus':'')+'</div>':'<p class="hint">Choisissez de '+m.team[0]+' à '+m.team[1]+' chevalier'+(m.team[1]>1?'s':'')+'.</p>';
 h+='<div class="list">';
 S.knights.slice().sort((a,b)=>m.skills.filter(id=>hasSkill(b,id)).length-m.skills.filter(id=>hasSkill(a,id)).length||b.lv-a.lv).forEach(k=>{
  const why=notReady(k),sel=cur.team.includes(k.id),full=!sel&&cur.team.length>=m.team[1],sk=m.skills.filter(id=>hasSkill(k,id));
  h+='<div class="item'+(sel?' sel':'')+'">'+ptImg(k,k.rank)+'<div class="main"><div class="name">'+esc(k.name)+' <span class="chip '+k.rank+'">'+RANKS[k.rank]+'</span>'+(m.el&&SIGNS[k.sign].el===m.el?' <span class="chip el-'+m.el+'">'+ELEM[m.el]+'</span>':'')+'</div><div class="sub">niv. '+k.lv+(sk.length?' · '+sk.map(id=>esc(SKILLS[id].n.toLowerCase())).join(', '):' · aucune compétence de la mission')+'</div>'+(why?'<div class="meta"><span class="warn">'+esc(why)+'</span></div>':'')+'</div><button class="btn sm'+(sel?'':' ghost')+'" data-act="misspick:'+k.id+'"'+(why&&!sel||full?' disabled':'')+'>'+(sel?'Retirer':'Choisir')+'</button></div>';});
 h+='</div><div class="btns"><button class="btn" data-act="missgo"'+(team.length>=m.team[0]&&team.length<=m.team[1]?'':' disabled')+'>Envoyer l’équipe</button></div>';
 return h+'<p class="hint">Un échec peut blesser les équipiers (quelques heures d’infirmerie), jamais les tuer.</p>';
}
