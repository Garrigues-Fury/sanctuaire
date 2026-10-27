# Faire une illustration soi-même dans Gemini (gratuit)

C'est la même consigne que celle du script `scripts/generate-images.mjs`, qui a servi pour toutes les illustrations façon gacha du jeu.

## Marche à suivre

1. Ouvrir https://gemini.google.com et demander une image (le modèle d'images de Gemini, « Nano Banana », est de la même famille que celui du script).
2. **Joindre une image de référence pour le style** : `docs/reference.jpeg`, comme le script. On peut y ajouter une illustration déjà faite, par exemple `public/img/gacha/perso-cons-coupe-F.webp`.
3. Coller la consigne ci-dessous, après avoir rempli les passages entre crochets.
4. Si le personnage est coupé (pieds ou tête hors du cadre), redemander : « Refais-la en montrant le personnage entier, des cheveux jusqu'aux pieds, avec de l'espace autour. »
5. Enregistrer l'image dans `art/a-integrer/`, sous le nom `perso-cons-<constellation>-<F ou M>.png`, par exemple `perso-cons-lyre-F.png` ou `perso-cons-petit-cheval-M.png`. Le nom de la constellation s'écrit en minuscules, sans accent, avec des tirets.
6. Dire à Claude « intègre les nouvelles images » : il les réduit, recadre le portrait et les met en ligne.

## La consigne à copier

```
Illustration de style manga / anime, rendu « splash art » de personnage de jeu mobile idol gacha haut de gamme : contours nets, couleurs vives et lumineuses, ombrages doux et brillants, reflets dorés sur le métal, grands yeux expressifs, visage très beau et soigné. Même qualité de trait que l'image jointe, mais ne reprends pas ses personnages. Lumière chaude de soleil couchant. Univers de la Grèce antique mythique. Armure en métal ciselé, segmenté et riveté, avec cuir, tissu, sangles et boucles. Aucun texte, aucune lettre, aucun logo, aucune signature, aucun filigrane. Une seule image, jamais de planche à plusieurs cases.

[PERSONNAGE — choisir l'un des deux débuts :]
Une femme adulte d'environ 25 ans, au look sexy et séduisant d'héroïne de jeu gacha : [silhouette, attitude, pose].
Un homme adulte d'environ 28 ans, au look sexy et charismatique de héros de jeu gacha : [silhouette, attitude, pose].

[Origine, peau, yeux, cheveux, signes particuliers : cicatrice, tatouages, taches de rousseur…]

[POUR UNE FEMME :] Armure ajustée qui laisse voir le ventre, les épaules et le haut des cuisses, tenue séduisante mais jamais vulgaire, aucune nudité.
[POUR UN HOMME :] Ventre et bras en partie visibles entre les pièces d'armure, tenue séduisante mais jamais vulgaire, aucune nudité.

[RANG — garder une seule ligne :]
Armure d'or de chevalier, très ornée, avec des pierres de couleur : épaulières, plastron, ceinture, brassards, gantelets, jambières et bottes.
Armure d'argent et de bleu acier, partielle et plus sobre qu'une armure d'or : épaulières, plastron, avant-bras et jambières sur une tenue sombre ajustée.
Armure légère de bronze patiné : quelques pièces (épaulières, plastron court, brassards, genouillères) sur une tenue de cuir et de tissu, rivets apparents.

Thème de la constellation [nom] : [formes de l'armure, motifs gravés, couleurs des tissus et des pierres, petit ornement de cheveux].

Pas de casque ni de couvre-chef : cheveux libres et soignés, visibles en entier, avec seulement un petit accessoire discret aux couleurs de l'armure (barrette, fine chaîne, plume ou petit ornement dans les cheveux) ou une boucle d'oreille.

Tatouages tribaux discrets. Pose assurée et dynamique de personnage de gacha, vue de face ou de légers trois quarts. Le personnage ENTIER, des cheveux jusqu'aux pieds compris, avec de l'espace vide au-dessus de la tête et sous les pieds : rien n'est coupé par le bord de l'image. Fond gris neutre uni, sans aucun décor, sans ciel ni bâtiment. Format vertical 2:3.
```

## Exemple rempli (le Petit Cheval, le 27 octobre 2026)

> Un homme adulte d'environ 28 ans, beau et charmeur, héros de jeu gacha : pose décontractée de gars cool et sûr de lui, sourire en coin et regard charmeur, une main sur la hanche ou passée dans les cheveux, poids sur une jambe. Européen, peau blanche, yeux marron, cheveux châtains coiffés en mèches un peu en bataille, une cicatrice nette sur la joue droite. […] Thème de la constellation du Petit Cheval : épaulières en forme de tête de poulain stylisée, crinière de métal finement ciselée qui court le long des épaules et du dos, petits fers à cheval décoratifs à la ceinture, jambières élancées évoquant des pattes de cheval, gravures de terre et d'herbes, tissus vert sombre et brun, petites pierres vertes.

## Règles à garder

- **Jamais de casque.** Une couronne de plumes ou un petit ornement, oui.
- **Personnages originaux** : ne pas demander une armure ou un personnage officiel de Saint Seiya.
- **Les apprentis (8 à 16 ans) ne sont jamais sexualisés** : pour eux, ne pas utiliser les phrases « sexy » ni « séduisante », et demander une silhouette d'enfant en tunique sobre.
