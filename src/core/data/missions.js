/* Missions dans le monde et guerriers des dieux (demandés par Seba le 2026-10-27).
   Une mission demande des compétences et des statistiques précises : on y envoie les chevaliers qui conviennent.
   skills : compétences utiles (chaque compétence présente dans l'équipe augmente les chances) ;
   st : statistiques qui comptent ; el : élément favorable ; q : qualités qui aident ;
   L : danger (étoiles) ; h : durée en heures ; team : nombre de chevaliers [min, max]. */

export const MISSIONS=[
 {k:'volcan',n:'Le volcan gronde',ic:'flame',kind:'nature',d:'Le volcan au-dessus de {v} ({pays}) s’est réveillé. Il faut contenir la lave et évacuer le village.',skills:['barriere','glace','fluides','telekinesie','colosse'],st:['ps','en'],el:'eau',q:['courageux','travailleur'],L:[2,4],h:[10,16],team:[2,3],
  ok:'La lave s’est figée contre un mur de cosmos. {v} est évacué sans une seule victime.',ko:'Le village est sauf, de justesse, mais l’équipe rentre brûlée et épuisée.'},
 {k:'raz',n:'Raz-de-marée',ic:'globe',kind:'nature',d:'Une vague immense menace la côte de {v} ({pays}).',skills:['fluides','barriere','onde','pression','amplitude'],st:['ps','fo'],el:'eau',q:['courageux'],L:[2,5],h:[8,12],team:[2,3],
  ok:'La vague s’est brisée sur une barrière de cosmos. Les pêcheurs parlent déjà de miracle.',ko:'La vague a été ralentie, pas arrêtée. Les secours ont limité les dégâts.'},
 {k:'seisme',n:'Village sous les décombres',ic:'block',kind:'secours',d:'Un séisme a frappé {v} ({pays}). Des familles sont prisonnières des ruines.',skills:['telekinesie','colosse','F6','resistance','guerison'],st:['fo','ps'],q:['travailleur','perseverant'],L:[1,3],h:[8,14],team:[1,3],
  ok:'Les blocs se sont soulevés comme des plumes. Tous les habitants sont sortis vivants.',ko:'Certains blocs n’ont pas bougé. L’équipe a fait ce qu’elle pouvait.'},
 {k:'incendie',n:'Forêt en flammes',ic:'flame',kind:'nature',d:'Un incendie dévore les collines de {v} ({pays}) et marche sur le village.',skills:['glace','fluides','vent','gel','barriere'],st:['vi','co'],el:'eau',q:['vif'],L:[1,3],h:[6,10],team:[1,2],
  ok:'Un souffle glacé a couché les flammes. La forêt repoussera.',ko:'Le feu a été dévié du village, mais les collines sont noires.'},
 {k:'avalanche',n:'Avalanche',ic:'alert',kind:'secours',d:'Une avalanche a enseveli un col près de {v} ({pays}). Des bergers manquent à l’appel.',skills:['thermique','colosse','resistance','F6'],st:['en','vi'],q:['perseverant'],L:[1,3],h:[6,10],team:[1,2],
  ok:'Les bergers ont été retrouvés sous la neige, vivants.',ko:'Le froid a eu raison des recherches avant l’aube.'},
 {k:'barrage',n:'Le barrage se fissure',ic:'shield',kind:'nature',d:'Le vieux barrage qui domine {v} ({pays}) se fissure après des pluies diluviennes.',skills:['barriere','fluides','colosse','matiere','pression'],st:['fo','ps'],el:'terre',q:['patient','travailleur'],L:[2,4],h:[10,16],team:[2,3],
  ok:'Le barrage tient, consolidé de cosmos et de pierre. La vallée dort tranquille.',ko:'Le barrage a cédé en partie ; la vallée a été évacuée à temps.'},
 {k:'tempete',n:'Navire en perdition',ic:'globe',kind:'secours',d:'Une tempête drosse un navire de pèlerins vers les récifs au large de {v} ({pays}).',skills:['vent','aerien','fluides','capture'],st:['vi','de'],el:'air',q:['vif','courageux'],L:[1,3],h:[6,10],team:[1,2],
  ok:'Le navire a été tiré hors des récifs, son équipage au complet.',ko:'Le navire est perdu, mais les canots ont touché terre.'},
 {k:'epidemie',n:'Fièvre au port',ic:'heart',kind:'secours',d:'Une fièvre étrange frappe le port de {v} ({pays}). On parle d’un poison venu de la mer.',skills:['guerison','poison','mythes','sens'],st:['ps','co'],q:['patient','studieux'],L:[1,3],h:[12,20],team:[1,2],
  ok:'Le poison venait d’une source souillée. La fièvre recule.',ko:'La fièvre a été contenue, au prix de nuits blanches et de forces perdues.'},
 {k:'escorte',n:'Escorte des pèlerins',ic:'users',kind:'combat',d:'Une caravane de pèlerins doit traverser une région infestée de pillards jusqu’à {v} ({pays}).',skills:['protection','bouclier','tactique','distance'],st:['en','de'],q:['loyal'],L:[1,3],h:[12,18],team:[1,3],
  ok:'Les pillards ont renoncé en voyant l’escorte. Les pèlerins sont arrivés sains et saufs.',ko:'L’escorte a tenu, mais la caravane a perdu une partie de ses vivres.'},
 {k:'temple',n:'Temple profané',ic:'temple',kind:'enquete',d:'Un temple d’Athéna a été pillé près de {v} ({pays}). Qui a fait ça, et pourquoi ?',skills:['telepathie','sens','mythes','illusions','tactique'],st:['ps','de'],q:['studieux','patient'],L:[1,3],h:[10,16],team:[1,2],
  ok:'Les voleurs servaient un dieu jaloux. Les reliques ont été rapportées au Sanctuaire.',ko:'La piste s’est perdue. Les reliques restent introuvables.'},
 {k:'chimere',n:'Une bête mythique',ic:'sword',kind:'combat',d:'Une bête venue des légendes terrorise les bergers de {v} ({pays}).',skills:['percussion','rafale','points','instinct','griffes'],st:['fo','vi'],q:['courageux','fougueux'],L:[2,5],h:[8,12],team:[1,3],
  ok:'La bête repose au fond d’une gorge. Les bergers ont retrouvé leurs troupeaux.',ko:'La bête s’est enfuie, blessée. Elle reviendra peut-être.'},
 {k:'infiltres',n:'Serviteurs infiltrés',ic:'eye',kind:'combat',d:'Des serviteurs d’un dieu se cachent parmi les habitants de {v} ({pays}).',skills:['sens','telepathie','mentale','illusions','tactique'],st:['ps','de'],q:['patient'],L:[2,4],h:[10,16],team:[2,3],
  ok:'Les infiltrés ont été démasqués et chassés, sans un combat de trop.',ko:'Ils ont fui avant d’être pris. Le village reste inquiet.'},
 {k:'fouilles',n:'Fouilles d’un sanctuaire englouti',ic:'scroll',kind:'enquete',d:'Des pêcheurs de {v} ({pays}) ont aperçu des colonnes sous l’eau. Un ancien sanctuaire ?',skills:['mythes','reparation','fluides','matiere'],st:['co','ps'],q:['studieux','reveur'],L:[1,2],h:[14,24],team:[1,2],
  ok:'Des tablettes et des fragments d’armure ont été remontés. La bibliothèque s’enrichit.',ko:'Les courants ont empêché d’atteindre les salles profondes.'},
 {k:'crue',n:'Crue du fleuve',ic:'globe',kind:'nature',d:'Le fleuve sort de son lit et menace les greniers de {v} ({pays}).',skills:['fluides','barriere','glace','colosse'],st:['fo','en'],el:'eau',q:['travailleur'],L:[1,3],h:[8,12],team:[1,3],
  ok:'Le fleuve est rentré dans son lit. Les greniers sont saufs.',ko:'Les greniers ont pris l’eau. Il faudra reconstruire.'},
 {k:'montagne',n:'Sauvetage en montagne',ic:'alert',kind:'secours',d:'Des enfants de {v} ({pays}) se sont perdus dans la montagne avant l’orage.',skills:['F6','aerien','vent','resistance'],st:['vi','en'],q:['vif','perseverant'],L:[1,2],h:[6,8],team:[1,2],
  ok:'Les enfants sont rentrés avant la nuit, émerveillés d’avoir vu un chevalier.',ko:'Ils ont été retrouvés à l’aube, transis mais vivants.'},
 {k:'paix',n:'Village méfiant',ic:'heart',kind:'diplomatie',d:'Les habitants de {v} ({pays}) refusent toute aide du Sanctuaire depuis la dernière guerre.',skills:['telepathie','mentale','guerison','mythes'],st:['co','ps'],q:['sociable','drole','patient'],L:[1,2],h:[12,20],team:[1,2],
  ok:'Un repas partagé, des rires, et les portes se sont rouvertes. {v} sera un allié.',ko:'Les portes sont restées closes. Il faudra du temps.'},
 {k:'orage',n:'Orage de cosmos',ic:'bolt',kind:'nature',d:'Un orage surnaturel frappe {v} ({pays}) : la foudre tombe sans relâche.',skills:['foudre','barriere','deviation','renvoi','stellaire'],st:['co','ps'],el:'air',q:['courageux'],L:[3,5],h:[8,12],team:[2,3],
  ok:'La foudre a été renvoyée vers le ciel. L’orage s’est dissipé.',ko:'L’orage s’est épuisé de lui-même, laissant des ruines.'},
 {k:'labyrinthe',n:'La faille d’un autre monde',ic:'eye',kind:'enquete',d:'Une faille s’est ouverte près de {v} ({pays}). Des voix en sortent la nuit.',skills:['dimension','passage','ames','sens','barriere'],st:['co','ps'],q:['reveur','courageux'],L:[3,5],h:[12,18],team:[2,3],
  ok:'La faille est refermée. Ce qui s’y cachait ne reviendra pas.',ko:'La faille s’est refermée seule, mais l’équipe en est revenue ébranlée.'}
];
export const MISSION_BY={};MISSIONS.forEach(m=>MISSION_BY[m.k]=m);
export const KIND_N={nature:'Catastrophe naturelle',secours:'Secours',combat:'Combat',enquete:'Enquête',diplomatie:'Diplomatie'};

// Les guerriers de chaque dieu, quand ils attaquent le Sanctuaire.
export const GOD_SAINTS={ares:['Berserker','Berserkeuse'],eris:['Fantôme d’Éris','Fantôme d’Éris'],apollon:['Chevalier céleste','Chevalière céleste'],artemis:['Satellite','Satellite'],
 hephaistos:['Cyclope de Lemnos','Cyclope de Lemnos'],hermes:['Ombre d’Hermès','Ombre d’Hermès'],dionysos:['Ménade','Ménade'],demeter:['Moissonneur','Moissonneuse']};
// Les zones qu'un ennemi peut attaquer (pas la bibliothèque, trop proche du palais du Pope), et ce qu'il y pille.
export const RAID_ZONES={village:['vivres','marbre'],champs:['vivres'],carriere:['marbre'],mine:['metal'],jardin:['herbes'],forge:['metal'],herbo:['herbes'],atelier:['metal','marbre']};
