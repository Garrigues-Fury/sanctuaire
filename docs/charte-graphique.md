# Charte graphique — Sanctuaire Renaissant

Version 3 du 24 octobre 2026. Elle remplace la version 2 pour tous les personnages et toutes les armures. Elle s'appuie sur l'image de référence (`docs/reference.jpeg`), sur les planches de Seba (`art/`) et sur ses choix :

- **Style** : **manga / anime, façon jeu mobile « idol gacha »** (demande de Seba du 24 octobre). Les personnages adultes sont beaux, sexy et agréables à regarder, comme les splash arts des jeux gacha : couleurs vives, métal brillant, grands yeux, visages soignés.
- **Pas de casque.** Aucune armure n'a de casque ni de couvre-chef : les cheveux restent libres et visibles. À la place, **un petit accessoire discret** aux couleurs de l'armure (barrette, fine chaîne, plume, petit ornement en forme du symbole de la constellation) **ou une boucle d'oreille**.
- **Les apprentis (8 à 16 ans) ne sont jamais sexualisés** : silhouette d'enfant, tunique sobre, aucune pose ni tenue suggestive. Cette règle passe avant toutes les autres.
- **Le Sanctuaire intact** est le **but à atteindre** : il sert d'écran titre et de « vision ». La partie montre des ruines qui se relèvent peu à peu.
- Les 8 chevaliers d'or des planches de Seba restent en jeu jusqu'à ce que leur version gacha les remplace.

## 1. Comment les images sont produites

Les images sont **générées automatiquement** par Claude avec l'API Mammouth AI (clé de Seba, rangée dans `.env.local`, jamais publiée), modèle Gemini 3 Pro Image :

```
node scripts/generate-images.mjs                 (toutes les images qui manquent)
node scripts/generate-images.mjs perso-or        (par préfixe : ici les 24 chevaliers d'or)
```

Les consignes complètes de chaque image sont dans `scripts/generate-images.mjs` : c'est la liste qui fait foi. Les images arrivent dans `art/a-integrer/`. Claude les réduit en webp, les branche dans le jeu et note leur origine dans `CREDITS.md`.

On peut toujours en produire une à la main dans ChatGPT : coller le bloc de style (section 2), puis la consigne du sujet, une image par message, sans planche à plusieurs cases.

## 2. Bloc de style commun

> Illustration de style manga / anime, rendu « splash art » de personnage de jeu mobile idol gacha haut de gamme : contours nets, couleurs vives et lumineuses, ombrages doux et brillants, reflets dorés sur le métal, grands yeux expressifs, visage très beau et soigné. Lumière chaude de soleil couchant. Univers de la Grèce antique mythique. Armure en métal ciselé, segmenté et riveté, avec cuir, tissu, sangles et boucles. Aucun texte, aucune lettre, aucun logo, aucune signature, aucun filigrane.

Joindre `docs/reference.jpeg` pour la qualité du trait (sans reprendre ses personnages).

## 3. Chevaliers (adultes)

**Principe.** Une armure se porte par un homme ou une femme, de n'importe quelle origine. On illustre donc chaque armure portée par **une femme et un homme**, d'origines variées d'une image à l'autre. Le jeu montre l'image quand le rang, la maison (ou l'élément) et le sexe du chevalier correspondent ; sinon, il garde le personnage dessiné par le générateur, qui suit fidèlement le pays d'origine.

**Silhouette.**
- **Femmes** : environ 25 ans, très belles, silhouette athlétique et féminine mise en valeur, armure ajustée qui laisse voir le ventre, les épaules et le haut des cuisses.
- **Hommes** : environ 27 ans, très beaux et charismatiques, silhouette athlétique, abdominaux et bras en partie visibles entre les pièces d'armure.
- Dans les deux cas : **séduisant mais jamais vulgaire, aucune nudité**. Tatouages tribaux discrets. Pose assurée de personnage de gacha, en pied, de la tête aux pieds, fond gris neutre uni, format vertical 2:3.

**Tête.** Pas de casque. Cheveux libres et soignés, un petit accessoire discret ou une boucle d'oreille, rappelant la constellation (un lion pour le Lion, un croissant de lune pour le Cancer, de petites cornes pour le Capricorne…).

**Différences entre les rangs.**
- **Or** : armure très ornée, dorée, avec des pierres de couleur, et le thème de la maison sur les épaulières, le plastron ou la cape.
- **Argent** : armure partielle (épaules, torse, avant-bras, jambières), argent et bleu acier, plus sobre, sur une tenue sombre ajustée.
- **Bronze** : quelques pièces de bronze patiné sur une tenue de cuir et de tissu, rivets apparents.

**Fichiers.** `perso-or-[maison]-[F ou M]` (24 images), `perso-argent-[élément]-[F ou M]` et `perso-bronze-[élément]-[F ou M]` (16 images), plus les armures seules, vides et sans casque, pour l'atelier des armures : `armure-or-[maison]`, `armure-argent-[élément]`, `armure-bronze-[élément]` (20 images).

## 4. Apprentis (enfants et adolescents)

**Jamais sexualisés.** Silhouette d'enfant ou d'adolescent, proportions de leur âge, tenue couvrante.

> [Bloc de style]. Portrait en buste d'un(e) apprenti(e) de [âge] ans, originaire de [pays] : [peau, cheveux, yeux]. Pas d'armure : tunique de lin usée, protections de cuir aux avant-bras, bandages aux mains. Visage déterminé et attachant, un peu de poussière. Fond flou d'arène de pierre au couchant.

Nom de fichier `apprenti-[F ou M]-[zone]`. Zones : Méditerranée, Europe du Nord, Afrique, Moyen-Orient, Asie de l'Est, Asie du Sud, Amériques, Océanie. Prévoir au moins 2 filles et 2 garçons par zone.

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

Toutes ces images sont encore semi-réalistes, avec casques : elles laissent la place aux images gacha de la version 3 au fur et à mesure.

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
