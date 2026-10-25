/* Cartes de compétences (inventaire fourni par Seba le 2026-10-25).
   Une compétence = une carte, rangée dans une famille. Trois sortes :
   - les 8 fondamentales, communes aux 88 armures : sans elles, aucune armure ;
   - les 3 vitesses, une par rang (Mach 1 pour le bronze, Mach 5 pour l'argent, la lumière pour l'or),
     qu'on ne découvre qu'auprès d'un maître de ce rang au moins ;
   - les compétences spécifiques, exigées par chaque armure.
   st : les statistiques qui donnent l'aptitude naturelle à la découvrir. */

export const FAMILIES={
 fond:{n:'Fondamentales',c:'#e8c46a'},vit:{n:'Vitesse',c:'#7fd0ff'},phy:{n:'Physique',c:'#e0875a'},men:{n:'Mental et savoir',c:'#b9a3ff'},
 pro:{n:'Projection d’énergie',c:'#ffb35c'},ctl:{n:'Contrôle et entrave',c:'#9ad19a'},cor:{n:'Techniques corporelles',c:'#ff7a7a'},
 psy:{n:'Psychique et spirituel',c:'#d08cff'},ele:{n:'Éléments et phénomènes',c:'#6fd6c8'},art:{n:'Arts martiaux',c:'#f0a0c0'},def:{n:'Défense et protection',c:'#a0b8d8'}
};

export const FUND=[
 {id:'F1',n:'Cosmos',d:'Éveiller son cosmos, le développer, le ressentir et percevoir celui d’autrui.',st:['co']},
 {id:'F2',n:'Maîtrise',d:'Concentrer, contrôler et économiser son cosmos ; provoquer une explosion temporaire de puissance.',st:['co','ps']},
 {id:'F3',n:'Physique',d:'Force, vitesse, réflexes, coordination, agilité et endurance.',st:['fo','vi','en']},
 {id:'F4',n:'Combat',d:'Arts martiaux, esquive, défense, précision et enchaînement des attaques.',st:['fo','de','vi']},
 {id:'F5',n:'Mental',d:'Volonté, courage, concentration, sang-froid et résistance à la douleur.',st:['ps','co'],q:['courageux','patient','perseverant']},
 {id:'F6',n:'Perception',d:'Lire les mouvements, anticiper l’adversaire, détecter les failles et évaluer une menace.',st:['de','ps']},
 {id:'F7',n:'Survie',d:'Résister à l’épuisement, combattre blessé, protéger ses points vitaux et gérer son énergie.',st:['en']},
 {id:'F8',n:'Harmonie',d:'Se synchroniser avec son armure, comprendre ses limites et faire évoluer sa maîtrise.',st:['co','ps']}
].map(s=>Object.assign(s,{fam:'fond'}));

export const SPEED=[
 {id:'V1',n:'Mach 1',d:'Franchir le mur du son : la vitesse d’un chevalier de bronze. Un maître de bronze au moins peut l’enseigner.',rank:'bronze'},
 {id:'V2',n:'Mach 5',d:'Cinq fois la vitesse du son : celle d’un chevalier d’argent. Il faut un maître d’argent ou d’or pour la découvrir.',rank:'argent'},
 {id:'V3',n:'Vitesse de la lumière',d:'Trois cent mille kilomètres par seconde : le domaine des chevaliers d’or. Seul un chevalier d’or peut ouvrir cette voie.',rank:'or'}
].map(s=>Object.assign(s,{fam:'vit',st:['vi']}));
export const SPEED_OF={bronze:'V1',argent:'V2',or:'V3'};

// Compétences spécifiques : [id, nom, famille, description]
const SPEC_RAW=[
 ['telekinesie','Télékinésie','psy','Déplacer la matière par la seule force de l’esprit.'],
 ['telepathie','Télépathie','psy','Parler d’esprit à esprit, lire les intentions.'],
 ['illusions','Illusions','psy','Tromper les sens de l’adversaire.'],
 ['ames','Interaction avec les âmes','psy','Percevoir les âmes, leur parler, les atteindre.'],
 ['passage','Passage spirituel','psy','Franchir la frontière entre les mondes.'],
 ['sens','Privation des sens','psy','Couper l’adversaire de ses perceptions.'],
 ['dimension','Distorsion de l’espace','psy','Plier l’espace, ouvrir des passages, égarer l’ennemi.'],
 ['entrave','Entrave psychique','ctl','Immobiliser un adversaire par la volonté.'],
 ['capture','Capture et ligotage','ctl','Saisir et entraver à distance (chaînes, fouets, filets).'],
 ['barriere','Création de barrières','ctl','Dresser un mur de cosmos infranchissable.'],
 ['deviation','Déviation des attaques','ctl','Détourner les coups et les projectiles.'],
 ['renvoi','Renvoi d’énergie','ctl','Retourner contre l’ennemi la force de son attaque.'],
 ['manip','Manipulation d’objets','ctl','Contrôler des armes ou des objets à distance.'],
 ['onde','Onde de choc','pro','Libérer une onde qui renverse tout.'],
 ['rafale','Salves de coups','pro','Des centaines de coups lancés en un instant.'],
 ['faisceau','Rayon d’énergie','pro','Concentrer le cosmos en un faisceau.'],
 ['explosion','Explosion de zone','pro','Faire éclater le cosmos sur une large zone.'],
 ['guide','Projectile guidé','pro','Un trait de cosmos qui suit sa cible.'],
 ['portee','Très longue portée','pro','Frapper à une distance inouïe.'],
 ['amplitude','Attaque de grande amplitude','pro','Une attaque qui balaie tout un champ de bataille.'],
 ['pression','Ondes de pression','ele','Comprimer et relâcher l’air ou l’eau.'],
 ['tranchant','Tranchant cosmique','cor','Le bras devient une lame.'],
 ['perforant','Poing perforant','cor','Percer n’importe quelle protection en un point.'],
 ['paume','Coup de paume énergétique','cor','Projeter le cosmos par la paume.'],
 ['griffes','Frappes-griffes','cor','Des frappes qui lacèrent comme des griffes.'],
 ['percussion','Percussion concentrée','cor','Toute la puissance dans un seul impact.'],
 ['glace','Glace et froid','ele','Abaisser la température, créer de la glace.'],
 ['gel','Gel ciblé','ele','Geler une cible précise sans toucher le reste.'],
 ['cristal','Cristallisation','ele','Créer cristaux, prisons et armures de glace.'],
 ['thermique','Précision thermique','ele','Viser une température exacte, jusqu’aux plus extrêmes.'],
 ['feu','Flammes','ele','Produire et projeter le feu, aura brûlante.'],
 ['foudre','Éclairs et foudre','ele','Des décharges qui frappent comme l’orage.'],
 ['vent','Vent et vortex','ele','Rafales, tourbillons, maîtrise des airs.'],
 ['gravite','Attraction','ele','Attirer ou écraser par une force invisible.'],
 ['poison','Poison et toxines','ele','Des poisons que le cosmos rend redoutables.'],
 ['fluides','Maîtrise des fluides','ele','Commander l’eau et les courants.'],
 ['stellaire','Effets stellaires','ele','Des attaques qui évoquent les astres et les galaxies.'],
 ['matiere','Manipulation de la matière','ele','Façonner cristaux, roses, pierre ou métal.'],
 ['grappling','Saisies et projections','art','Saisir, projeter, immobiliser.'],
 ['aerien','Combat aérien','art','Bonds, attaques plongeantes, maîtrise de la hauteur.'],
 ['distance','Combat à distance','art','Viser, anticiper, saturer une zone.'],
 ['tactique','Combat tactique','art','Pièges, feintes, ruptures de rythme.'],
 ['instinct','Combat instinctif','art','Réagir avant de penser, improviser.'],
 ['points','Points vitaux','art','Frapper les points faibles et les points de pression.'],
 ['bouclier','Bouclier d’énergie','def','Un bouclier de cosmos qui encaisse.'],
 ['protection','Protection d’un allié','def','Couvrir un allié, intercepter une attaque.'],
 ['mentale','Défense mentale','def','Résister aux illusions et aux intrusions psychiques.'],
 ['resistance','Résistance extrême','phy','Encaisser l’impossible.'],
 ['colosse','Force colossale','phy','Soulever, briser, repousser une masse énorme.'],
 ['reparation','Réparation d’armure','men','Comprendre la matière des armures et la réparer.'],
 ['mythes','Savoir des mythes','men','Connaître les dieux, les dimensions et les anciennes guerres.'],
 ['guerison','Soins par le cosmos','men','Refermer les blessures, apaiser la douleur.'],
 ['vie','Maintien en vie','men','Compétence du médecin, très longue à apprendre : garder en vie un chevalier grièvement blessé. Chaque niveau augmente ses chances de survie.']
];
const FAM_ST={psy:['ps','co'],ctl:['ps','de'],pro:['co','fo'],cor:['fo','de'],ele:['co','ps'],art:['de','vi'],def:['en','ps'],phy:['fo','en'],men:['ps','co']};
export const SPEC=SPEC_RAW.map(([id,n,fam,d])=>({id,n,fam,d,st:FAM_ST[fam]}));
export const SKILLS={};FUND.concat(SPEED,SPEC).forEach(s=>SKILLS[s.id]=s);

// Compétences spécifiques exigées par chaque armure (les maisons d'or par indice de signe, 0 = Bélier).
const GOLD_REQ=['telekinesie reparation barriere','colosse onde resistance','dimension illusions stellaire','ames passage entrave','foudre rafale percussion','sens barriere telepathie',
 'manip protection tactique','perforant poison points','guide portee distance','tranchant percussion aerien','glace gel cristal','poison matiere illusions'];
const REQ={
 pegase:'rafale aerien',dragon:'bouclier percussion',cygne:'glace gel cristal thermique',andromede:'capture deviation protection',phenix:'feu illusions',licorne:'aerien percussion',
 loup:'griffes instinct','grande-ourse':'grappling colosse','petit-lion':'paume instinct',hydre:'poison griffes',cameleon:'capture illusions','machine-pneumatique':'pression gravite',
 'oiseau-paradis':'aerien vent',burin:'tranchant reparation',girafe:'portee resistance','petit-chien':'instinct protection',carene:'resistance protection',compas:'tactique points',
 colombe:'guerison protection',chevelure:'capture manip','couronne-australe':'barriere stellaire',coupe:'fluides guerison','croix-sud':'stellaire bouclier',dauphin:'fluides deviation',
 dorade:'fluides rafale',eridan:'fluides onde',fourneau:'feu explosion',grue:'aerien points',horloge:'tactique sens','hydre-male':'poison resistance',indien:'distance tactique',
 lievre:'instinct deviation',lynx:'griffes points',table:'barriere mythes',microscope:'points sens',regle:'tranchant tactique',octant:'guide distance','poisson-austral':'fluides glace',
 peintre:'illusions manip',poupe:'protection bouclier',boussole:'guide tactique',reticule:'guide points',sculpteur:'matiere percussion',ecu:'bouclier renvoi',sextant:'guide portee',
 telescope:'portee sens','triangle-austral':'barriere faisceau',toucan:'aerien rafale','petite-ourse':'grappling resistance',voiles:'vent deviation','poisson-volant':'aerien fluides',
 'petit-renard':'tactique illusions',
 lyre:'illusions sens telepathie',persee:'bouclier sens deviation',cerbere:'griffes grappling',cocher:'rafale distance',fleche:'guide portee',lezard:'deviation instinct',mouche:'illusions aerien',
 'chiens-chasse':'tactique griffes',centaure:'distance faisceau',corbeau:'manip aerien',baleine:'onde pression amplitude',hercule:'colosse grappling',aigle:'aerien points',
 ophiuchus:'guerison poison',cephee:'entrave telekinesie','grand-chien':'rafale instinct',autel:'mythes protection',orion:'explosion percussion',paon:'illusions points',
 'couronne-boreale':'barriere stellaire',triangle:'dimension illusions','petit-cheval':'aerien instinct',bouvier:'grappling resistance',cassiopee:'telepathie mentale'
};
export function specReq(c){return((c.rank==='or'?GOLD_REQ[c.sign]:REQ[c.k])||'').split(' ').filter(Boolean);}
