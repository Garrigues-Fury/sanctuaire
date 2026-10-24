# Charte graphique — Sanctuaire Renaissant

Version 1 du 24 octobre 2026. Elle s'appuie sur les deux planches de Seba (`art/`) et sur ses choix :

- **Style** : rendu 3D semi-réaliste, qualité cinématique de jeu vidéo (et non plus anime).
- **Le Sanctuaire intact** est le **but à atteindre** : il sert d'écran titre et de « vision ». La partie montre des ruines qui se relèvent peu à peu.
- **Les 8 chevaliers d'or dessinés sont gardés tels quels** (usage strictement privé).

## 1. Comment produire une image

1. Ouvre ChatGPT, crée une image par message.
2. Colle **le bloc de style commun** (section 2), puis **la consigne du sujet** (sections 3 à 8), en remplaçant ce qui est entre crochets.
3. **Une seule image par fichier**, pas de planche à plusieurs cases. Sur une planche, chaque morceau ne fait que 100 à 400 pixels, trop peu pour le téléphone : les visages des chevaliers d'or actuels sont à la limite.
4. Enregistre l'image dans `art/a-integrer/` avec le nom indiqué pour chaque sujet. Claude la redimensionne, l'allège et la branche dans le jeu.

Formats proposés par ChatGPT : carré (1024 × 1024), paysage (1536 × 1024), portrait (1024 × 1536).

## 2. Bloc de style commun (à coller à chaque fois)

> Rendu 3D semi-réaliste, qualité cinématique de jeu vidéo haut de gamme, éclairage doré de soleil couchant, ciel orange et rose, brume légère. Univers de la Grèce antique mythique : marbre blanc veiné, ornements d'or, frises grecques, cyprès, cascades. Détails nets, couleurs chaudes et riches. Aucun texte, aucune lettre, aucun logo, aucune signature, aucun filigrane.

## 3. Chevaliers (portraits)

Pour tous les chevaliers sauf les 8 chevaliers d'or déjà illustrés, **le visage suit le pays de naissance** (peau, cheveux, yeux, traits), comme le veut le cahier des charges. Le jeu fournit ces informations sur la fiche de chaque personnage.

**Portrait (carré)**, nom de fichier `portrait-[rang]-[constellation]-[F ou M].png` :

> [Bloc de style]. Portrait en buste, de face, légèrement de trois quarts, d'un(e) chevalier(e) [d'or / d'argent / de bronze] de la constellation [nom], [femme / homme] de [âge] ans, originaire de [pays] : [peau, cheveux, yeux]. Armure [dorée / argentée / bronze patiné] segmentée et rivetée, ornée de motifs évoquant [la constellation], avec cape ou tissu [couleur]. Regard [fier / calme / grave]. Fond flou de temple grec au couchant. Cadrage centré, visage bien éclairé.

**Corps entier (portrait vertical)**, nom de fichier `corps-[rang]-[constellation]-[F ou M].png` : même consigne, avec « en pied, debout, vu de face, de la tête aux pieds, fond gris neutre uni ».

Différences entre les rangs :
- **Or** : armure intégrale très ornée, dorée, avec des pierres de couleur.
- **Argent** : armure partielle (épaules, torse, avant-bras, jambières), argent et bleu acier, plus sobre.
- **Bronze** : pièces de bronze patiné sur une tenue de cuir et de tissu, rivets apparents, armure légère.

**À compléter en priorité** : les 4 chevaliers d'or manquants (Gémeaux, Balance, Sagittaire, Capricorne), puis une version de l'autre sexe pour chacune des 12 maisons. Le jeu tire au hasard le sexe des chevaliers : pour l'instant, un Lion femme ou un Bélier homme garde le portrait procédural.

## 4. Apprentis

Nom de fichier `apprenti-[F ou M]-[zone].png`. Zones : Méditerranée, Europe du Nord, Afrique, Moyen-Orient, Asie de l'Est, Asie du Sud, Amériques, Océanie.

> [Bloc de style]. Portrait en buste d'un(e) apprenti(e) de [âge] ans, originaire de [pays] : [peau, cheveux, yeux]. Pas d'armure : tunique de lin usée, protections de cuir aux avant-bras, bandages aux mains, quelques tatouages tribaux discrets. Visage déterminé, un peu de poussière. Fond flou d'arène de pierre au couchant.

Prévoir au moins 2 filles et 2 garçons par zone, soit 32 images. Le jeu choisira l'image la plus proche de l'origine de l'apprenti.

## 5. Sites du Sanctuaire (3 états)

Chaque site existe en trois états : **ruines** (niveau 0), **relevé** (niveaux 1 à 4), **prospère** (niveau 5 et plus). Format paysage. Nom de fichier `site-[nom]-[ruines / releve / prospere].png`.

Sites : oliveraies et potagers, carrière de marbre, mine, bibliothèque, jardin des simples, herboristerie, ateliers d'artisanat, réserves, dortoirs, arène, atelier des armures, village des artisans.

> [Bloc de style]. Vue de trois quarts en plongée de [site] du Sanctuaire d'Athéna, à flanc de montagne. État : [ruines : colonnes effondrées, herbes folles, gravats, quelques survivants qui déblaient / relevé : chantier en cours, échafaudages de bois, marbre neuf mêlé à l'ancien, villageois au travail / prospère : intact et somptueux, bannières, braseros allumés, vie animée]. Petits personnages à l'échelle, pas de gros plan.

## 6. Les douze maisons (3 états)

Nom de fichier `maison-[signe]-[ruines / releve / prospere].png`. Les planches actuelles donnent le modèle de l'état prospère : Bélier aux bannières rouges, Taureau à la tête de taureau et aux tentures vertes, Gémeaux aux deux statues, Poissons en rotonde bleue ornée d'un trident.

> [Bloc de style]. La maison [du signe] du zodiaque, temple grec sur l'escalier de la montagne sacrée, symbole [du signe] sculpté au fronton, bannières [couleur]. État : [ruines / relevé / prospère, comme au 5].

## 7. Dieux (duel des astres et factions)

Nom de fichier `dieu-[nom].png`, format portrait. Dieux : Arès, Éris, Apollon, Artémis, Héphaïstos, Hermès, Dionysos, Déméter (puis Poséidon et Hadès).

> [Bloc de style]. Portrait en buste de [dieu], divinité grecque, aura de [ses deux éléments, par exemple feu et terre pour Arès], expression [hautaine / menaçante / rusée], vêtements et attributs de [dieu]. Fond de ciel nocturne étoilé, constellations lumineuses.

## 8. Fonds d'écran

- `fond-titre-ruines.png` : la même vue d'ensemble que l'écran titre actuel, mais en ruines au lendemain de la guerre sainte. Format portrait, pour le téléphone.
- `fond-duel.png` : la chambre des astres du Grand Pope, dôme ouvert sur le ciel étoilé, table de marbre gravée du zodiaque. Format portrait.

## 9. Ce qui est déjà dans le jeu

| Image | Où | Fichier |
|---|---|---|
| Vue d'ensemble du Sanctuaire | écran titre | `public/img/sanctuaire/vue-1.webp` |
| 4 vues du Sanctuaire | onglet Chronique, « Le Sanctuaire restauré » | `public/img/sanctuaire/vue-1.webp` à `vue-4.webp` |
| 8 visages de chevaliers d'or | portraits, quand le signe et le sexe correspondent | `public/img/or/tete-1.webp` à `tete-8.webp` |
| 8 chevaliers d'or en pied | fiche du chevalier | `public/img/or/corps-1.webp` à `corps-8.webp` |

Attribution des maisons, devinée d'après les armures (**à confirmer par Seba**) :

| Planche | Indice visuel | Maison | Sexe |
|---|---|---|---|
| 1 | cornes de bélier, cape rouge | Bélier | F |
| 2 | croissant de lune, cape bleue | Cancer | F |
| 3 | ailes, voiles blancs | Vierge | F |
| 4 | coquillage, voiles roses | Poissons | F |
| 5 | tête de lion | Lion | M |
| 6 | cornes, armure verte | Taureau | M |
| 7 | queue de scorpion | Scorpion | M |
| 8 | volutes d'eau, bleu | Verseau | M |

Le portrait procédural reste en secours pour tous les autres personnages.
