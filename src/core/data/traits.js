/* Qualités, défauts et techniques. */

export const QUAL={
 perseverant:{n:'Persévérant',d:l=>'Récupère '+15*l+' % d’énergie en plus ; après un échec, garde '+Math.round(33*l)+' % de sa progression.'},
 fougueux:{n:'Fougueux',d:l=>'+'+5*l+' % d’XP, mais −'+4*l+' points aux épreuves.'},
 patient:{n:'Patient',d:l=>'+'+4*l+' points de chance aux épreuves.'},
 studieux:{n:'Studieux',d:l=>'Savoir des séances −'+10*l+' %.'},
 loyal:{n:'Loyal',d:l=>'+'+7*l+' % d’XP avec son maître.'},
 solitaire:{n:'Solitaire',d:l=>'Sans maître : '+(40+10*l)+' % au lieu de 40 % ; −'+10*l+' % avec un maître.'},
 courageux:{n:'Courageux',d:l=>Math.round(33*l)+' % de chance d’un point de force bonus par niveau.'},
 vif:{n:'Vif',d:l=>Math.round(33*l)+' % de chance d’un point de vitesse bonus par niveau.'},
 reveur:{n:'Rêveur',d:l=>Math.round(33*l)+' % de chance d’un point de cosmos bonus par niveau.'},
 travailleur:{n:'Travailleur',d:l=>'Rend '+25*l+' % de plus en renfort sur un site.'},
 orgueilleux:{n:'Orgueilleux',d:l=>'+'+3*l+' points aux épreuves, mais un échec l’abat 24 h au lieu de 12.'},
 sociable:{n:'Sociable',d:l=>'Ses amitiés lui rapportent '+25*l+' % de plus.'}
};
export const FLAW={
 paresseux:{n:'Paresseux',d:l=>'−'+6*l+' % d’XP.',cure:'elixir'},
 impulsif:{n:'Impulsif',d:l=>'−'+5*l+' points aux épreuves.',cure:'tisane'},
 peureux:{n:'Peureux',d:l=>'−'+6*l+' points aux épreuves d’argent et d’or.',cure:'materiel'},
 distrait:{n:'Distrait',d:l=>10*l+' % de chance de rater une séance spéciale.',cure:'elixir'},
 arrogant:{n:'Arrogant',d:l=>'Ses amitiés lui rapportent '+20*l+' % de moins.',cure:'tisane'},
 colerique:{n:'Colérique',d:l=>'Énergie maximale −'+10*l+'.',cure:'tisane'},
 tetu:{n:'Têtu',d:l=>'−'+8*l+' % d’XP avec un maître.',cure:'tisane'},
 fragile:{n:'Fragile',d:l=>'Récupère '+15*l+' % d’énergie en moins.',cure:'materiel'},
 gourmand:{n:'Gourmand',d:l=>'Mange '+l+' vivre'+(l>1?'s':'')+' de plus par heure.',cure:'tisane'}
};
export const QKEYS=Object.keys(QUAL),FKEYS=Object.keys(FLAW);
export const ql=(p,k)=>{const x=(p.qual||[]).find(t=>t.k===k);return x?x.lv:0;};
export const fl=(p,k)=>{const x=(p.flaw||[]).find(t=>t.k===k);return x?x.lv:0;};
export function genTraits(r){
 const qs=QKEYS.slice().sort(()=>r()-.5),fs=FKEYS.slice().sort(()=>r()-.5);
 const qual=[{k:qs[0],lv:r()<.2?2:1}];if(r()<.35)qual.push({k:qs[1],lv:1});
 const flaw=[{k:fs[0],lv:r()<.3?2:1}];if(r()<.35)flaw.push({k:fs[1],lv:1});
 return{qual,flaw};
}
export const TECH={feu:['Poing de braise','Spirale ardente','Couronne de flammes'],eau:['Vague brisante','Marée silencieuse','Lance de givre'],air:['Rafale tranchante','Pas du zéphyr','Cyclone ascendant'],terre:['Frappe tellurique','Rempart de granit','Séisme intérieur']};
export const SIG_WORDS=['Éclat','Souffle','Envol','Griffe','Rugissement','Chant','Spirale','Lumière'];
