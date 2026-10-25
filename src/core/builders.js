/* Savoir-faire des bâtisseurs (demandé par Seba le 2026-10-25), comme dans les jeux de construction :
   chaque chantier terminé (et chaque heure de chantier) rapporte des points de bâtisseur ; on les investit,
   avec des ressources, dans des savoir-faire qui montent de niveau. */
import { S } from './state.js';

export const TECHS={
 chantiers:{n:'Chantiers en parallèle',max:4,d:l=>'+'+l+' chantier'+(l>1?'s':'')+' simultané'+(l>1?'s':''),cost:l=>({bp:Math.round(30*l*l),marbre:150*l,metal:60*l})},
 echafaudages:{n:'Échafaudages',max:5,d:l=>'chantiers '+8*l+' % plus rapides',cost:l=>({bp:Math.round(20*Math.pow(l,1.6)),marbre:100*l,vivres:80*l})},
 taille:{n:'Taille de pierre',max:5,d:l=>'marbre et métal des chantiers −'+7*l+' %',cost:l=>({bp:Math.round(20*Math.pow(l,1.6)),metal:80*l,savoir:20*l})},
 architecture:{n:'Architecture sacrée',max:5,d:l=>'maisons du zodiaque −'+10*l+' % de temps et de coût',cost:l=>({bp:Math.round(40*Math.pow(l,1.6)),marbre:300*l,savoir:40*l})}
};
export const TECH_KEYS=Object.keys(TECHS);
export function techLv(k){return(S&&S.tech&&S.tech[k])||0;}
export function bp(){return(S&&S.bp)||0;}
// Ce que rapporte la fin d'un chantier : plus le niveau est haut, plus on apprend ; les maisons davantage.
export function gainOnBuilt(isHouse,lvl){const g=(isHouse?15:10)*lvl;S.bp=bp()+g;S.bpTotal=(S.bpTotal||0)+g;return g;}
// Pendant les chantiers, les artisans apprennent aussi : un demi-point par chantier et par heure.
export function gainWhileBuilding(h){const g=.5*h*(S.jobs||[]).length;if(g>0){S.bp=bp()+g;S.bpTotal=(S.bpTotal||0)+g;}}
// Rang de bâtisseur, d'après tous les points gagnés depuis le début.
export function builderRank(){const t=(S&&S.bpTotal)||0;return 1+Math.floor(Math.sqrt(t/40));}
// Multiplicateurs appliqués par rules.js.
export const buildTimeMult=house=>(1-.08*techLv('echafaudages'))*(house?1-.1*techLv('architecture'):1);
export const buildCostMult=house=>(1-.07*techLv('taille'))*(house?1-.1*techLv('architecture'):1);
export const extraSlots=()=>techLv('chantiers');
