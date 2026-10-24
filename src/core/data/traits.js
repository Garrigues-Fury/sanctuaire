/* Qualités, défauts et techniques.
   Chaque trait a jusqu'à trois effets : d = au Sanctuaire (formules du prototype), c = en combat, s = avec les autres.
   Les effets en combat sont appliqués dans core/combat.js, les affinités dans core/social.js. */

export const QUAL={
 perseverant:{n:'Persévérant',d:l=>'Son temps rend '+3*l+' % de plus ; récupère '+15*l+' % d’énergie en plus ; après un échec, garde '+Math.round(33*l)+' % de sa progression.',c:l=>Math.round(30*l)+' % de chance de rester debout à 1 PV au lieu de tomber (une fois par combat).',s:'S’entend avec les travailleurs.'},
 fougueux:{n:'Fougueux',d:l=>'+'+5*l+' % d’XP, mais −'+4*l+' points aux épreuves.',c:l=>'+'+8*l+' % de dégâts, mais −'+4*l+' % de défense.',s:'S’entend avec les vifs et les courageux ; agace les peureux.'},
 patient:{n:'Patient',d:l=>'+'+4*l+' points de chance aux épreuves.',c:l=>'Commence le combat avec +'+l+' cosmos.',s:'Apaise les impulsifs et les colériques.'},
 studieux:{n:'Studieux',d:l=>'Savoir des séances −'+10*l+' %.',c:l=>'+'+6*l+' % de dégâts avec ses techniques.',s:'S’entend avec les studieux et les rêveurs ; les distraits l’exaspèrent.'},
 loyal:{n:'Loyal',d:l=>'+'+7*l+' % d’XP avec son maître.',c:l=>'+'+5*l+' % de défense.',s:'S’entend avec les loyaux et les courageux.'},
 solitaire:{n:'Solitaire',d:l=>'Sans maître : '+(40+10*l)+' % au lieu de 40 % ; −'+10*l+' % avec un maître.',c:l=>'+'+6*l+' % de dégâts contre un chef.',s:'Respecte les autres solitaires ; les sociables l’épuisent.'},
 courageux:{n:'Courageux',d:l=>Math.round(33*l)+' % de chance d’un point de force bonus par niveau.',c:l=>'+'+10*l+' % de dégâts quand il lui reste moins de la moitié de ses PV.',s:'S’entend avec les loyaux et les fougueux.'},
 vif:{n:'Vif',d:l=>Math.round(33*l)+' % de chance d’un point de vitesse bonus par niveau.',c:l=>'+'+5*l+' % d’esquive.',s:'S’entend avec les fougueux.'},
 reveur:{n:'Rêveur',d:l=>Math.round(33*l)+' % de chance d’un point de cosmos bonus par niveau.',c:l=>'+'+10*l+' % de dégâts avec son coup ultime.',s:'S’entend avec les rêveurs, les studieux et les drôles.'},
 travailleur:{n:'Travailleur',d:l=>'Son temps rend '+6*l+' % de plus (formation, métier) ; '+25*l+' % de plus en renfort sur un site.',c:l=>'La garde soigne '+3*l+' % de PV en plus.',s:'S’entend avec les travailleurs et les persévérants ; les paresseux l’agacent.'},
 orgueilleux:{n:'Orgueilleux',d:l=>'+'+3*l+' points aux épreuves, mais un échec l’abat 24 h au lieu de 12.',c:l=>'+'+6*l+' % de dégâts, mais la garde lui rapporte 1 cosmos de moins.',s:'Supporte mal les arrogants et les autres orgueilleux.'},
 sociable:{n:'Sociable',d:l=>'Ses amitiés lui rapportent '+25*l+' % de plus.',c:()=>'Aucun effet en combat.',s:'S’entend avec presque tout le monde, surtout les drôles et les sociables.'},
 drole:{n:'Drôle',d:l=>'Ses amitiés se nouent '+20*l+' % plus vite ; il détend l’atmosphère du Sanctuaire.',c:l=>Math.round(8*l)+' % de chance qu’un ennemi, déstabilisé par une remarque, rate son attaque.',s:'S’entend avec les drôles, les sociables et les rêveurs ; les arrogants et les têtus n’apprécient pas.'}
};
export const FLAW={
 paresseux:{n:'Paresseux',d:l=>'Son temps rend '+6*l+' % de moins (formation, métier, renfort).',c:l=>'Commence le combat avec '+l+' cosmos de moins.',s:'Agace les travailleurs.',cure:'elixir'},
 impulsif:{n:'Impulsif',d:l=>'−'+5*l+' points aux épreuves.',c:l=>'−'+5*l+' % de défense.',s:'Se heurte aux colériques ; les patients le calment.',cure:'tisane'},
 peureux:{n:'Peureux',d:l=>'−'+6*l+' points aux épreuves d’argent et d’or.',c:l=>'−'+8*l+' % de dégâts contre un chef.',s:'Les fougueux le bousculent.',cure:'materiel'},
 distrait:{n:'Distrait',d:l=>10*l+' % de chance de rater une séance d’entraînement.',c:l=>5*l+' % de chance de rater son action.',s:'Exaspère les studieux.',cure:'elixir'},
 arrogant:{n:'Arrogant',d:l=>'Ses amitiés lui rapportent '+20*l+' % de moins.',c:l=>'−'+4*l+' % d’esquive : il sous-estime l’adversaire.',s:'Se heurte aux arrogants, aux orgueilleux et aux drôles.',cure:'tisane'},
 colerique:{n:'Colérique',d:l=>'Énergie maximale −'+10*l+'.',c:l=>'+'+5*l+' % de dégâts quand il est blessé, mais −'+5*l+' % de défense.',s:'Se heurte aux colériques et aux impulsifs ; les patients le calment.',cure:'tisane'},
 tetu:{n:'Têtu',d:l=>'−'+8*l+' % d’XP avec un maître.',c:l=>'La garde réduit '+5*l+' % de dégâts en moins.',s:'Se heurte aux têtus ; l’humour des drôles l’agace.',cure:'tisane'},
 fragile:{n:'Fragile',d:l=>'Récupère '+15*l+' % d’énergie en moins.',c:l=>'−'+6*l+' % de PV.',s:'Aucun effet particulier.',cure:'materiel'},
 gourmand:{n:'Gourmand',d:l=>'Mange '+l+' vivre'+(l>1?'s':'')+' de plus par heure.',c:l=>'−'+3*l+' % d’esquive.',s:'Aucun effet particulier, sinon aux banquets.',cure:'tisane'}
};
export const QKEYS=Object.keys(QUAL),FKEYS=Object.keys(FLAW);
export const ql=(p,k)=>{const x=(p.qual||[]).find(t=>t.k===k);return x?x.lv:0;};
export const fl=(p,k)=>{const x=(p.flaw||[]).find(t=>t.k===k);return x?x.lv:0;};
// Texte complet d'un trait (pour l'aide contextuelle et les fiches).
export function traitText(k,lv,isFlaw){const T=(isFlaw?FLAW:QUAL)[k];return'Au Sanctuaire : '+T.d(lv)+'\nEn combat : '+T.c(lv)+'\nAvec les autres : '+T.s;}
export function genTraits(r){
 const qs=QKEYS.slice().sort(()=>r()-.5),fs=FKEYS.slice().sort(()=>r()-.5);
 const qual=[{k:qs[0],lv:r()<.2?2:1}];if(r()<.35)qual.push({k:qs[1],lv:1});
 const flaw=[{k:fs[0],lv:r()<.3?2:1}];if(r()<.35)flaw.push({k:fs[1],lv:1});
 return{qual,flaw};
}
export const TECH={feu:['Poing de braise','Spirale ardente','Couronne de flammes'],eau:['Vague brisante','Marée silencieuse','Lance de givre'],air:['Rafale tranchante','Pas du zéphyr','Cyclone ascendant'],terre:['Frappe tellurique','Rempart de granit','Séisme intérieur']};
export const SIG_WORDS=['Éclat','Souffle','Envol','Griffe','Rugissement','Chant','Spirale','Lumière'];
