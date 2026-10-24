/* Illustrations des cartes de la lecture des astres : cadre selon le rang, fond aux couleurs de l'élément,
   emblème central. Les coûts, points et noms sont posés par-dessus en HTML, pour rester bien lisibles. */
import { dataUrl } from './character.js';
import { lin, rad, rng, shade, smooth } from './geom.js';

const EL={feu:['#ffb067','#d2451e','#3a0e08'],eau:['#9fdcff','#2a6fc4','#081a3a'],air:['#f4fbff','#9ab8d8','#2a3448'],terre:['#d8e8a0','#6a8a3a','#1c240e']};
const FRAME={1:['#f3c08a','#a8612c','#4a2410'],2:['#ffffff','#a9b6ca','#3c465a'],3:['#fff4c0','#e0a83a','#6a4208'],A:['#f0d6ff','#9a5ac8','#3a1258']};
const G='url(#gl)';
// Emblèmes : chaque fonction dessine autour du point (100, 110).
const GLYPHS={
 flamme:()=>'<path d="'+smooth([[100,40],[128,90],[140,130],[122,170],[100,180],[78,170],[60,130],[74,96],[88,112],[92,70]])+'" fill="'+G+'"/><path d="'+smooth([[100,100],[114,134],[110,162],[100,168],[90,162],[86,134]])+'" fill="#fff" opacity=".7"/>',
 soleil:()=>{let s='<circle cx="100" cy="110" r="34" fill="'+G+'"/>';for(let i=0;i<12;i++){const a=i/12*Math.PI*2;s+='<path d="M'+(100+Math.cos(a)*42)+' '+(110+Math.sin(a)*42)+' L'+(100+Math.cos(a+.13)*70)+' '+(110+Math.sin(a+.13)*70)+' L'+(100+Math.cos(a-.13)*44)+' '+(110+Math.sin(a-.13)*44)+'Z" fill="'+G+'"/>';}return s;},
 torche:()=>'<path d="M90 120 L110 120 L104 186 L96 186Z" fill="'+G+'"/><rect x="84" y="112" width="32" height="10" rx="3" fill="'+G+'"/><path d="'+smooth([[100,44],[120,80],[118,108],[100,116],[82,108],[80,80]])+'" fill="'+G+'"/>',
 enclume:()=>'<path d="M48 96 L150 96 Q160 96 162 106 L126 114 L120 140 L140 160 L60 160 L80 140 L74 114 L40 104 Q42 96 48 96Z" fill="'+G+'"/><path d="M92 40 l16 0 l-4 40 l-8 0z" fill="'+G+'"/>',
 comete:()=>'<circle cx="128" cy="80" r="22" fill="'+G+'"/><path d="M110 92 Q70 130 40 176 Q90 140 120 102Z" fill="'+G+'" opacity=".75"/><path d="M118 96 Q90 140 72 184" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>',
 vague:()=>'<path d="M30 150 Q60 100 92 120 Q120 140 110 100 Q100 60 140 56 Q176 56 172 100 Q150 80 140 104 Q132 130 160 150Z" fill="'+G+'"/><path d="M30 168 Q100 140 172 168" stroke="'+G+'" stroke-width="8" fill="none"/>',
 goutte:()=>'<path d="'+smooth([[100,40],[130,96],[140,130],[124,170],[100,178],[76,170],[60,130],[70,96]])+'" fill="'+G+'"/><ellipse cx="86" cy="130" rx="8" ry="16" fill="#fff" opacity=".6"/>',
 coquillage:()=>{let s='<path d="M100 170 L40 100 Q100 30 160 100Z" fill="'+G+'"/>';for(let i=-3;i<=3;i++)s+='<path d="M100 170 L'+(100+i*18)+' 62" stroke="#00000044" stroke-width="2"/>';return s;},
 lune:()=>'<path d="M118 44 A66 66 0 1 0 118 176 A50 50 0 1 1 118 44Z" fill="'+G+'"/>',
 poisson:()=>'<path d="M40 110 Q90 60 140 110 Q90 160 40 110Z" fill="'+G+'"/><path d="M136 110 L170 84 L164 110 L170 136Z" fill="'+G+'"/><circle cx="64" cy="104" r="5" fill="#000" opacity=".6"/>',
 plume:()=>'<path d="M148 44 Q60 70 64 170 Q110 140 148 44Z" fill="'+G+'"/><path d="M146 48 Q90 110 60 180" stroke="#00000055" stroke-width="3" fill="none"/>',
 tourbillon:()=>'<path d="M100 110 m-10 0 a10 10 0 1 1 20 0 a20 20 0 1 1 -40 0 a30 30 0 1 1 60 0 a40 40 0 1 1 -80 0 a50 50 0 1 1 100 0" fill="none" stroke="'+G+'" stroke-width="9" stroke-linecap="round"/>',
 aile:()=>'<path d="'+smooth([[60,170],[70,100],[110,60],[170,44],[150,74],[176,80],[146,104],[166,116],[130,130],[140,146],[100,150]])+'" fill="'+G+'"/>',
 lyre:()=>'<path d="M64 60 Q56 150 100 172 Q144 150 136 60 Q128 110 100 120 Q72 110 64 60Z" fill="none" stroke="'+G+'" stroke-width="10"/><path d="M70 72 L130 72 M86 76 L86 150 M100 76 L100 156 M114 76 L114 150" stroke="'+G+'" stroke-width="3"/>',
 chouette:()=>'<path d="'+smooth([[100,58],[138,74],[146,120],[128,168],[100,178],[72,168],[54,120],[62,74]])+'" fill="'+G+'"/><circle cx="84" cy="104" r="14" fill="#fff"/><circle cx="116" cy="104" r="14" fill="#fff"/><circle cx="84" cy="104" r="6" fill="#222"/><circle cx="116" cy="104" r="6" fill="#222"/><path d="M94 122 L100 134 L106 122Z" fill="#a8641a"/><path d="M70 66 L62 46 L84 62 M130 66 L138 46 L116 62" fill="'+G+'"/>',
 montagne:()=>'<path d="M24 176 L84 70 L110 112 L130 84 L178 176Z" fill="'+G+'"/><path d="M84 70 L98 94 L86 90 L76 100Z" fill="#fff" opacity=".7"/>',
 colonne:()=>{let s='<rect x="64" y="56" width="72" height="14" rx="3" fill="'+G+'"/><rect x="58" y="170" width="84" height="14" rx="3" fill="'+G+'"/><rect x="74" y="70" width="52" height="100" fill="'+G+'"/>';for(let i=0;i<4;i++)s+='<path d="M'+(82+i*12)+' 72 L'+(82+i*12)+' 168" stroke="#00000040" stroke-width="3"/>';return s;},
 olivier:()=>{let s='<path d="M60 176 Q100 120 130 50" stroke="'+G+'" stroke-width="6" fill="none"/>';for(let i=0;i<7;i++){const t=i/7,x=60+t*70,y=176-t*126;s+='<ellipse cx="'+(x+(i%2?16:-16))+'" cy="'+y+'" rx="16" ry="7" transform="rotate('+(i%2?-30:30)+' '+(x+(i%2?16:-16))+' '+y+')" fill="'+G+'"/>';}return s;},
 bouclier:()=>'<path d="M100 44 L156 64 Q154 140 100 180 Q46 140 44 64Z" fill="'+G+'"/><path d="M100 60 L140 74 Q138 132 100 162Z" fill="#fff" opacity=".35"/>',
 temple:()=>{let s='<path d="M40 86 L100 48 L160 86Z" fill="'+G+'"/><rect x="40" y="88" width="120" height="10" fill="'+G+'"/><rect x="36" y="168" width="128" height="12" fill="'+G+'"/>';for(let i=0;i<5;i++)s+='<rect x="'+(48+i*24)+'" y="100" width="12" height="66" fill="'+G+'"/>';return s;},
 // artefacts
 masque:()=>'<path d="'+smooth([[100,48],[148,62],[150,110],[132,158],[100,176],[68,158],[50,110],[52,62]])+'" fill="'+G+'"/><path d="M70 104 Q84 92 96 104 Q84 112 70 104Z M104 104 Q116 92 130 104 Q116 112 104 104Z" fill="#1a0a20"/><path d="M100 48 L108 30 L100 22 L92 30Z" fill="'+G+'"/>',
 sceptre:()=>'<rect x="95" y="70" width="10" height="114" rx="4" fill="'+G+'"/><circle cx="100" cy="62" r="22" fill="none" stroke="'+G+'" stroke-width="8"/><path d="M100 40 L112 18 L100 26 L88 18Z" fill="'+G+'"/><path d="M70 84 Q100 70 130 84" stroke="'+G+'" stroke-width="6" fill="none"/>',
 urne:()=>'<path d="'+smooth([[80,52],[120,52],[114,70],[140,110],[128,160],[100,176],[72,160],[60,110],[86,70]])+'" fill="'+G+'"/><path d="M60 92 Q40 100 56 124 M140 92 Q160 100 144 124" stroke="'+G+'" stroke-width="7" fill="none"/>',
 couronne:()=>{let s='<ellipse cx="100" cy="110" rx="58" ry="46" fill="none" stroke="'+G+'" stroke-width="6"/>';for(let i=0;i<14;i++){const a=i/14*Math.PI*2;const x=100+Math.cos(a)*58,y=110+Math.sin(a)*46;s+='<ellipse cx="'+x+'" cy="'+y+'" rx="14" ry="6" transform="rotate('+(a*57+90)+' '+x+' '+y+')" fill="'+G+'"/>';}return s;},
 lance:()=>'<path d="M60 180 L132 60" stroke="'+G+'" stroke-width="8" stroke-linecap="round"/><path d="M128 66 L150 30 L136 76Z" fill="'+G+'"/>',
 peplos:()=>'<path d="M60 54 L140 54 L156 180 Q100 160 44 180Z" fill="'+G+'"/><path d="M80 60 Q76 120 70 172 M100 60 L100 168 M120 60 Q124 120 130 172" stroke="#00000033" stroke-width="3" fill="none"/>',
 lampe:()=>'<path d="M40 140 Q90 110 150 130 L168 118 L160 140 Q110 168 50 156Z" fill="'+G+'"/><path d="'+smooth([[164,74],[174,96],[168,112],[158,104],[156,88]])+'" fill="#fff4c0"/>',
 sablier:()=>'<rect x="56" y="44" width="88" height="10" rx="3" fill="'+G+'"/><rect x="56" y="166" width="88" height="10" rx="3" fill="'+G+'"/><path d="M66 56 L134 56 Q130 92 104 110 Q130 128 134 164 L66 164 Q70 128 96 110 Q70 92 66 56Z" fill="'+G+'" opacity=".85"/><path d="M80 150 L120 150 L100 120Z" fill="#fff" opacity=".6"/>'
};
const SETS={feu:['flamme','soleil','torche','enclume','comete'],eau:['vague','goutte','coquillage','lune','poisson'],air:['plume','tourbillon','aile','lyre','chouette'],terre:['montagne','colonne','olivier','bouclier','temple']};
const RELIC_GLYPH={masque:'masque',sceptre:'sceptre',bouclier:'bouclier',urne:'urne',couronne:'couronne',chouette:'chouette',lance:'lance',peplos:'peplos',lampe:'lampe',sablier:'sablier'};
const CACHE=new Map();
export function cardArt(c){
 if(CACHE.has(c.id))return CACHE.get(c.id);
 const t=c.relic?'A':c.t,F=FRAME[t],E=c.relic?['#ffe6ff','#8a4ab8','#1a0828']:EL[c.el],r=rng([...c.id].reduce((a,ch)=>a*31+ch.charCodeAt(0),7)>>>0);
 const glyph=c.relic?RELIC_GLYPH[c.id]:SETS[c.el][c.art%5];
 let s='<defs>'+rad('bg',[[0,E[0]],[.45,E[1]],[1,E[2]]],.5,.4,.75)+lin('fr',[[0,F[0]],[.5,F[1]],[1,F[2]]],1,1)+lin('gl',[[0,'#ffffff'],[.4,c.relic?'#ffe6a0':shade(E[0],.4)],[1,c.relic?'#e0a83a':E[1]]])+rad('halo',[[0,'#fff',.55],[1,'#fff',0]])+'</defs>';
 s+='<rect x="0" y="0" width="200" height="280" rx="16" fill="url(#fr)"/><rect x="8" y="8" width="184" height="264" rx="11" fill="url(#bg)"/>';
 for(let i=0;i<26;i++)s+='<circle cx="'+(10+r()*180).toFixed(1)+'" cy="'+(10+r()*260).toFixed(1)+'" r="'+(r()*1.6+.4).toFixed(1)+'" fill="#fff" opacity="'+(.3+r()*.6).toFixed(2)+'"/>';
 s+='<circle cx="100" cy="112" r="78" fill="url(#halo)"/>';
 s+='<g transform="translate(0 8)">'+GLYPHS[glyph]()+'</g>';
 s+='<rect x="8" y="196" width="184" height="76" rx="0" fill="#000" opacity=".38"/><rect x="8" y="8" width="184" height="264" rx="11" fill="none" stroke="'+F[2]+'" stroke-width="2"/>';
 if(t===3||t==='A')s+='<rect x="3" y="3" width="194" height="274" rx="14" fill="none" stroke="#fff6d0" stroke-width="1.5" opacity=".7"/>';
 const url=dataUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280" width="200" height="280">'+s+'</svg>');CACHE.set(c.id,url);return url;
}
// Dos de carte (pioche) selon le rang.
export function cardBack(t){
 const k='back'+t;if(CACHE.has(k))return CACHE.get(k);const F=FRAME[t];
 let s='<defs>'+lin('fr',[[0,F[0]],[.5,F[1]],[1,F[2]]],1,1)+rad('bg',[[0,'#3a2a50'],[1,'#0c0814']])+'</defs><rect width="200" height="280" rx="16" fill="url(#fr)"/><rect x="10" y="10" width="180" height="260" rx="10" fill="url(#bg)"/>';
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;s+='<path d="M100 140 L'+(100+Math.cos(a)*60)+' '+(140+Math.sin(a)*60)+'" stroke="'+F[0]+'" stroke-width="2" opacity=".5"/>';}
 s+='<circle cx="100" cy="140" r="34" fill="none" stroke="'+F[0]+'" stroke-width="3"/><text x="100" y="152" font-size="36" text-anchor="middle" fill="'+F[0]+'" font-family="Georgia">'+['','I','II','III'][t]+'</text>';
 const url=dataUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280" width="200" height="280">'+s+'</svg>');CACHE.set(k,url);return url;
}
