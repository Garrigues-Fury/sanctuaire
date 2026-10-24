/* Bêtes mythiques (loup géant, sanglier d'Érymanthe, chimère), vues de trois quarts, tournées vers la gauche. */
import { f, lin, rad, rng, shade, smooth, limb } from './geom.js';

const KINDS={
 loup:{fur:'#6c7280',belly:'#b8bcc6',eye:'#ffd23a',ears:true},
 sanglier:{fur:'#5a3a26',belly:'#8a6448',eye:'#ff6a2a',tusks:true,bristle:true},
 chimere:{fur:'#b07a3a',belly:'#e0b070',eye:'#ff3a20',horns:true,wings:true,mane:true}
};
export function beastKind(name){return/sanglier/i.test(name)?'sanglier':/chim/i.test(name)?'chimere':'loup';}
export function svgBeast(kind,seed=1,{w=400,h=900,boss=false}={}){
 const K=KINDS[kind]||KINDS.loup,r=rng(seed),F=K.fur,D=shade(F,-.35),L=shade(F,.25);
 const defs='<defs>'+lin('fur',[[0,L],[.45,F],[1,D]])+rad('glow',[[0,K.eye,.9],[1,K.eye,0]])+rad('aura',[[0,'#ff5030',.35],[1,'#ff5030',0]])+'</defs>';
 let s='';
 if(boss)s+='<ellipse cx="200" cy="640" rx="200" ry="260" fill="url(#aura)"/>';
 s+='<ellipse cx="210" cy="868" rx="150" ry="16" fill="#000" opacity=".35"/>';
 if(K.wings)s+='<path d="'+smooth([[230,560],[300,420],[380,380],[360,460],[390,480],[330,560],[350,600],[260,610]])+'" fill="'+shade(F,-.2)+'" stroke="'+D+'" stroke-width="2"/>';
 // pattes arrière, corps, pattes avant
 s+='<path d="'+limb([[300,650],[318,740],[300,860]],[58,40,28])+'" fill="'+D+'"/>';
 s+='<path d="'+limb([[340,640],[312,600],[330,540],[372,520]],[8,10,12,4])+'" fill="url(#fur)"/>';
 s+='<path d="'+smooth([[110,600],[150,560],[230,555],[310,580],[340,640],[320,700],[240,720],[150,710],[110,670]])+'" fill="url(#fur)" stroke="'+D+'" stroke-width="2.5"/>';
 s+='<path d="'+smooth([[140,690],[220,705],[300,690],[260,712],[180,714]])+'" fill="'+K.belly+'" opacity=".7"/>';
 s+='<path d="'+limb([[150,670],[140,760],[150,862]],[52,36,28])+'" fill="url(#fur)" stroke="'+D+'" stroke-width="2"/><path d="'+limb([[230,690],[240,770],[232,862]],[46,32,26])+'" fill="'+shade(F,-.15)+'" stroke="'+D+'" stroke-width="2"/>';
 if(K.bristle)for(let i=0;i<10;i++)s+='<path d="M'+f(140+i*18)+' '+f(566-Math.sin(i/9*Math.PI)*14)+' l'+f(6+r()*4)+' -'+f(18+r()*10)+'" stroke="'+D+'" stroke-width="5" stroke-linecap="round"/>';
 if(K.mane)s+='<path d="'+smooth([[60,480],[110,440],[170,470],[200,540],[180,620],[120,640],[60,600],[40,540]])+'" fill="'+shade(F,-.25)+'" stroke="'+D+'" stroke-width="2"/>';
 // tête
 s+='<path d="'+smooth([[70,520],[120,500],[170,520],[180,575],[150,610],[90,612],[40,600],[20,580],[34,556]])+'" fill="url(#fur)" stroke="'+D+'" stroke-width="2.5"/>';
 s+='<path d="'+smooth([[22,582],[60,596],[100,600],[70,612],[30,604]])+'" fill="'+D+'"/>';
 if(K.ears)s+='<path d="M120 506 L132 450 L156 512Z" fill="'+F+'" stroke="'+D+'" stroke-width="2"/><path d="M96 504 L100 458 L122 506Z" fill="'+shade(F,-.15)+'" stroke="'+D+'" stroke-width="2"/>';
 if(K.horns)s+='<path d="'+limb([[120,508],[140,460],[176,440],[196,456]],[16,12,8,2])+'" fill="#e8dcc4" stroke="#6a5a40" stroke-width="2"/>';
 if(K.tusks)s+='<path d="M48 590 q-10 -26 10 -40 q-4 20 4 36z" fill="#f2ead8" stroke="#8a7a60" stroke-width="1.5"/>';
 s+='<circle cx="104" cy="548" r="22" fill="url(#glow)"/><ellipse cx="104" cy="548" rx="8" ry="6" fill="'+K.eye+'"/><ellipse cx="104" cy="548" rx="2.5" ry="5" fill="#140808"/>';
 s+='<path d="M26 586 q6 10 18 4" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>';
 return'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 900" width="'+w+'" height="'+h+'">'+defs+s+'</svg>';
}
