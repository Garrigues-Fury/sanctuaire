/* Biographies variées (demande de Seba du 2026-10-25) : origine et famille, un événement marquant, un but.
   {e}, {il}, {lui} s'accordent au sexe du personnage. Certaines tournures nourrissent les affinités
   (orphelins, deuil, mer, appel du cosmos : voir social.js). */
import { EVENTS, GOALS, PARENTS, VET_EVENTS, VET_GOALS } from './countries.js';

export const PARENTS2=PARENTS.concat([
 'd’une couturière','d’un cordonnier','d’une aubergiste','d’un maçon','d’une bibliothécaire','d’un soldat revenu infirme','d’une médecin de campagne',
 'd’un passeur de frontières','d’une cheffe de chantier','d’un luthier','d’une conductrice de bus','d’un apiculteur','d’une marchande des quatre saisons',
 'd’un ancien boxeur','d’une infirmière de nuit','d’un vigneron','d’une tisserande','d’un instituteur sévère','d’une famille nombreuse','d’une mère seule',
 'd’un père qu’{il} n’a jamais connu','d’un horloger','d’une saltimbanque','d’un chauffeur de camion','d’une archéologue','d’un gardien de musée'
]);
export const EVENTS2=EVENTS.concat([
 'A survécu seul{e} à trois jours dans la montagne enneigée.','A arrêté un cheval emballé à mains nues, à sept ans.','A grandi dans un orphelinat tenu par des religieuses.',
 'Voit parfois en rêve des combats qui n’ont jamais eu lieu.','A été chassé{e} de son école pour s’être battu{e} contre trois grands.','A sauvé un enfant de la noyade pendant une crue.',
 'A perdu la voix pendant un an après un incendie.','A gagné sa vie en se battant dans des combats clandestins.','A vu un homme en armure dorée traverser son village une nuit.',
 'Parlait aux animaux, disaient les voisins ; les chiens le suivaient partout.','A appris à lire seul{e}, dans les livres d’une bibliothèque abandonnée.',
 'Est tombé{e} d’une falaise sans une égratignure.','A guidé tout un village hors d’une forêt en flammes.','Faisait trembler les vitres quand {il} se mettait en colère.',
 'A été vendu{e} comme apprenti{e} à un marchand, puis s’est enfui{e}.','A grandi au milieu des ruines d’un ancien temple.','A traversé un désert à pied pour rejoindre sa tante.',
 'Gardait les chèvres seul{e} dans la montagne dès huit ans.','A été frappé{e} par la foudre et n’en garde qu’une cicatrice en étoile.','A été recueilli{e} par un vieux maître d’armes qui ne parlait jamais.',
 'A battu à la course tous les garçons et toutes les filles de sa ville.','Ses mains se mettent à briller quand {il} a peur.','A perdu ses parents dans un tremblement de terre.',
 'A volé pour nourrir ses petits frères, et ne s’en est jamais caché{e}.','Une inconnue lui a laissé un pendentif marqué d’une constellation.'
]);
export const GOALS2=GOALS.concat([
 'Veut envoyer de l’argent à sa famille restée au pays.','Veut retrouver la femme qui lui a laissé le pendentif.','Veut qu’on prononce son nom avec respect dans son village.',
 'Veut savoir qui étaient vraiment ses parents.','Rêve d’ouvrir un jour une école pour les enfants des rues.','Veut surpasser son maître, et le lui dire en face.',
 'Cherche à maîtriser une colère qui lui fait peur.','Veut simplement manger à sa faim, et que les autres aussi.','Veut voir toutes les étoiles du ciel austral.',
 'Veut réparer une faute qu’{il} refuse de raconter.','Veut prouver qu’on peut être tendre et fort{e} à la fois.','Ne sait pas encore ce qu’{il} cherche, mais {il} le saura en le voyant.',
 'Veut écrire un jour l’histoire du Sanctuaire.','Veut revoir la mer de son enfance.','Veut protéger celui ou celle qui l’a sauvé{e}.'
]);
export const VET_EVENTS2=VET_EVENTS.concat([
 'A défendu seul{e} un escalier pendant une nuit entière.','A porté son maître mourant jusqu’au pied des douze maisons.','A perdu un frère d’armes en le couvrant de son corps.',
 'S’est réveillé{e} parmi les morts, son armure fendue en deux.','A vu le ciel se couvrir de cendres le dernier jour de la guerre.','A tenu la porte du village de Rodorio pendant que les enfants fuyaient.',
 'A refusé de quitter le Sanctuaire quand tous les autres partaient.','A affronté un spectre et n’en parle qu’à voix basse.','A survécu en se cachant trois jours sous les décombres d’une maison du zodiaque.',
 'A combattu aux côtés du dernier Grand Pope.'
]);
export const VET_GOALS2=VET_GOALS.concat([
 'Veut que les nouveaux apprentis n’aient jamais à vivre ce qu’{il} a vécu.','Boit un peu trop les soirs d’orage.','Garde la cape d’un ami tombé et ne s’en sépare jamais.',
 'Veut retrouver les armures des disparus et leur donner de nouveaux porteurs.','Se demande chaque matin pourquoi {il} a survécu.','Veut rebâtir le Sanctuaire pierre par pierre, quitte à y laisser sa vie.',
 'A promis à un mourant de veiller sur Athéna.','Rit plus fort que tout le monde, pour ne pas penser.'
]);
// Touches régionales : un métier des parents et un souvenir d'enfance par grande région du monde.
const REG={
 med:{z:'gr it es pt fr',p:['d’une famille de pêcheurs d’éponges','d’un berger des collines','d’une marchande d’olives'],e:['A plongé chaque été pour remonter des amphores englouties.','A grandi à l’ombre des ruines antiques où {il} jouait à la guerre.']},
 nord:{z:'no fi bt de en ce',p:['d’un bûcheron','d’une pêcheuse en haute mer','d’un gardien de phare'],e:['A passé ses hivers sur un lac gelé à guetter les aurores.','A survécu à une nuit de tempête dans une barque.']},
 est:{z:'sl ba ro hu ca tr',p:['d’un mineur de charbon','d’une chanteuse de village','d’un forgeron de montagne'],e:['A traversé les montagnes à pied pendant un hiver de guerre.','A appris à se battre dans les cours d’immeubles gris.']},
 orient:{z:'ar fa he',p:['d’un caravanier','d’une tisserande de tapis','d’un astronome amateur'],e:['A dormi des nuits entières à compter les étoiles du désert.','A guidé une caravane perdue grâce aux constellations.']},
 afrique:{z:'wa ea sa',p:['d’une griotte qui chantait les héros','d’un éleveur de zébus','d’une commerçante du grand marché'],e:['A couru des marathons pieds nus dans les hautes plaines.','Connaissait par cœur les récits des anciens sur les étoiles.']},
 inde:{z:'in',p:['d’un tisserand de soie','d’une professeure de danse','d’un conducteur de rickshaw'],e:['A médité des heures sous un banian avant même de savoir lire.','A survécu à la mousson dans une ville submergée.']},
 asie:{z:'cn jp kr se',p:['d’un maître de thé','d’une plongeuse','d’un cuisinier de rue','d’une calligraphe'],e:['A appris les arts martiaux dans un dojo de quartier.','A grandi entre les rizières en terrasse et les temples de montagne.']},
 steppe:{z:'ct',p:['d’éleveurs nomades','d’un dresseur d’aigles','d’une cavalière'],e:['Montait à cheval avant de savoir marcher.','A chassé avec un aigle dans la steppe glacée.']},
 ameriques:{z:'la',p:['d’un cultivateur de café','d’une musicienne de rue','d’un guide de haute montagne'],e:['A grandi sur les hauts plateaux, où l’air rare forge les poumons.','A échappé à une bande armée en traversant la jungle.']},
 ocean:{z:'pa',p:['d’un navigateur des îles','d’une sculptrice de pirogues'],e:['Savait lire la houle et les étoiles pour naviguer d’île en île.','A nagé d’un atoll à l’autre pour aller chercher du secours.']}
};
export function regionOf(z){for(const k in REG)if(REG[k].z.split(' ').includes(z))return REG[k];return null;}
