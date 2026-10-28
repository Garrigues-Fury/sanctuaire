/* Générateur de personnages en style anime, dessinés en vectoriel (SVG).
   Chaque personnage est décrit par un « spec » (peau, cheveux, yeux, silhouette, tenue…) tiré de sa graine,
   de son pays d'origine, de son sexe, de son rang et de sa constellation. Le dessin est découpé en trois calques
   pour l'animation : « back » (cape, cheveux arrière, ailes), « body » (le corps) et « arm » (le bras qui frappe).
   Les apprentis (8 à 16 ans) ont une silhouette d'enfant et une tenue sobre : aucun personnage mineur n'est sexualisé. */
import { looks } from '../core/appearance.js';
import { CONS_BY, SIGNS } from '../core/data/world.js';
import { f, limb, lin, rad, rng, shade, smooth, sym } from './geom.js';

const CX=200;
export const METALS={
 or:['#fff7cf','#f6c94f','#b27b1d','#5e3a06'],argent:['#ffffff','#d3dcea','#8794aa','#394256'],bronze:['#ffdcb2','#d48d4e','#8c4b22','#3d1d0b'],
 garde:['#e2cda8','#a3845e','#614b31','#2b2116'],crimson:['#ffab98','#c2301f','#5c0b06','#200302'],steel:['#eef2f6','#97a3b2','#4c5664','#1c222a'],
 violet:['#f3dcff','#a362d2','#4d2172','#1c0a2c'],jade:['#dcffe9','#52b47d','#1f5b3b','#0a2416'],dark:['#b9b0c4','#5b5368','#2a2532','#100d14']
};
// Couleurs de cheveux « manga » possibles.
const FANCY=[['vert','#3f9a5a'],['vert','#2f8f7a'],['bleu','#3d6fd0'],['bleu','#5aa6e0'],['violet','#7a4ec2'],['rose','#e07aa8'],['argent','#cfd6e0'],['rouge','#c8323a']];
const EL={feu:{cloth:'#b3302a',gem:'#ff5a3a'},eau:{cloth:'#2b5bb2',gem:'#4fb6ff'},air:{cloth:'#dfe7f2',gem:'#c8ecff'},terre:{cloth:'#4b6b33',gem:'#62d884'}};
const GOLD_MOTIF=['curl','horns','twin','crescent','mane','wings','scales','tail','wings','backhorns','water','fins'];
function motifOf(c){
 if(!c)return'tiara';if(c.rank==='or')return GOLD_MOTIF[c.sign];const n=c.n.toLowerCase();
 if(/pégase|cygne|aigle|phénix|corbeau|colombe|grue|toucan|oiseau|paon|flèche|petit cheval/.test(n))return'wings';
 if(/dragon|hydre|lézard|caméléon/.test(n))return'spikes';
 if(/lion|loup|lynx|cerbère|chien|renard|ourse/.test(n))return'mane';
 if(/dauphin|baleine|poisson|dorade|carène|voiles|poupe/.test(n))return'fins';
 if(/licorne/.test(n))return'unicorn';
 if(/couronne|cassiopée|andromède|lyre|chevelure/.test(n))return'tiara';
 return'crest';
}
// Factions ennemies : métal, tissu, accessoires.
const FACTION={
 bandits:{metal:'garde',cloth:'#4a3626',hood:'#2b211a',mask:true},
 ares:{metal:'crimson',cloth:'#2a0c0a',motif:'horns',spiky:true},
 eris:{metal:'violet',cloth:'#4a1f6e',motif:'crest',robe:true},
 artemis:{metal:'argent',cloth:'#263a66',hood:'#1e2c4e',motif:'crescent',bow:true},
 hermes:{metal:'steel',cloth:'#2a2f3a',hood:'#1a1e26',motif:'wings'},
 dionysos:{metal:'jade',cloth:'#7a1a3a',vine:true,robe:true},
 betes:{metal:'dark',cloth:'#3a2a20'}
};

/* ---------- description d'un personnage ---------- */
export function specOf(p,o={}){
 const L=looks(p),r=rng((p.seed^0x51ed27)>>>0),F=p.sex==='F';
 const rank=o.rank!==undefined?o.rank:(p.rank||null);
 // Moins de 18 ans : silhouette de jeune, jamais sexualisée, même quand il porte une armure (règle ferme de Seba).
 const child=o.child!=null?o.child:(!o.faction&&p.age!=null&&p.age<18);
 const el=SIGNS[p.sign||0].el,cons=p.cons?CONS_BY[p.cons]:null;
 const stylesF=['long','long','queue','carre','tresse','chignon','mi'],stylesM=['court','court','mi','queue','ras','long'];
 let hair=L.curly?(r()<.7?'boucles':(F?'tresse':'ras')):(F?stylesF:stylesM)[Math.floor(r()*(F?7:6))];
 if(child&&hair==='chignon')hair='queue';
 const fac=o.faction?FACTION[o.faction]:null;
 const s={seed:p.seed>>>0,F,child,elder:!!o.elder,skin:L.skin,hair:o.elder?'#cfc8bf':L.hair,hairKey:L.hk,eye:L.eye,mono:L.mono,fierce:L.fierce||!!fac,smile:L.smile&&!fac,
  style:hair,wavy:L.wavy,build:F?0:.3+r()*.7,curvy:F?.5+r()*.5:0,
  tattoo:(rank||fac)?r()<.5:r()<.15,earring:L.earring,beard:!F&&!child&&(o.elder||r()<.18),
  rank,el,cons,motif:fac?(fac.motif||null):rank?motifOf(cons):null,cloth:fac?fac.cloth:EL[el].cloth,gem:EL[el].gem,
  metal:fac?fac.metal:(rank||'bronze'),faction:o.faction||null,boss:!!o.boss,glow:!!o.boss,
  outfit:fac?'foe':rank?'knight':child?'apprentice':'villager',cover:F?(r()<.75?'midriff':'full'):(rank&&rank!=='or'&&r()<.45?'bare':'suit'),r};
 if(child)s.cover=F?'full':'suit';
 if(o.outfit)s.outfit=o.outfit; // ex. la tunique d'apprenti, pour l'image « avant » de la cérémonie
 // Morphologie et visage variés (demande de Seba du 2026-10-24), pour les adultes seulement.
 // Tirés à part, pour ne pas changer l'apparence déjà connue des personnages existants.
 const r2=rng((p.seed^0x9e3779b1)>>>0),adult=!child,gourmand=(p.flaw||[]).some(x=>x.k==='gourmand');
 s.round=adult&&r2()<(gourmand?.55:.18)?.45+r2()*.55:0;
 s.bust=F&&adult?(r2()<.3?.05+r2()*.25:r2()<.6?.35+r2()*.3:.7+r2()*.3):.45;
 s.strong=adult&&r2()<(F?.15:.25)?.5+r2()*.5:0;
 s.plain=adult&&r2()<(F?.2:.32)?.5+r2()*.5:0;
 s.scar=adult&&r2()<(p.origin==='survivant'||fac?.5:.2)?1+Math.floor(r2()*3):0;
 if(adult&&!s.tattoo&&r2()<.15)s.tattoo=true;
 // taches de rousseur : souvent chez les roux, parfois chez les peaux claires
 s.freckles=r2()<(L.hk==='roux'?.75:L.hk==='auburn'?.45:L.si<=1?.1:0);
 // cheveux colorés de manga : le cosmos teinte les cheveux, surtout chez les chevaliers (demande de Seba du 2026-10-24)
 if(!o.elder&&r2()<(rank?.22:fac?.12:.05)){const c=FANCY[Math.floor(r2()*FANCY.length)];s.hair=c[1];s.hairKey=c[0];}
 if(fac){s.hood=fac.hood&&r()<.7?fac.hood:null;s.mask=!!fac.mask;s.spiky=!!fac.spiky;s.robe=!!fac.robe;s.bow=!!fac.bow;s.vine=!!fac.vine;}
 return s;
}

/* ---------- géométrie du corps ---------- */
function geo(s){
 const F=s.F,m=s.build,o=s.round||0,t=s.strong||0;
 // o : silhouette ronde ; t : carrure puissante
 return{sw:F?66+t*10:86+m*14+t*6,wa:F?35+o*24:52+m*5+o*22,hip:F?68+s.curvy*7+o*12:58+m*3+o*10,neck:F?10+t*2:14+m*2,
  arm:F?[25+o*6+t*6,18+o*5+t*4,13+o*2]:[33+m*7+o*5+t*4,24+m*4+o*4+t*3,18+m*2+o*2],thigh:F?[58+s.curvy*8+o*14,30+o*8,18+o*3]:[58+m*6+o*10,34+m*3+o*6,21+o*2]};
}
// Métal en ombrage « cel » : reflet net, aplat, puis ombre franche, comme dans les animés.
const metalDefs=(id,M)=>lin(id,[[0,M[0]],[.18,M[0]],[.2,M[1]],[.55,M[1]],[.57,M[2]],[.86,M[2]],[.88,M[1]],[1,M[1]]],1,1)+lin(id+'e',[[0,M[3]],[1,M[3]]]);

/* ---------- visage ---------- */
function face(s,d){
 const S=s.skin,sd=shade(S,-.18),dk=shade(S,-.42),F=s.F;
 d.push(lin('fl',[[0,'#ffe2b8',.22],[.55,'#ffe2b8',0],[1,'#3a1a10',.28]],1,.4));
 const k=(F?.95:1)*(1+.07*(s.round||0)),pl=s.plain||0;
 const fp=sym(CX,[[0,38],[29*k,42],[42*k,64],[44*k,96],[41*k,121],[32*k,141],[17*k,157],[0,F?162:166]]);
 let h='<defs><clipPath id="fc"><path d="'+fp+'"/></clipPath></defs>';
 // oreilles
 const ear='<path d="'+smooth([[CX+40*k,96],[CX+50*k,92],[CX+52*k,108],[CX+44*k,124],[CX+39*k,118]])+'" fill="'+S+'" stroke="'+sd+'" stroke-width="1.2"/>';
 h+=ear+'<g transform="translate(400 0) scale(-1 1)">'+ear+'</g>';
 h+='<path d="'+fp+'" fill="'+S+'" stroke="'+shade(S,-.5)+'" stroke-width="1.6"/><rect x="140" y="30" width="120" height="140" fill="url(#fl)" clip-path="url(#fc)"/>';
 h+='<path d="'+smooth([[CX-30,150],[CX,166],[CX+30,150],[CX+20,170],[CX,178],[CX-20,170]])+'" fill="'+sd+'" opacity=".35"/>';
 if(s.earring&&!s.child)h+='<circle cx="'+f(CX+46*k)+'" cy="130" r="3.4" fill="none" stroke="#f0c860" stroke-width="2"/><circle cx="'+f(CX-46*k)+'" cy="130" r="3.4" fill="none" stroke="#f0c860" stroke-width="2"/>';
 // joues
 h+='<ellipse cx="'+(CX-23)+'" cy="132" rx="9" ry="4.5" fill="#e8706a" opacity="'+(F||s.child?.28:.12)+'"/><ellipse cx="'+(CX+23)+'" cy="132" rx="9" ry="4.5" fill="#e8706a" opacity="'+(F||s.child?.28:.12)+'"/>';
 // yeux (l'œil droit est dessiné, puis reflété)
 const sy=s.mono?.72:1,eh=(F||s.child?1.12:1)*sy*(1-.16*pl),iy=110;
 d.push(lin('ir',[[0,shade(s.eye,-.6)],[.5,s.eye],[1,shade(s.eye,.5)]]));
 const wpts=[[208,iy+1],[213,iy-8*eh],[222,iy-10.5*eh],[231,iy-8.5*eh],[235,iy-3]];
 const lpts=[[235,iy-3],[229,iy+7*eh],[221,iy+8.5*eh],[213,iy+6*eh]];
 const wp=smooth(wpts.concat(lpts.slice(1)));
 let eye='<defs><clipPath id="ec"><path d="'+wp+'"/></clipPath></defs><path d="'+wp+'" fill="#fffaf3"/>';
 eye+='<g clip-path="url(#ec)"><ellipse cx="221.5" cy="'+(iy+.5)+'" rx="8" ry="'+f(10*eh)+'" fill="url(#ir)"/><ellipse cx="221.5" cy="'+(iy+1)+'" rx="3.6" ry="'+f(5.2*eh)+'" fill="#120a0a"/>';
 eye+='<rect x="205" y="'+(iy-12)+'" width="34" height="5" fill="#3a2020" opacity=".25"/>'+(s.glow?'<ellipse cx="221.5" cy="'+iy+'" rx="8" ry="10" fill="#ff3020" opacity=".55"/>':'')+'</g>';
 eye+='<circle cx="225" cy="'+f(iy-4*eh)+'" r="2.8" fill="#fff"/><circle cx="218.5" cy="'+f(iy+4*eh)+'" r="1.3" fill="#fff" opacity=".85"/>';
 eye+='<path d="'+smooth([[206,iy+2],[213,iy-8.4*eh],[222,iy-11*eh],[231,iy-9*eh],[236,iy-3.5]],false)+'" fill="none" stroke="#1a1012" stroke-width="'+(F?3.6:3)+'" stroke-linecap="round"/>';
 if(F)eye+='<path d="M235 '+(iy-3.5)+' L242 '+(iy-9)+'" stroke="#1a1012" stroke-width="2.2" stroke-linecap="round"/><path d="M233 '+(iy-6)+' L238 '+(iy-12)+'" stroke="#1a1012" stroke-width="1.6" stroke-linecap="round"/>';
 eye+='<path d="'+smooth([[214,iy+6.5*eh],[221,iy+8.4*eh],[229,iy+6.5*eh]],false)+'" fill="none" stroke="'+dk+'" stroke-width="1" opacity=".6"/>';
 const by=iy-19,bf=s.fierce?4:0;
 eye+='<path d="'+smooth([[209,by+bf],[221,by-3],[235,by+1-bf*.2]],false)+'" fill="none" stroke="'+shade(s.hair,-.25)+'" stroke-width="'+((F?2.6:3.8)+pl*1.6)+'" stroke-linecap="round"/>';
 h+=eye+'<g transform="translate(400 0) scale(-1 1)">'+eye.replace(/id="ec"/,'id="ec2"').replace(/url\(#ec\)/,'url(#ec2)')+'</g>';
 // nez, bouche
 h+='<path d="M'+(CX+2)+' 123 Q'+(CX+4)+' 132 '+(CX-1)+' 135" fill="none" stroke="'+dk+'" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>';
 if(s.smile)h+='<path d="M'+(CX-9)+' 145 Q'+CX+' 156 '+(CX+9)+' 145 Q'+CX+' 149 '+(CX-9)+' 145Z" fill="#6a2024"/><path d="M'+(CX-7)+' 146 L'+(CX+7)+' 146" stroke="#fff" stroke-width="1.6"/>';
 else if(F)h+='<path d="M'+(CX-8)+' 146 Q'+CX+' 143.5 '+(CX+8)+' 146 Q'+CX+' 151 '+(CX-8)+' 146Z" fill="'+mix2(S,'#c0505a',.55)+'"/>';
 else h+='<path d="M'+(CX-8)+' 147 Q'+CX+' '+(s.fierce?145:149)+' '+(CX+8)+' 147" fill="none" stroke="'+dk+'" stroke-width="2" stroke-linecap="round"/>';
 // taches de rousseur sur le nez et les pommettes
 if(s.freckles){const fr=rng((s.seed^0x51f)>>>0);for(let i=0;i<26;i++){const sd=i%2?1:-1,x=CX+sd*(4+fr()*30),y=118+fr()*20-Math.max(0,(Math.abs(x-CX)-24))*.4;h+='<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(.8+fr()*.9)+'" fill="#a0562e" opacity="'+f(.35+fr()*.35)+'"/>';}}
 // visage moins gracieux : nez plus marqué, narines visibles
 if(pl)h+='<path d="M'+(CX-6)+' 136 Q'+(CX-9)+' 131 '+(CX-3)+' 129 M'+(CX+6)+' 136 Q'+(CX+9)+' 131 '+(CX+3)+' 129 M'+(CX+3)+' 112 Q'+(CX+7)+' 120 '+(CX+5)+' 128" fill="none" stroke="'+dk+'" stroke-width="1.7" stroke-linecap="round" opacity="'+f(.45+.4*pl)+'"/>';
 // cicatrices : joue ou sourcil
 if(s.scar===1)h+='<path d="M'+(CX-36)+' 104 L'+(CX-15)+' 142" stroke="#b4615c" stroke-width="2.6" stroke-linecap="round" opacity=".85"/><path d="M'+(CX-31)+' 118 l6 -3 M'+(CX-25)+' 129 l6 -3" stroke="#b4615c" stroke-width="1.4" opacity=".7"/>';
 if(s.scar===2)h+='<path d="M'+(CX+27)+' 82 L'+(CX+19)+' 126" stroke="#b4615c" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>';
 if(s.beard)h+='<path d="'+sym(CX,[[0,150],[22,146],[36,128],[38,140],[28,160],[14,172],[0,176]])+'" fill="'+s.hair+'" opacity=".92"/><path d="M'+(CX-10)+' 147 Q'+CX+' 150 '+(CX+10)+' 147" fill="none" stroke="'+shade(S,-.45)+'" stroke-width="2"/>';
 if(s.mask)h+='<path d="'+sym(CX,[[0,124],[30,120],[44,118],[42,140],[26,160],[0,168]])+'" fill="#3a2a22"/><path d="M'+(CX-40)+' 126 L'+(CX+40)+' 126" stroke="#2a1d16" stroke-width="3"/>';
 if(s.tattoo&&s.r()<.5)h+='<path d="M'+(CX+30)+' 120 l6 14 M'+(CX+25)+' 122 l4 12" stroke="#1d1416" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>';
 return h;
}
function mix2(a,b,t){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);const c=sh=>Math.round(((A>>sh)&255)*(1-t)+((B>>sh)&255)*t);return'#'+((1<<24)+(c(16)<<16)+(c(8)<<8)+c(0)).toString(16).slice(1);}

/* ---------- cheveux ---------- */
function hairDefs(s,d){d.push(lin('hr',[[0,shade(s.hair,s.hairKey==='noir'?.28:.32)],[.45,s.hair],[1,shade(s.hair,-.35)]]));}
function hairBack(s){
 const H='url(#hr)',st=s.style;let h='';
 if(st==='boucles'){for(let i=0;i<30;i++){const a=Math.PI*(.9+i/29*1.2),rr=58+s.r()*8;h+='<circle cx="'+f(CX+Math.cos(a)*rr)+'" cy="'+f(96+Math.sin(a)*rr*1.05)+'" r="'+f(16+s.r()*7)+'" fill="'+shade(s.hair,-.15)+'"/>';}
  if(s.F&&!s.child)h+='<path d="'+smooth([[CX-62,110],[CX-70,200],[CX-50,250],[CX+50,250],[CX+70,200],[CX+62,110]])+'" fill="'+shade(s.hair,-.2)+'"/>';return h;}
 const long=st==='long'||st==='tresse',len=st==='long'?(s.child?300:390):st==='mi'?205:st==='carre'?170:0;
 if(len){const w=st==='carre'?56:52;h+='<path d="'+smooth([[CX-w,70],[CX-w-10,140],[CX-w-6,len-60],[CX-w+8,len],[CX-20,len-14],[CX,len+6],[CX+20,len-14],[CX+w-8,len],[CX+w+6,len-60],[CX+w+10,140],[CX+w,70],[CX,30]])+'" fill="'+H+'"/>';}
 if(st==='queue')h+='<path d="'+limb([[CX+30,62],[CX+62,110],[CX+70,200],[CX+52,s.child?260:320]],[34,40,30,4])+'" fill="'+H+'"/><circle cx="'+(CX+30)+'" cy="64" r="9" fill="'+shade(s.hair,-.3)+'"/>';
 if(st==='chignon')h+='<circle cx="'+CX+'" cy="34" r="26" fill="'+H+'"/><path d="M'+(CX-18)+' 30 Q'+CX+' 18 '+(CX+18)+' 30" stroke="'+shade(s.hair,.3)+'" stroke-width="2.5" fill="none" opacity=".6"/>';
 if(st==='tresse')for(let i=0;i<6;i++)h+='<ellipse cx="'+(CX+48+Math.sin(i)*3)+'" cy="'+(180+i*30)+'" rx="13" ry="17" fill="'+(i%2?H:shade(s.hair,-.15))+'"/>';
 return h;
}
function hairFront(s){
 const H='url(#hr)',st=s.style,r=s.r;let h='';
 if(st==='ras')return'<path d="'+smooth([[CX-45,98],[CX-48,60],[CX-30,36],[CX,30],[CX+30,36],[CX+48,60],[CX+45,98],[CX+38,70],[CX,56],[CX-38,70]])+'" fill="'+H+'"/>';
 // calotte
 h+='<path d="'+smooth([[CX-47,104],[CX-52,62],[CX-32,32],[CX,24],[CX+32,32],[CX+52,62],[CX+47,104],[CX+40,76],[CX,62],[CX-40,76]])+'" fill="'+H+'"/>';
 if(st==='boucles'){for(let i=0;i<14;i++){const x=CX-44+i*6.8;h+='<circle cx="'+f(x)+'" cy="'+f(52+Math.abs(i-6.5)*2.4+r()*4)+'" r="'+f(9+r()*4)+'" fill="'+(i%2?H:shade(s.hair,.1))+'"/>';}return h;}
 const n=st==='court'?9:7,tip=st==='court'?92:st==='carre'?104:100;
 for(let i=0;i<n;i++){const t=i/(n-1),x0=CX-42+t*84,bend=(t-.5)*(st==='court'?26:14)+(r()-.5)*8,len=tip+(r()-.5)*12-Math.abs(t-.5)*(st==='court'?18:8);
  h+='<path d="'+limb([[x0,44],[x0+bend*.5,(44+len)/2],[x0+bend,len]],[st==='court'?24:28,20,1.5])+'" fill="'+(i%2?H:shade(s.hair,-.08))+'"/>';}
 if(st==='court')for(let i=0;i<5;i++){const x0=CX-30+i*15;h+='<path d="'+limb([[x0,44],[x0+(i-2)*8,22-r()*10]],[18,1])+'" fill="'+H+'"/>';}
 // mèches sur les côtés
 const side=st==='long'||st==='mi'||st==='tresse'?(s.child?170:200):st==='carre'?158:st==='queue'||st==='chignon'?150:118;
 [-1,1].forEach(sg=>{h+='<path d="'+limb([[CX+sg*44,70],[CX+sg*49,(70+side)/2],[CX+sg*44+sg*(r()*6),side]],[17,14,2])+'" fill="'+H+'"/>';});
 // reflet
 h+='<path d="M'+(CX-30)+' 46 Q'+CX+' 36 '+(CX+30)+' 46 L'+(CX+24)+' 52 L'+(CX+14)+' 47 L'+(CX+6)+' 53 L'+(CX-4)+' 47 L'+(CX-14)+' 53 L'+(CX-24)+' 48Z" fill="#fff" opacity=".28"/>';
 if(s.vine)for(let i=0;i<9;i++){const a=Math.PI*(1.05+i/8*.9);h+='<ellipse cx="'+f(CX+Math.cos(a)*50)+'" cy="'+f(70+Math.sin(a)*42)+'" rx="8" ry="4.5" transform="rotate('+f(a*57)+' '+f(CX+Math.cos(a)*50)+' '+f(70+Math.sin(a)*42)+')" fill="'+(i%2?'#4f8f3a':'#6fb04a')+'"/>';}
 return h;
}
function hood(s){if(!s.hood)return'';return'<path d="'+smooth([[CX-56,150],[CX-62,70],[CX-36,22],[CX,12],[CX+36,22],[CX+62,70],[CX+56,150],[CX+44,96],[CX+30,52],[CX,44],[CX-30,52],[CX-44,96]])+'" fill="'+s.hood+'"/><path d="M'+(CX-40)+' 60 Q'+CX+' 30 '+(CX+40)+' 60" fill="none" stroke="'+shade(s.hood,.25)+'" stroke-width="2" opacity=".6"/>';}

/* ---------- coiffes et motifs d'armure ---------- */
// Chevaliers : pas de casque (charte v3), seulement un petit accessoire aux couleurs de l'armure.
function accessory(s){
 const M='url(#mt)',E='url(#mte)',g=s.gem,k=s.F?.95:1,pick=(s.seed>>>3)%3;
 if(pick===0){const x=CX+31,y=60;return'<g transform="rotate(-24 '+x+' '+y+')"><path d="M'+(x-13)+' '+y+' L'+(x+13)+' '+(y-3.5)+' L'+(x+13)+' '+(y+3.5)+'Z" fill="'+M+'" stroke="'+E+'" stroke-width="1"/><circle cx="'+x+'" cy="'+y+'" r="4.2" fill="'+g+'" stroke="'+E+'" stroke-width="1"/></g>';}
 if(pick===1)return'<path d="M'+(CX-41)+' 68 Q'+CX+' 50 '+(CX+41)+' 68" fill="none" stroke="'+M+'" stroke-width="2.4"/><path d="M'+CX+' 56 l4.5 6 l-4.5 7 l-4.5 -7Z" fill="'+g+'" stroke="'+E+'" stroke-width=".8"/>';
 const ex=f(CX-46*k);return'<path d="M'+ex+' 126 L'+ex+' 136" stroke="'+M+'" stroke-width="1.8"/><path d="M'+ex+' 135 l4.5 6 l-4.5 9 l-4.5 -9Z" fill="'+g+'" stroke="'+E+'" stroke-width=".8"/>';
}
function headgear(s){
 if(s.outfit==='knight')return accessory(s);
 if(s.outfit!=='foe'||!s.motif)return'';
 if(s.hood&&s.motif!=='crescent')return'';
 const M='url(#mt)',E='url(#mte)',g=s.gem;let h='';
 const tiara='<path d="'+smooth([[CX-46,72],[CX-30,54],[CX,48],[CX+30,54],[CX+46,72],[CX+30,62],[CX,57],[CX-30,62]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.5"/><path d="M'+CX+' 40 L'+(CX+8)+' 52 L'+CX+' 64 L'+(CX-8)+' 52Z" fill="'+M+'"/><circle cx="'+CX+'" cy="52" r="3.6" fill="'+g+'"/>';
 h+=tiara;
 const pair=(p)=>p+'<g transform="translate(400 0) scale(-1 1)">'+p+'</g>';
 switch(s.motif){
  case'horns':h+=pair('<path d="'+limb([[CX+38,58],[CX+64,40],[CX+80,10],[CX+76,-8]],[16,13,8,1])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.2"/>');break;
  case'backhorns':h+=pair('<path d="'+limb([[CX+30,50],[CX+50,20],[CX+76,4],[CX+96,14]],[15,12,8,1])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.2"/>');break;
  case'curl':h+=pair('<circle cx="'+(CX+54)+'" cy="80" r="17" fill="'+M+'" stroke="'+E+'" stroke-width="1.5"/><path d="M'+(CX+54)+' 80 m-9 0 a9 9 0 1 1 9 9 a5 5 0 1 1 -4 -6" fill="none" stroke="'+E+'" stroke-width="2"/>');break;
  case'mane':for(let i=0;i<9;i++){const a=Math.PI*(1.1+i/8*.8);h+='<path d="'+limb([[CX+Math.cos(a)*40,64+Math.sin(a)*30],[CX+Math.cos(a)*66,64+Math.sin(a)*54]],[16,1])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1"/>';}break;
  case'wings':h+=pair('<path d="'+smooth([[CX+40,70],[CX+60,44],[CX+86,30],[CX+80,46],[CX+92,48],[CX+78,60],[CX+86,66],[CX+62,72]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.2"/>');break;
  case'crescent':h+='<path d="M'+(CX-16)+' 34 A18 18 0 1 0 '+(CX+16)+' 34 A14 14 0 1 1 '+(CX-16)+' 34Z" fill="'+(s.metal==='or'?M:'#e8eef8')+'" stroke="'+E+'" stroke-width="1"/>';break;
  case'fins':h+=pair('<path d="'+smooth([[CX+42,74],[CX+70,56],[CX+64,80],[CX+76,92],[CX+46,88]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.2"/>');break;
  case'spikes':for(let i=0;i<5;i++)h+='<path d="'+limb([[CX-24+i*12,52-Math.abs(i-2)*-3],[CX-30+i*15,18-(2-Math.abs(i-2))*8]],[12,1])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1"/>';break;
  case'unicorn':h+='<path d="'+limb([[CX,48],[CX+2,20],[CX+4,-6]],[12,7,1])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1"/>';break;
  case'twin':h+=pair('<circle cx="'+(CX+48)+'" cy="66" r="10" fill="'+M+'" stroke="'+E+'" stroke-width="1.2"/><circle cx="'+(CX+48)+'" cy="66" r="3" fill="'+g+'"/>');break;
  case'scales':h+=pair('<path d="M'+(CX+46)+' 66 L'+(CX+56)+' 96" stroke="'+E+'" stroke-width="1.5"/><path d="M'+(CX+46)+' 96 Q'+(CX+56)+' 108 '+(CX+66)+' 96Z" fill="'+M+'"/>');break;
  case'water':h+=pair('<path d="'+smooth([[CX+40,64],[CX+58,40],[CX+74,46],[CX+64,60],[CX+72,70],[CX+52,74]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.2"/>');break;
  case'crest':h+='<path d="'+smooth([[CX-6,50],[CX,6],[CX+10,-2],[CX+6,20],[CX+8,50]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.2"/>';break;
 }
 return h;
}

/* ---------- corps ---------- */
function torsoPath(s,G){
 const {sw,wa,hip,neck}=G;
 if(s.F)return sym(CX,[[0,178],[neck,180],[34,192],[sw-2,205],[sw,220],[sw-10,248],[sw-12,268],[sw-18,300],[wa,358],[hip-4,400],[hip,438],[hip-8,476],[26,496],[0,498]]);
 return sym(CX,[[0,178],[neck,180],[44,194],[sw-4,206],[sw,222],[sw-10,252],[sw-16,300],[wa+4,338],[wa,372],[hip,424],[hip-6,470],[28,492],[0,496]]);
}
// Bras : épaule, haut du bras, coude, avant-bras, poignet. Le bras avant est un peu plié, la main près de la hanche.
const armSpine=(G,side,front)=>{const sw=G.sw;const P=front?[[sw-13,212],[sw-6,276],[sw+3,336],[sw-1,392],[sw-9,440]]:[[sw-13,212],[sw-5,278],[sw+1,338],[sw+4,396],[sw+5,448]];return P.map(([x,y])=>[CX+side*x,y]);};
const armW=G=>{const a=G.arm;return[a[0],a[0]*1.04,a[1],a[1]*1.08,a[2]];};
// Jambes : hanche, cuisse, genou, mollet, cheville. Genoux légèrement rentrés pour une posture plus élégante.
const legSpine=(side,F)=>(F?[[30,438],[33,520],[28,600],[23,655],[25,722],[24,792],[23,840]]:[[31,438],[36,520],[34,600],[31,655],[33,722],[32,792],[31,840]]).map(([x,y])=>[CX+side*x,y]);
function legW(G){const t=G.thigh;return[t[0],t[0]*.93,t[0]*.7,t[1],t[1]*1.12,t[1]*.74,t[2]];}
function hand(x,y,side,sz,fill,stroke){
 return'<g transform="translate('+f(x)+' '+f(y)+') rotate('+(side*-8)+')"><ellipse cx="0" cy="'+f(sz*.7)+'" rx="'+f(sz*.62)+'" ry="'+f(sz*.95)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.3"/><ellipse cx="'+f(-side*sz*.5)+'" cy="'+f(sz*.45)+'" rx="'+f(sz*.22)+'" ry="'+f(sz*.48)+'" transform="rotate('+(side*25)+' '+f(-side*sz*.5)+' '+f(sz*.45)+')" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.1"/><path d="M'+f(-sz*.3)+' '+f(sz*1.25)+' v'+f(sz*.3)+' M0 '+f(sz*1.3)+' v'+f(sz*.3)+' M'+f(sz*.3)+' '+f(sz*1.25)+' v'+f(sz*.3)+'" stroke="'+stroke+'" stroke-width="1" opacity=".6"/></g>';
}

function tattooArm(s,sp){const [a,b]=[sp[0],sp[1]];const x=(a[0]+b[0])/2,y=(a[1]+b[1])/2;return'<path d="M'+f(x-8)+' '+f(y-24)+' q10 8 0 16 q-10 8 0 16 M'+f(x+6)+' '+f(y-18)+' l-4 14 l6 10" fill="none" stroke="#1b1214" stroke-width="2.6" stroke-linecap="round" opacity=".75"/>';}

const line=S=>shade(S,-.5);
function arm(s,G,side,front){
 const S=s.skin,sp=armSpine(G,side,front),w=armW(G),L=line(S);
 let h='<path d="'+limb(sp,w)+'" fill="'+S+'" stroke="'+L+'" stroke-width="1.5"/>';
 // ombre portée le long du bras, côté opposé à la lumière
 h+='<path d="'+limb(sp.slice(1),[w[1]*.35,w[2]*.3,w[3]*.3,w[4]*.25])+'" fill="'+shade(S,-.18)+'" opacity=".55" transform="translate('+(side*4)+' 0)"/>';
 if(!s.F&&!s.child)h+='<path d="M'+f(sp[1][0]-side*4)+' '+f(sp[1][1]-14)+' q'+(side*6)+' 14 0 30" stroke="'+shade(S,-.22)+'" stroke-width="1.4" fill="none" opacity=".7"/>';
 if(s.tattoo)h+=tattooArm(s,sp);
 const end=sp[4],o=s.outfit,armored=o==='knight'||o==='foe';
 const M='url(#mt)',E='url(#mte)',rk=s.metal,gaunt=armored&&rk!=='bronze'&&rk!=='garde';
 h+=hand(end[0],end[1]-4,side,w[4]*.95,gaunt?M:S,gaunt?shade(METALS[rk][3],0):L);
 if(armored){
  h+='<path d="'+limb([sp[2],sp[3],[end[0],end[1]-4]],[w[2]+6,w[3]+7,w[4]+6])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.5"/>';
  h+='<path d="'+limb([sp[2],sp[3]],[3,3])+'" fill="#fffbe8" opacity=".5" transform="translate('+(-side*4)+' 0)"/>';
  if(!gaunt)h+='<path d="M'+f(end[0]-9)+' '+f(end[1]+2)+' h18 M'+f(end[0]-9)+' '+f(end[1]+8)+' h18" stroke="#e9dcc4" stroke-width="3" stroke-linecap="round"/>';
  h+=pauldron(s,G,side);
 }else if(o==='apprentice'){for(let i=0;i<4;i++){const t=i/4,x=sp[2][0]+(sp[3][0]-sp[2][0])*t*1.6,y=sp[2][1]+(sp[4][1]-sp[2][1])*t;h+='<path d="M'+f(x-w[3]*.6)+' '+f(y+4)+' l'+f(w[3]*1.2)+' -6" stroke="#efe4cf" stroke-width="4" stroke-linecap="round"/>';}}
 return h;
}
function pauldron(s,G,side){
 const rk=s.metal,M='url(#mt)',E='url(#mte)';
 const size={or:64,argent:52,bronze:44,garde:40,crimson:58,steel:48,violet:46,jade:44,dark:44}[rk]||48;
 if(s.rank==='bronze'&&side<0)return'';
 let h='';const x=CX+side*(G.sw-6);
 for(let k=2;k>=0;k--){const y=204+k*15,w=size-k*7,cx=x+side*(k*4+6);
  h+='<path d="'+smooth([[cx-w/2,y+10],[cx-w/2+4,y-6],[cx,y-12],[cx+w/2-4,y-6],[cx+w/2,y+10],[cx,y+16]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.6"/>';
  h+='<path d="M'+f(cx-w/2+8)+' '+f(y+4)+' Q'+f(cx)+' '+f(y-6)+' '+f(cx+w/2-8)+' '+f(y+4)+'" stroke="'+METALS[rk][3]+'" stroke-width="1" fill="none" opacity=".55"/>';
  for(let q=-1;q<=1;q++)h+='<circle cx="'+f(cx+q*w*.3)+'" cy="'+f(y+9)+'" r="2" fill="#fff8e0" stroke="'+METALS[rk][3]+'" stroke-width=".6"/>';}
 if(s.spiky)for(let q=0;q<3;q++)h+='<path d="'+limb([[x+side*(q*10),196],[x+side*(q*14+6),166-q*4]],[9,1])+'" fill="'+M+'"/>';
 return h;
}
function legs(s,G){
 const S=s.skin;let h='';
 [-1,1].forEach(sd=>{const sp=legSpine(sd,s.F),W=legW(G);h+='<path d="'+limb(sp,W)+'" fill="'+S+'" stroke="'+line(S)+'" stroke-width="1.5"/><path d="'+limb(sp.slice(1),W.slice(1).map(x=>x*.3))+'" fill="'+shade(S,-.16)+'" opacity=".55" transform="translate('+(sd*7)+' 0)"/><path d="'+limb(sp.slice(1,4),[4,3,2])+'" fill="#fff4e0" opacity=".25" transform="translate('+(-sd*8)+' 0)"/>';
  if(s.tattoo&&sd>0&&s.F)h+='<path d="M'+(CX+30)+' 540 q12 10 0 22 q-12 10 0 22 m10 -40 l-4 30" fill="none" stroke="#1b1214" stroke-width="2.6" opacity=".7"/>';});
 return h;
}
// Sous-vêtement ajusté, tunique, robe… selon la tenue.
function clothes(s,G){
 const {sw,wa,hip}=G,o=s.outfit,c=s.cloth;let h='';
 const suit='url(#suit)',suitL='#4a3a44';
 const legsCover=(y0,col)=>[-1,1].map(sd=>'<path d="'+limb(legSpine(sd,s.F),legW(G).map(x=>x+3))+'" fill="'+col+'"/>').join('');
 if(o==='knight'||o==='foe'){
  if(s.robe){h+='<path d="'+smooth([[CX-sw+12,210],[CX-hip-24,520],[CX-hip-40,820],[CX+hip+40,820],[CX+hip+24,520],[CX+sw-12,210],[CX,250]])+'" fill="'+c+'"/><path d="'+smooth([[CX-30,260],[CX-60,820],[CX-20,820]])+'" fill="'+shade(c,-.2)+'"/>';return h;}
  // jambes : collant sombre (ou cuisses nues entre short et jambières pour les femmes adultes)
  // Femmes adultes : short et cuisses nues jusqu'aux jambières. Hommes : collant de combat.
  h+=s.F?legsCover(470,suit).replace(/<path/g,'<path clip-path="url(#shorts)"'):legsCover(440,suit);
  // torse
  if(s.F&&s.cover==='midriff')h+='<path d="'+sym(CX,[[0,382],[wa+3,374],[hip,428],[hip-6,478],[28,500],[0,504]])+'" fill="'+suit+'"/>';
  else if(!s.F&&s.cover==='bare')h+='<path d="'+sym(CX,[[0,384],[wa+3,374],[hip,428],[hip-6,478],[28,500],[0,504]])+'" fill="'+suit+'"/>';
  else h+='<path d="'+torsoPath(s,G)+'" fill="'+suit+'" opacity="'+(s.F?1:.96)+'"/>'+(s.F?'':'<path d="M'+(CX-26)+' 196 Q'+CX+' 232 '+(CX+26)+' 196" fill="'+S_skin(s)+'"/>');
  if(!s.F&&s.cover!=='bare')h+='<path d="'+sym(CX,[[0,200],[sw-30,214],[sw-34,250],[0,252]])+'" fill="'+suitL+'" opacity=".25"/>';
 }else if(o==='apprentice'){
  const lin1='#efe4cf';
  h+=legsCover(470,'#6a4a32').replace(/<path/g,'<path clip-path="url(#knee)"');
  h+='<path d="'+smooth([[CX-sw+6,206],[CX-wa-10,330],[CX-hip-12,470],[CX-hip-6,540],[CX+hip+6,540],[CX+hip+12,470],[CX+wa+10,330],[CX+sw-6,206],[CX+16,198],[CX,232],[CX-16,198]])+'" fill="'+lin1+'"/>';
  h+='<path d="'+smooth([[CX-hip-6,520],[CX,532],[CX+hip+6,520],[CX+hip+6,540],[CX,548],[CX-hip-6,540]])+'" fill="'+shade(lin1,-.18)+'"/>';
  h+='<path d="M'+(CX-sw+14)+' 215 L'+(CX+wa)+' 380 M'+(CX+sw-14)+' 215 L'+(CX-wa)+' 380" stroke="#7a5236" stroke-width="7" opacity=".9"/>';
  h+='<rect x="'+(CX-wa-6)+'" y="372" width="'+(2*wa+12)+'" height="14" rx="4" fill="#6a4630"/>';
 }else{
  h+='<path d="'+smooth([[CX-sw+6,206],[CX-wa-8,340],[CX-hip-16,520],[CX-hip-20,640],[CX+hip+20,640],[CX+hip+16,520],[CX+wa+8,340],[CX+sw-6,206],[CX,226]])+'" fill="'+(s.elder?'#8a7a66':'#b49a74')+'"/><rect x="'+(CX-wa-6)+'" y="370" width="'+(2*wa+12)+'" height="12" rx="4" fill="#5a4030"/>';
 }
 return h;
}
const S_skin=s=>s.skin;
function armorBody(s,G){
 if(s.outfit!=='knight'&&s.outfit!=='foe')return'';
 if(s.robe)return'<path d="'+sym(CX,[[0,198],[30,196],[G.sw-24,214],[G.sw-30,250],[0,262]])+'" fill="url(#mt)" stroke="url(#mte)" stroke-width="1.5"/>'+emblem(s,232);
 const {sw,wa,hip}=G,M='url(#mt)',E='url(#mte)',rk=s.rank||s.metal;let h='';
 // jambières
 [-1,1].forEach(sd=>{const sp=legSpine(sd,s.F),W=legW(G);
  h+='<path d="'+limb([sp[3],sp[4],sp[5],sp[6],[sp[6][0],sp[6][1]+22]],[W[3]+10,W[4]+9,W[5]+9,W[6]+10,W[6]+14])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.5"/>';
  h+='<path d="'+limb([sp[4],sp[5]],[4,3])+'" fill="#fffbe8" opacity=".5" transform="translate('+(-sd*5)+' 0)"/>';
  h+='<ellipse cx="'+f(sp[3][0])+'" cy="'+f(sp[3][1])+'" rx="'+f(W[3]*.7)+'" ry="17" fill="'+M+'" stroke="'+E+'" stroke-width="1.5"/><circle cx="'+f(sp[3][0])+'" cy="'+f(sp[3][1])+'" r="3.4" fill="'+s.gem+'"/>';
  if(rk==='or'&&!s.F)h+='<path d="'+limb([sp[1],sp[2]],[W[1]*.7,W[2]*.7])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.3"/>';
  const ax=sp[6][0];h+='<path d="'+smooth([[ax-W[6]*.8,860],[ax-W[6]*.7,840],[ax+W[6]*.7,840],[ax+sd*4+W[6]*1.1,874],[ax-W[6]*.9,878]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.5"/>';});
 // ceinture et tassettes
 const tl=s.F?456:482;
 [-1,1].forEach(sd=>{for(let q=0;q<3;q++){const x=CX+sd*(10+q*20),fan=sd*q*7;h+='<path d="'+smooth([[x-11,392],[x+11,392],[x+12+fan,tl-q*6],[x+fan,tl+8-q*6],[x-12+fan,tl-q*6]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.3"/>';}});
 h+='<path d="'+smooth([[CX-wa-8,372],[CX,378],[CX+wa+8,372],[CX+wa+10,392],[CX,398],[CX-wa-10,392]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.5"/><path d="M'+CX+' 376 L'+(CX+9)+' 386 L'+CX+' 396 L'+(CX-9)+' 386Z" fill="'+s.gem+'" stroke="'+E+'" stroke-width="1"/>';
 // plastron
 if(s.F){
  const bu=s.bust==null?.45:s.bust,by=262+bu*4,bx=24+bu*3,rx=22+bu*14,ry=19+bu*13;
  h+='<path d="'+sym(CX,[[0,192],[18,192],[38,200],[sw-20,212],[sw-22,226],[0,214]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.3"/>';
  [-1,1].forEach(sd=>{const x=CX+sd*bx;h+='<path d="'+smooth([[x-sd*rx*.15,by-ry],[x+sd*rx*.85,by-ry*.6],[x+sd*rx,by+ry*.2],[x+sd*rx*.55,by+ry],[x-sd*rx*.6,by+ry*.85],[x-sd*rx*.95,by+ry*.1]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.6"/><path d="M'+f(x+sd*rx*.3)+' '+f(by-ry*.55)+' q'+f(sd*rx*.45)+' 8 '+f(sd*rx*.5)+' 26" stroke="#fffbe8" stroke-width="2.2" fill="none" opacity=".55"/>';});
  if(s.cover!=='midriff')h+='<path d="'+sym(CX,[[0,290],[wa+6,296],[wa+2,340],[wa,366],[0,370]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.3"/>';
  h+=emblem(s,286);
 }else if(s.cover==='bare'){
  // torse nu barré de sangles de cuir, une petite plaque ronde sur le cœur
  h+='<path d="M'+(CX+sw-16)+' 208 L'+(CX-wa+4)+' 372" stroke="#5a3a24" stroke-width="11" stroke-linecap="round"/><path d="M'+(CX+sw-16)+' 208 L'+(CX-wa+4)+' 372" stroke="#7a5236" stroke-width="5" stroke-linecap="round"/>';
  h+='<circle cx="'+(CX+20)+'" cy="262" r="22" fill="'+M+'" stroke="'+E+'" stroke-width="1.6"/><circle cx="'+(CX+20)+'" cy="262" r="5" fill="'+s.gem+'"/>'+emblem(s,262).replace(/cx="(\d+(\.\d+)?)"/g,(m,x)=>'cx="'+f(+x+20)+'"').replace(/M([\d.]+) /,(m,x)=>'M'+f(+x+20)+' ').replace(/ L([\d.]+) /g,(m,x)=>' L'+f(+x+20)+' ');
 }else{
  h+='<path d="'+sym(CX,[[0,196],[30,197],[sw-22,212],[sw-26,262],[sw-32,300],[wa+2,336],[0,344]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.8"/>';
  h+='<path d="M'+CX+' 204 L'+CX+' 338" stroke="url(#mte)" stroke-width="1.6" opacity=".6"/><path d="M'+(CX-8)+' 236 Q'+(CX-40)+' 270 '+(CX-sw+30)+' 250 M'+(CX+8)+' 236 Q'+(CX+40)+' 270 '+(CX+sw-30)+' 250" stroke="url(#mte)" stroke-width="1.8" fill="none"/>';
  h+='<path d="M'+(CX-28)+' 220 q-12 22 -6 48" stroke="#fffbe8" stroke-width="2.6" fill="none" opacity=".5"/>';
  if(rk==='or'||rk==='crimson')for(let q=0;q<2;q++)h+='<path d="'+sym(CX,[[0,342+q*16],[wa,340+q*16],[wa,354+q*16],[0,356+q*16]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.2"/>';
  h+=emblem(s,268);
 }
 return h;
}
// Emblème de la constellation : un petit motif d'étoiles reliées qui brille sur le plastron.
function emblem(s,y){
 const r=rng(((s.cons?s.cons.k.length*977:13)+(s.cons?s.cons.n.charCodeAt(0)*31:7))>>>0);const pts=[];for(let i=0;i<5;i++)pts.push([CX-12+r()*24,y-10+r()*20]);
 return'<path d="M'+pts.map(p=>f(p[0])+' '+f(p[1])).join(' L')+'" stroke="#fff6d0" stroke-width=".8" fill="none" opacity=".6"/>'+pts.map((p,i)=>'<circle cx="'+f(p[0])+'" cy="'+f(p[1])+'" r="'+(i===0?2.4:1.5)+'" fill="'+(i===0?s.gem:'#fffbe8')+'"/>').join('');
}
function cape(s,G){
 if(!((s.outfit==='knight'&&(s.rank==='or'||s.rank==='argent'))||s.boss||(s.outfit==='foe'&&s.r()<.4)))return'';
 const c=s.cloth,{sw}=G;
 return'<path d="'+smooth([[CX-sw+12,200],[CX-sw-22,420],[CX-sw-46,800],[CX-sw+6,780],[CX-40,812],[CX+10,790],[CX+60,816],[CX+sw-4,784],[CX+sw+46,806],[CX+sw+22,420],[CX+sw-12,200],[CX,190]])+'" fill="url(#cp)"/>';
}
function backExtras(s){
 let h='';const M='url(#mt)',E='url(#mte)';
 if(s.motif==='tail'&&s.outfit==='knight')h+='<path d="'+limb([[CX+10,420],[CX+70,380],[CX+110,280],[CX+100,180],[CX+70,150]],[22,20,16,12,4])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.6"/><path d="M'+(CX+70)+' 150 l-14 -14 l20 -2z" fill="'+M+'"/>';
 if((s.motif==='wings'&&s.outfit==='knight'&&s.rank!=='bronze')||s.faction==='hermes'){[-1,1].forEach(sd=>{h+='<path d="'+smooth([[CX+sd*40,240],[CX+sd*120,150],[CX+sd*176,120],[CX+sd*160,190],[CX+sd*186,210],[CX+sd*150,260],[CX+sd*166,300],[CX+sd*100,300]])+'" fill="'+M+'" stroke="'+E+'" stroke-width="1.5" opacity=".95"/>';});}
 if(s.bow)h+='<path d="M'+(CX-80)+' 160 Q'+(CX-150)+' 360 '+(CX-70)+' 560" fill="none" stroke="#c8d4e8" stroke-width="6"/><path d="M'+(CX-80)+' 160 L'+(CX-70)+' 560" stroke="#eef" stroke-width="1"/>';
 if(s.glow)h='<ellipse cx="'+CX+'" cy="460" rx="190" ry="440" fill="url(#aura)"/>'+h;
 return h;
}

/* ---------- assemblage ---------- */
export function layersOf(s){
 s.r=rng((s.seed^0x9e3779b9)>>>0); // même tirage à chaque dessin : un personnage a toujours la même allure
 const G=geo(s),d=[];
 const M=METALS[s.metal]||METALS.bronze;
 d.push(metalDefs('mt',M));hairDefs(s,d);d.push(lin('cp',[[0,shade(s.cloth,.15)],[1,shade(s.cloth,-.45)]]));
 d.push(rad('aura',[[0,s.faction?'#ff5030':'#ffd27a',.35],[1,'#ff5030',0]]));
 d.push('<clipPath id="shorts"><rect x="0" y="0" width="400" height="'+(s.F?505:900)+'"/></clipPath><clipPath id="knee"><rect x="0" y="0" width="400" height="640"/></clipPath>');
 d.push(lin('suit',[[0,'#3b2c36'],[.2,'#2a1f28'],[.22,'#1c141b'],[1,'#120c12']],1,0));
 d.push('<clipPath id="tc"><path d="'+torsoPath(s,G)+'"/></clipPath>');
 const kid=s.child?'<g transform="translate(200 182) scale(.82 .7) translate(-200 -182)">':'<g>';
 // Tête un peu plus petite chez l'adulte : silhouette élancée (environ 8 têtes de haut).
 const HS=s.child?'':' transform="translate(200 168) scale(.86) translate(-200 -168)"';
 const back=backExtras(s)+cape(s,G)+'<g'+HS+'>'+hairBack(s)+'</g>';
 const neck='<path d="M'+(CX-G.neck)+' 140 L'+(CX-G.neck-2)+' 192 L'+(CX+G.neck+2)+' 192 L'+(CX+G.neck)+' 140Z" fill="'+s.skin+'"/><path d="M'+(CX-G.neck)+' 160 Q'+CX+' 184 '+(CX+G.neck)+' 160 L'+(CX+G.neck)+' 150 Q'+CX+' 172 '+(CX-G.neck)+' 150Z" fill="'+shade(s.skin,-.2)+'" opacity=".6"/>';
 const torso='<path d="'+torsoPath(s,G)+'" fill="'+s.skin+'" stroke="'+line(s.skin)+'" stroke-width="2"/><path d="M'+(CX+G.wa*.35)+' 176 Q'+(CX+G.wa*.1)+' 300 '+(CX+G.wa*.5)+' 520 L400 520 L400 176Z" fill="'+shade(s.skin,-.2)+'" opacity=".55" clip-path="url(#tc)"/>'+(s.F&&!s.child?'<path d="M'+(CX-30)+' 286 Q'+(CX-24)+' 292 '+(CX-10)+' 288 M'+(CX+30)+' 286 Q'+(CX+24)+' 292 '+(CX+10)+' 288 M'+(CX-2)+' 322 v14" stroke="'+shade(s.skin,-.3)+'" stroke-width="1.4" fill="none" opacity=".7"/>':'')+(!s.F&&!s.child?'<path d="M'+(CX-34)+' 200 Q'+(CX-16)+' 206 '+(CX-4)+' 200 M'+(CX+34)+' 200 Q'+(CX+16)+' 206 '+(CX+4)+' 200" stroke="'+shade(s.skin,-.25)+'" stroke-width="1.6" fill="none"/><path d="M'+(CX-8)+' 300 h16 M'+(CX-9)+' 322 h18 M'+(CX-8)+' 344 h16 M'+CX+' 290 v70" stroke="'+shade(s.skin,-.2)+'" stroke-width="1.6" opacity=".6"/>':'');
 // cicatrice en travers du ventre (visible sur les tenues qui le découvrent)
 const scarB=s.scar===3?'<path d="M'+(CX+36)+' 300 L'+(CX-14)+' 352" stroke="#b4615c" stroke-width="2.8" stroke-linecap="round" opacity=".8"/><path d="M'+(CX+22)+' 312 l5 6 M'+(CX+6)+' 330 l5 6" stroke="#b4615c" stroke-width="1.4" opacity=".7"/>':'';
 const bodyG=kid+legs(s,G)+torso+scarB+arm(s,G,-1,false)+clothes(s,G)+armorBody(s,G)+neck+'</g>';
 const head='<g'+HS+'>'+face(s,d)+hood(s)+hairFront(s)+headgear(s)+'</g>';
 const body=bodyG+head;
 const armL=kid+arm(s,G,1,true)+'</g>';
 const sw=G.sw,shoulder=s.child?[CX+(sw-9)*.82,182+(214-182)*.7]:[CX+sw-9,214];
 return{defs:'<defs>'+d.join('')+'</defs>',back,body,arm:armL,shoulder,feet:s.child?182+(876-182)*.7:876};
}
const W=400,H=900;
export function svgFull(s,{w=W,h=H,bg=null}={}){
 const L=layersOf(s);
 return'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+w+'" height="'+h+'">'+L.defs+(bg||'')+'<g>'+L.back+'</g><g>'+L.body+'</g><g>'+L.arm+'</g></svg>';
}
// Portrait (tête et épaules) : même dessin, cadré serré, avec un fond de couchant.
export function svgBust(s,{size=256,frame=null,transparent=false}={}){
 const L=layersOf(s);
 const vb=s.child?'108 14 184 184':'110 28 180 180';
 const bg=transparent?'':'<rect x="0" y="0" width="400" height="400" fill="url(#bgp)"/><circle cx="270" cy="60" r="70" fill="url(#sun)"/>';
 const defs=L.defs.replace('</defs>',lin('bgp',[[0,frame&&frame[0]||'#f3cf8a'],[.55,frame&&frame[1]||'#d88a52'],[1,frame&&frame[2]||'#4a2622']])+rad('sun',[[0,'#fff4d6',.9],[1,'#ffd080',0]])+'</defs>');
 return'<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+vb+'" width="'+size+'" height="'+size+'">'+defs+bg+'<g>'+L.back+'</g><g>'+L.body+'</g><g>'+L.arm+'</g></svg>';
}
export function svgLayer(s,name,{w=W,h=H}={}){
 const L=layersOf(s);return'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+w+'" height="'+h+'">'+L.defs+'<g>'+L[name]+'</g></svg>';
}
export const dataUrl=svg=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
