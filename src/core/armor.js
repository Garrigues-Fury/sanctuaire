/* Affinité entre un personnage et une armure (demandée par Seba le 2026-10-25).
   Chaque armure a deux qualités maîtresses. L'affinité (0 à 100) vient de :
   - l'élément : celui du signe du personnage face à celui de l'armure ;
   - les compétences : ses deux statistiques maîtresses, comparées à sa moyenne (ce qu'il a travaillé) ;
   - ses maîtres : un maître du même élément ou de la même famille d'armure ouvre la voie.
   Sans affinité, l'armure reste muette : pas d'épreuve possible. */
import { CONS, CONS_BY, SIGNS } from './data/world.js';
import { S } from './state.js';
import { clamp } from './util.js';

export const STAT6=['fo','vi','de','en','ps','co'];
// Qualités maîtresses de chaque armure (deux statistiques).
const P={
 pegase:'vi co',dragon:'en fo',cygne:'co de',andromede:'ps en',phenix:'co en',licorne:'vi fo',loup:'vi fo','grande-ourse':'fo en','petit-lion':'fo vi',
 hydre:'en ps',cameleon:'de ps','machine-pneumatique':'ps de','oiseau-paradis':'vi de',burin:'de fo',girafe:'en vi','petit-chien':'vi en',carene:'en fo',
 compas:'de ps',colombe:'vi ps',chevelure:'co de','couronne-australe':'co ps',coupe:'ps co','croix-sud':'co en',dauphin:'vi en',dorade:'vi de',eridan:'en ps',
 fourneau:'fo co',grue:'de vi',horloge:'ps de','hydre-male':'en fo',indien:'fo vi',lievre:'vi de',lynx:'de vi',table:'en ps',microscope:'de ps',regle:'de en',
 octant:'de ps','poisson-austral':'vi en',peintre:'de co',poupe:'en fo',boussole:'ps de',reticule:'de ps',sculpteur:'de fo',ecu:'en fo',sextant:'de co',
 telescope:'ps co','triangle-austral':'co de',toucan:'vi de','petite-ourse':'en co',voiles:'vi en','poisson-volant':'vi de','petit-renard':'de vi',
 lyre:'ps co',persee:'fo de',cerbere:'fo en',cocher:'vi fo',fleche:'de vi',lezard:'de en',mouche:'vi ps','chiens-chasse':'vi fo',centaure:'fo de',
 corbeau:'vi ps',baleine:'en fo',hercule:'fo en',aigle:'vi de',ophiuchus:'ps co',cephee:'ps en','grand-chien':'fo vi',autel:'co ps',orion:'fo de',
 paon:'de co','couronne-boreale':'co ps',triangle:'ps de','petit-cheval':'vi en',bouvier:'en fo',cassiopee:'ps co'
};
// Les douze maisons, du Bélier aux Poissons.
const GOLD_P=['ps co','fo en','ps co','ps en','fo vi','co ps','fo de','de vi','de vi','fo de','co ps','de co'];
export function profileOf(c){return(c.rank==='or'?GOLD_P[c.sign]:P[c.k]||'fo co').split(' ');}
const OPP={feu:'eau',eau:'feu',air:'terre',terre:'air'};
// Seuils d'affinité : sans elle, pas d'épreuve ; l'argent et l'or demandent davantage.
export const AFF_MIN={bronze:25,argent:45,or:55};
export const NEXT_RANK={bronze:'argent',argent:'or'};

// Le cœur (character.js) : de −10 à +10 d'affinité. Les armures d'or refusent un cœur haineux ;
// les Gémeaux et le Cancer, qui connaissent la part d'ombre, sont plus tolérants.
export function heartAff(p){return Math.round((p.bon||0)/10);}
const DARK_OK=new Set([2,3]);
export function heartBlock(p,c){
 if(!c||c.rank!=='or'||p.bon==null)return null;
 const dark=DARK_OK.has(c.sign),min=dark?-70:-40;
 return p.bon<min?'L’armure d’or '+(dark?'elle-même, qui connaît pourtant la part d’ombre, ':'')+'refuse un cœur '+(p.bon<-60?'haineux':'rancunier')+'.':null;
}
// Maîtres qui ont formé le personnage (son maître actuel et les précédents).
export function mentorsOf(p){const ids=new Set((p.mentors||[]).concat(p.master!=null?[p.master]:[]));return S.knights.filter(k=>ids.has(k.id)&&k.id!==p.id);}
export function armorAffinity(p,c){
 const [k1,k2]=profileOf(c),s=p.st||{};
 const mean=STAT6.reduce((t,k)=>t+(s[k]||0),0)/6||1;
 const rel=((s[k1]||0)+(s[k2]||0))/2/mean;
 const parts={comp:clamp(Math.round((rel-.8)*100),0,45),elem:0,maitre:0};
 const pel=SIGNS[p.sign].el;parts.elem=pel===c.el?35:OPP[pel]===c.el?-10:0;
 mentorsOf(p).forEach(m=>{const mc=CONS_BY[m.cons];if(!mc)return;const mp=profileOf(mc);
  const b=(mc.el===c.el?8:0)+(mp.includes(k1)||mp.includes(k2)?6:0)+(mc.k===c.k?6:0);parts.maitre=Math.max(parts.maitre,b);});
 parts.coeur=heartAff(p);const block=heartBlock(p,c);
 return{v:block?0:clamp(parts.comp+parts.elem+parts.maitre+parts.coeur,0,100),parts,keys:[k1,k2],block};
}
export function affLabel(v){return v>=70?'Forte':v>=45?'Bonne':v>=25?'Faible':'Aucune';}
// Les armures pour lesquelles le personnage a le plus d'affinité (toutes, brisées comprises).
export function bestArmors(p,n=3,rank){
 return CONS.filter(c=>(!rank||c.rank===rank)&&(c.rank!=='or'||c.sign===p.sign)).map(c=>({c,a:armorAffinity(p,c)}))
  .sort((x,y)=>y.a.v-x.a.v).slice(0,n);
}
