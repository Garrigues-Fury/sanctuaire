/* Petits outils : hasard reproductible, formats de nombres et de durées. */

export function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export const pick=(r,a)=>a[Math.floor(r()*a.length)];
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
export function fmt(n){n=Math.floor(n);if(Math.abs(n)<10000)return n.toLocaleString('fr-FR');if(Math.abs(n)<1e6)return(n/1000).toLocaleString('fr-FR',{maximumFractionDigits:1})+' k';return(n/1e6).toLocaleString('fr-FR',{maximumFractionDigits:2})+' M';}
export function fmt1(n){return n.toLocaleString('fr-FR',{maximumFractionDigits:1});}
export function dur(h){if(!isFinite(h))return'—';if(h<=0)return'terminé';if(h<1)return Math.max(1,Math.ceil(h*60))+' min';if(h<48){const H=Math.floor(h),M=Math.floor((h-H)*60);return H+' h '+String(M).padStart(2,'0');}return Math.floor(h/24)+' j '+Math.floor(h%24)+' h';}
export function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=amt<0?0:255,p=Math.abs(amt);r=Math.round((f-r)*p+r);g=Math.round((f-g)*p+g);b=Math.round((f-b)*p+b);return'#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
export const G=(p,s)=>p.sex==='F'?s:'';
export const ROMAN=['','I','II','III'];
export function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function todayStr(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
