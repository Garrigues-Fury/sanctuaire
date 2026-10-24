/* Outils de dessin vectoriel : courbes lissées, membres effilés, formes symétriques, nuances de couleur. */

export const f=n=>Math.round(n*10)/10;
// Courbe lisse passant par tous les points (Catmull-Rom convertie en courbes de Bézier).
export function smooth(pts,closed=true){
 const n=pts.length;if(n<2)return'';
 const P=i=>closed?pts[(i+n)%n]:pts[Math.max(0,Math.min(n-1,i))];
 let d='M'+f(pts[0][0])+' '+f(pts[0][1]);
 const last=closed?n:n-1;
 for(let i=0;i<last;i++){const p0=P(i-1),p1=P(i),p2=P(i+1),p3=P(i+2);
  d+='C'+f(p1[0]+(p2[0]-p0[0])/6)+' '+f(p1[1]+(p2[1]-p0[1])/6)+' '+f(p2[0]-(p3[0]-p1[0])/6)+' '+f(p2[1]-(p3[1]-p1[1])/6)+' '+f(p2[0])+' '+f(p2[1]);}
 return d+(closed?'Z':'');
}
// Contour d'un membre effilé autour d'une ligne centrale (bras, jambe, mèche, queue…).
export function limbPts(spine,widths){
 const L=[],R=[];
 spine.forEach((p,i)=>{const a=spine[Math.max(0,i-1)],b=spine[Math.min(spine.length-1,i+1)];
  let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const w=widths[i]/2;
  L.push([p[0]-dy*w,p[1]+dx*w]);R.push([p[0]+dy*w,p[1]-dx*w]);});
 return L.concat(R.reverse());
}
export const limb=(spine,widths)=>smooth(limbPts(spine,widths));
// Forme symétrique : on donne le côté droit (écart au centre, hauteur), du haut au bas.
export function sym(cx,right){
 const R=right.map(([dx,y])=>[cx+dx,y]);
 const Lft=right.slice(1,-1).reverse().map(([dx,y])=>[cx-dx,y]);
 return smooth(R.concat(Lft));
}
export function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const t=amt<0?0:255,p=Math.abs(amt);r=Math.round((t-r)*p+r);g=Math.round((t-g)*p+g);b=Math.round((t-b)*p+b);return'#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
export function mix(a,b,t){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);const c=(s)=>Math.round(((A>>s)&255)*(1-t)+((B>>s)&255)*t);return'#'+((1<<24)+(c(16)<<16)+(c(8)<<8)+c(0)).toString(16).slice(1);}
export function lin(id,stops,x2=0,y2=1){return'<linearGradient id="'+id+'" x1="0" y1="0" x2="'+x2+'" y2="'+y2+'">'+stops.map(([o,c,a])=>'<stop offset="'+o+'" stop-color="'+c+'"'+(a!=null?' stop-opacity="'+a+'"':'')+'/>').join('')+'</linearGradient>';}
export function rad(id,stops,cx=.5,cy=.5,r=.5){return'<radialGradient id="'+id+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'">'+stops.map(([o,c,a])=>'<stop offset="'+o+'" stop-color="'+c+'"'+(a!=null?' stop-opacity="'+a+'"':'')+'/>').join('')+'</radialGradient>';}
export function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
