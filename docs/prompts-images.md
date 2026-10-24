# Consignes d'images à générer dans ChatGPT

**Principe.** Une armure peut être portée par un homme ou une femme, de n'importe quelle origine. On génère donc séparément :

- **les armures seules**, comme si un corps invisible les portait, de forme neutre (ni masculine ni féminine) ;
- **des visages variés** (sexe, origine, âge), tous cadrés de la même façon.

Le jeu affiche le visage du personnage et l'armure qu'il a gagnée. Plus tard (étape 5, fiches de personnages), il pourra superposer les épaulières de l'armure sur le buste.

**Mode d'emploi.**

1. Ouvre une conversation ChatGPT par série (A, B, C, D, E).
2. Envoie d'abord le **message de départ** ci-dessous, avec `docs/reference.jpeg` en pièce jointe.
3. Envoie ensuite les consignes de la série **une par une**, une image par message.
4. Enregistre chaque image sous le nom indiqué, dans `art/a-integrer/`.
5. Si ChatGPT propose un **fond transparent**, accepte : ça m'évite de détourer l'image.

---

## Message de départ (en début de chaque conversation)

> Je vais te demander une série d'images pour un jeu. Toutes doivent avoir exactement le même style que l'image jointe : illustration de style anime, dessin japonais moderne de qualité série télévisée haut de gamme, contours nets, aplats de couleur et ombrages doux. Lumière dorée de soleil couchant. Univers de la Grèce antique mythique. Métal patiné, segmenté et riveté, cuir, tissu, sangles et boucles. Aucun texte, aucune lettre, aucun logo, aucune signature, aucun filigrane. Une seule image par réponse, jamais de planche à plusieurs cases. Réponds simplement « prêt ».

---

## Série A : les 12 armures d'or (priorité 1)

Format **portrait** (vertical). Chaque consigne commence par la même phrase, suivie de la description propre à chaque maison :

> Une armure d'or de chevalier, vide, dressée comme si un corps invisible la portait, en pied, vue de face, de la tête aux pieds. Forme neutre, qui irait aussi bien à un homme qu'à une femme. Armure intégrale très ornée : casque ou diadème, épaulières, plastron, ceinture, brassards, gantelets, jambières, bottes, pièces segmentées et rivetées, avec des pierres de couleur. Fond gris neutre uni, ou transparent. Même style que l'image de référence.

| Fichier | À ajouter à la fin de la consigne |
|---|---|
| `armure-or-belier.png` | Thème du Bélier : épaulières en cornes de bélier enroulées, cape rouge, pierres rouges. |
| `armure-or-taureau.png` | Thème du Taureau : casque à larges cornes de taureau, plastron massif, tissus vert sombre, pierres vertes. |
| `armure-or-gemeaux.png` | Thème des Gémeaux : deux visages sereins gravés sur le plastron, symétrie parfaite, cape bleu nuit, pierres bleues. |
| `armure-or-cancer.png` | Thème du Cancer : croissant de lune sur le diadème, épaulières en carapace arrondie, cape bleue, pierres argentées. |
| `armure-or-lion.png` | Thème du Lion : casque en tête de lion à crinière, genouillères à tête de lion, cape rouge, pierres ambrées. |
| `armure-or-vierge.png` | Thème de la Vierge : petites ailes aux épaules, voiles blancs, épis de blé gravés, pierres bleu pâle. |
| `armure-or-balance.png` | Thème de la Balance : plateaux de balance stylisés aux épaules, lignes droites et équilibrées, tissus blanc et or, pierres vertes. |
| `armure-or-scorpion.png` | Thème du Scorpion : plaques en carapace pointue, queue de scorpion articulée dans le dos, cape violette, pierres violettes. |
| `armure-or-sagittaire.png` | Thème du Sagittaire : grandes ailes repliées dans le dos, arc doré fixé à l'épaule, tissus bruns, pierres rouges. |
| `armure-or-capricorne.png` | Thème du Capricorne : casque à cornes de chèvre recourbées vers l'arrière, lame courbe le long de l'avant-bras, tissus gris, pierres noires. |
| `armure-or-verseau.png` | Thème du Verseau : volutes d'eau gravées partout, amphore stylisée sur le plastron, voiles bleu clair, pierres bleues. |
| `armure-or-poissons.png` | Thème des Poissons : épaulières en coquillage, écailles gravées, voiles roses transparents, pierres roses. |

## Série B : armures brisées (priorité 1)

Format **paysage**. Elles s'affichent pour les armures pas encore restaurées.

> Une armure [d'or / d'argent / de bronze] de chevalier brisée, en morceaux éparpillés sur des dalles de marbre fendues, poussière, éclats, quelques pièces encore reconnaissables (casque, épaulière, plastron fendu). Lumière dorée rasante. Pas de personnage. Même style que l'image de référence.

Fichiers : `armure-or-brisee.png`, `armure-argent-brisee.png`, `armure-bronze-brisee.png`.

## Série C : visages (priorité 1)

Tous les visages doivent avoir **exactement le même cadrage**, sinon le jeu ne pourra pas leur superposer les armures. Format **carré**. Consigne commune :

> Portrait en buste, de face, tête droite et centrée, épaules entières visibles, le haut du crâne à un dixième du bord supérieur, le menton à mi-hauteur de l'image. [Description de la personne]. Tenue : [tenue]. Expression [déterminée / calme / fière / grave]. Fond uni gris clair, ou transparent. Même style que l'image de référence.

Deux tenues possibles :

- **Adulte** (servira aux chevaliers et aux gardes) : « combinaison sombre ajustée sous-armure, sangles de cuir sur les épaules, cou dégagé » ;
- **Jeune de 10 à 16 ans** (servira aux apprentis) : « tunique de lin usée, bandes de cuir croisées, un peu de poussière sur les joues ».

Les tatouages tribaux sont à mettre sur environ un personnage sur trois, pour varier.

Liste dans l'ordre de priorité. Le jeu tire un quart de ses recrues en Grèce : la Méditerranée passe donc en premier.

| Fichier | Personne |
|---|---|
| `visage-mediterranee-F-adulte.png` | femme grecque de 30 ans, peau olive, cheveux bruns ondulés attachés, yeux noisette |
| `visage-mediterranee-M-adulte.png` | homme grec de 30 ans, peau olive, cheveux noirs courts bouclés, barbe courte, yeux bruns |
| `visage-mediterranee-F-jeune.png` | fille grecque de 13 ans, peau olive, cheveux châtains en tresse, yeux bruns |
| `visage-mediterranee-M-jeune.png` | garçon grec de 13 ans, peau olive, cheveux noirs en bataille, yeux bruns |
| `visage-afrique-F-adulte.png` | femme d'Afrique de l'Ouest de 30 ans, peau très foncée, cheveux crépus en tresses, yeux brun foncé |
| `visage-afrique-M-adulte.png` | homme d'Afrique de l'Est de 30 ans, peau foncée, cheveux ras, yeux brun foncé |
| `visage-afrique-F-jeune.png` | fille d'Afrique australe de 12 ans, peau foncée, cheveux crépus courts, yeux brun foncé |
| `visage-afrique-M-jeune.png` | garçon d'Afrique de l'Ouest de 14 ans, peau très foncée, cheveux courts, yeux brun foncé |
| `visage-orient-F-adulte.png` | femme du Moyen-Orient de 30 ans, peau mate, longs cheveux noirs, yeux brun foncé, traits fins |
| `visage-orient-M-adulte.png` | homme d'Afrique du Nord de 30 ans, peau mate, cheveux noirs ondulés, barbe taillée, yeux bruns |
| `visage-orient-F-jeune.png` | fille iranienne de 14 ans, peau claire mate, cheveux noirs longs, yeux bruns |
| `visage-orient-M-jeune.png` | garçon marocain de 12 ans, peau mate, cheveux noirs bouclés, yeux bruns |
| `visage-amerique-F-adulte.png` | femme mexicaine de 30 ans, peau cuivrée, cheveux noirs raides, yeux bruns |
| `visage-amerique-M-adulte.png` | homme brésilien de 30 ans, peau brun clair, cheveux noirs ondulés, yeux bruns |
| `visage-amerique-F-jeune.png` | fille péruvienne de 12 ans, peau cuivrée, deux tresses noires, yeux brun foncé |
| `visage-amerique-M-jeune.png` | garçon colombien de 14 ans, peau brun clair, cheveux noirs courts, yeux bruns |
| `visage-asie-est-F-adulte.png` | femme japonaise de 30 ans, cheveux noirs mi-longs, yeux bridés brun foncé |
| `visage-asie-est-M-adulte.png` | homme chinois de 30 ans, cheveux noirs attachés, yeux bridés brun foncé |
| `visage-asie-est-F-jeune.png` | fille coréenne de 13 ans, cheveux noirs au carré, yeux bridés brun foncé |
| `visage-asie-est-M-jeune.png` | garçon japonais de 12 ans, cheveux noirs en pointes, yeux bridés brun foncé |

**Plus tard (priorité 2)**, même principe pour ces régions : Asie du Sud (Inde), Asie du Sud-Est, Europe du Nord, Europe de l'Est, Îles britanniques et Irlande (roux, taches de rousseur), Asie centrale, Océanie et Pacifique, Caraïbes, et la France, avec des prénoms occitans pour les Cévennes. Le jeu connaît 14 profils d'apparence en tout. Je compléterai la liste quand la première série sera intégrée.

## Série D : le Sanctuaire (priorité 1)

Format **portrait**, pour l'écran du téléphone.

| Fichier | Consigne |
|---|---|
| `sanctuaire-restaure.png` | Vue d'ensemble d'une montagne sacrée grecque au soleil couchant : un escalier de marbre serpente entre douze temples, un par signe du zodiaque, jusqu'au palais du Grand Pope au sommet. Cascades, cyprès, mer de nuages. Tout est intact, somptueux, bannières et braseros allumés. Même style que l'image de référence. |
| `sanctuaire-ruines.png` | Exactement la même vue, au lendemain d'une guerre sainte : temples effondrés, colonnes brisées, escalier fendu, fumées qui montent, braseros éteints. Quelques survivants minuscules déblaient les gravats. Même style que l'image de référence. |

## Série E : armures d'argent et de bronze (priorité 2)

Il y en a 76. En attendant, on fait **une armure par élément et par rang** : feu, eau, air, terre. Ça donne 8 images, format portrait, avec la consigne de la série A en remplaçant « d'or » :

- **Argent** : « armure d'argent partielle : épaulières, plastron, avant-bras, jambières, sur une tenue sombre. Argent et bleu acier, plus sobre que l'or. Thème [feu : flammes gravées, pierres rouges / eau : vagues, pierres bleues / air : plumes et nuages, pierres blanches / terre : roche et racines, pierres vertes] ». Fichiers `armure-argent-feu.png`, `armure-argent-eau.png`, `armure-argent-air.png`, `armure-argent-terre.png`.
- **Bronze** : « armure de bronze légère et patinée, quelques pièces sur une tenue de cuir et de tissu, rivets apparents, même thème [élément] ». Fichiers `armure-bronze-feu.png`, `armure-bronze-eau.png`, `armure-bronze-air.png`, `armure-bronze-terre.png`.

---

**Total priorité 1 : 37 images** (12 + 3 + 20 + 2). Pas besoin de tout faire d'un coup : dépose-les au fil de l'eau et je les intègre par séries.
