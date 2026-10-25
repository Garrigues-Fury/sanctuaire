# Sanctuaire Renaissant — cahier des charges

Jeu de gestion « idle » personnel, inspiré de l'univers Saint Seiya, à jouer sur un **Google Pixel 9 Pro (Android)**. Usage strictement privé.

Le prototype jouable actuel (v0.6) est `prototype/sanctuaire.html` : un seul fichier HTML/JS. Il fait foi pour toutes les règles et formules. Ce document en résume l'intention, ce qui a été validé avec le joueur et la cible technique de la nouvelle version.

## Le joueur et la façon de travailler

- Seba, ingénieur (hydraulique), **ne programme pas et ne veut pas programmer**. Il joue le rôle de maître d'ouvrage : il teste, critique le game design, l'équilibrage et le rendu visuel.
- Il préfère un travail **itératif et collaboratif** : livrer des versions jouables, lui expliquer les choix et les contradictions éventuelles, le laisser trancher.
- Écrire en **français**. Pas de jargon technique non expliqué.
- Claude Code agit en **autonomie** pour : choisir les outils, chercher et intégrer des packs graphiques et sonores **gratuits** (en vérifiant et en notant la licence de chacun dans `CREDITS.md`), proposer et configurer des serveurs MCP utiles (par exemple pour la génération d'images). Ce qui demande Seba : créer un compte, une clé d'API ou tout ce qui est payant.

## Cible technique

- **Moteur** : Phaser 3, ou mieux si c'est justifié. Projet multi-fichiers, avec Vite par exemple.
- **Livraison sur le Pixel** : application web installable (PWA, hors ligne, icône sur l'écran d'accueil), hébergée gratuitement (GitHub Pages ou équivalent). Un APK via Capacitor est envisageable plus tard.
- **Orientation portrait**, contrôle tactile, lisible sur un écran d'environ 412 px de large.
- **Sauvegardes nommées (demandées par Seba le 2026-10-25, `src/core/slots.js`)** : bouton dans la barre du haut, pour créer, charger (avec confirmation), supprimer ou copier le code d'une sauvegarde. Une sauvegarde automatique est faite avant chaque mise à jour du jeu (les 3 dernières sont gardées). Une partie illisible n'est jamais écrasée : elle est mise de côté.
- **Sauvegarde locale**, avec export et import d'un code de sauvegarde. Le code du prototype doit pouvoir être importé : reprendre sa fonction `migrate()` (versions 1 à 6).
- **Temps réel** : le jeu progresse téléphone fermé et affiche un résumé d'absence au retour. Prévoir un mode test où le temps passe 60 fois plus vite.

## Structure du projet (v0.7, étape 1)

- `src/core/` : règles et données, sans affichage. `rules.js` reprend les formules du prototype telles quelles ; `migrate.js` reprend `migrate()` ; `save.js` gère la sauvegarde et le code (même encodage que le prototype, même clé `localStorage`). L'état `S` vit dans `state.js` et ne se réaffecte que par `setS()`.
- `src/map/` : carte animée en Phaser 4. Le décor fixe est dessiné en Canvas 2D (`background.js`) puis passé à Phaser ; les personnages sont redessinés à chaque image (`agents.js`, `map.js`).
- `src/ui/app.js` : interface HTML des onglets et fenêtres (reprise du prototype). Choix assumé : menus en HTML, scènes animées en Phaser.
- **Navigation (refonte UX du 2026-10-25, `src/ui/hub.js`, icônes vectorielles `src/ui/icons.js`)** : 5 onglets en bas.
  - **Sanctuaire**, avec 4 rubriques :
    - **Aperçu** : tableau de bord avec la puissance, les présages, la liste « À faire », les forces, l'économie, les chantiers et les éléments ;
    - **Bâtir** : la carte et les bâtiments ;
    - **Défense** : les 12 maisons et les zones avec leur défense, et les menaces des dieux ;
    - **Chronique**.
  - **Personnages**, avec 4 rubriques : Chevaliers, Apprentis, Formation (par disciple, par armure) et Relations (liens les plus forts, tensions).
  - **Armures**, **Monde** et **Astres** (le duel du Pope).
  - **Fiches de personnage (phase 2)** en 4 rubriques :
    - **Profil** : image en pied, radar des 6 statistiques, histoire et caractère ;
    - **Emploi du temps** : curseurs, métier, programme et séances ;
    - **Compétences** : cartes, épreuve ou promotion ;
    - **Liens** : maître ou disciples, et amitiés.
  - **Fiche d'armure** : image, qualités maîtresses, type d'épreuve, porteur ou restauration, compétences exigées, candidats et maîtres qui peuvent guider.
- `tests/` : tests Vitest (`npm test`), dont la reprise des sauvegardes v1 à v6.
- Commandes : `npm run dev` (jeu en développement), `npm run build` (site dans `dist/`), `npm run icons` (icônes depuis `public/icon.svg`).
- Hébergement : `.github/workflows/deploy.yml` publie sur GitHub Pages à chaque envoi sur `main`.

## Refonte graphique « idle RPG » (demandée le 2026-10-24)

- **Personnages** : générateur vectoriel anime `src/art/character.js`. Les personnages restent infinis (choix de Seba), avec une apparence qui suit le pays, le sexe, le rang, la constellation et la faction. Les chevaliers adultes ont un look « sexy » de RPG mobile (taille marquée, ventre et cuisses nus, armures ajustées). **Les apprentis (8 à 16 ans) ne sont jamais sexualisés** : silhouette d'enfant, tunique sobre. La page `galerie.html` (développement seulement) montre un échantillon.
- **Charte v3, style « idol gacha » (demandée par Seba le 2026-10-24)** : personnages adultes beaux et sexy façon splash art de jeu gacha, **jamais de casque** (cheveux libres, un petit accessoire discret ou une boucle d'oreille). Images générées par l'API Mammouth (clé dans `.env.local`, jamais publiée) avec `node scripts/generate-images.mjs`, puis branchées par `node scripts/integrate-images.mjs` (webp dans `public/img/gacha/` et `public/img/armures/`, liste dans `src/core/data/art-list.js`). Chaque armure d'or est illustrée portée par une femme et par un homme, chaque armure d'argent et de bronze par élément. Un chevalier reçoit l'image de son armure et de son sexe s'il en est le premier porteur ; sinon, le générateur vectoriel (sans casque lui aussi) prend le relais.
- **Combat** : scène Phaser animée `src/battle/battle.js` (ruées, impacts, projectiles d'élément, garde, coup ultime avec encart, secousses, chiffres de dégâts). La logique reste dans `src/core/combat.js`.
- **Créateur de personnage 3D (prototype du 2026-10-25, demandé par Seba : bibliothèque d'images figée, physique au choix, armure portée)** : bouton « Apparence 3D » dans la rubrique Profil d'un chevalier. Contraintes de Seba : gratuit, fluide sur le Pixel 9 Pro, aucune manipulation de sa part.
  - `src/three/avatar3d.js` : three.js + `@pixiv/three-vrm`, deux personnages de base VRoid CC0 (`public/models/`, environ 17 Mo chacun, téléchargés à la première ouverture puis gardés hors ligne). Le physique se règle en étirant les os (taille, carrure, poitrine pour les femmes, taille, hanches, cuisses, rondeurs) ; peau et cheveux reprennent la couleur du personnage. L'armure est fabriquée par le code et accrochée aux os (épaulières, plastron ou coques qui suivent la poitrine, gorgerin, ceinture, tassettes, pans d'étoffe de la couleur de l'élément, brassards, genouillères, jambières, petit ornement dans les cheveux, jamais de casque), avec le métal du rang.
  - `src/ui/creator3d.js` : la fenêtre, les curseurs et l'enregistrement dans `p.look3d`. La 3D n'est chargée qu'à l'ouverture.
  - À trancher avec Seba : apprentis (silhouette d'enfant, sans curseurs « sexy »), armures propres à chaque constellation, usage de la 3D dans les fiches et en combat.
- **Phases suivantes prévues** : écrans façon idle RPG (cadres ornés, accueil avec l'équipe), Sanctuaire avec ces personnages, puis décors et effets tirés de banques gratuites (licences dans `CREDITS.md`).

## Principes de game design (validés)

- **Jeu de patience, pas chronophage, sans pression.** Rien ne punit une absence. Pas de rendez-vous à heure fixe.
- **Durée d'une partie : plusieurs mois.**
- **On y revient chaque jour** pour : répartir les points gagnés, lancer des entraînements avec l'énergie accumulée, fabriquer, construire, et faire le duel quotidien.

## Univers et contraintes de licence

- **Personnages 100 % originaux**, fidèles aux 88 constellations du canon : 12 or, 24 argent, 52 bronze. La liste et les éléments sont dans le prototype.
- **Ne jamais reproduire** les personnages, armures ou visuels officiels de Saint Seiya. Les noms de constellations, les dieux grecs et l'univers en général sont acceptés.
- **Exception décidée par Seba le 2026-10-24** : les 8 chevaliers d'or de sa planche (`art/personnages/`) sont gardés tels quels malgré leur ressemblance avec les armures officielles et leurs apparences uniformes (usage strictement privé). La règle s'applique toujours aux nouvelles images.
- **Direction artistique (confirmée par Seba le 2026-10-24, après un essai en semi-réaliste)** : style anime, comme `docs/reference.jpeg`. Les planches semi-réalistes de `art/` servent de modèles pour l'architecture et les armures, et restent en jeu en attendant leur version anime. Les consignes de génération sont dans `docs/charte-graphique.md`. Le Sanctuaire intact est le but à atteindre (écran titre, vision) ; en jeu, on part des ruines. Ambiance : lumière dorée de soleil couchant, ruines grecques. Personnages avec tatouages tribaux, armures segmentées et rivetées, tenues de cuir et de tissu. Image de référence fournie par Seba, à placer dans `docs/reference.jpg`.
- **Apparence fidèle à l'origine** : peau, cheveux et yeux selon le pays de naissance (193 pays, profils régionaux et exceptions par pays). Prénoms cohérents avec le pays ; prénoms occitans possibles pour la France, systématiques pour les Cévennes. **Exception décidée le 2026-10-24** : des cheveux colorés de manga (vert, bleu, rose, violet, argent, rouge), expliqués par le cosmos qui teinte les cheveux, chez environ 1 chevalier sur 5 et plus rarement chez les autres ; la peau, les yeux et les traits restent fidèles à l'origine. Silhouettes variées pour les adultes (poitrine, rondeurs, carrure, beauté, cicatrices, tatouages, taches de rousseur).

## Systèmes du jeu

1. **Sanctuaire dévasté à reconstruire**
   - Bâtiments : oliveraies, carrière, mine, bibliothèque, jardin des simples, herboristerie, ateliers d'artisanat, réserves, dortoirs, arène, atelier des armures, village des artisans.
   - Les douze maisons du zodiaque se relèvent jusqu'au niveau 5.
   - Le nombre de chantiers simultanés est limité.
   - **Savoir-faire des bâtisseurs (demandé par Seba le 2026-10-25, `src/core/builders.js`)** :
     - chaque chantier terminé rapporte des points de bâtisseur (davantage pour les niveaux élevés et les maisons), et les travaux en cours aussi ;
     - on les investit, avec des ressources, dans 4 savoir-faire à niveaux : chantiers en parallèle (+1 chantier par niveau), échafaudages (chantiers plus rapides), taille de pierre (moins de marbre et de métal), architecture sacrée (maisons du zodiaque moins longues et moins chères) ;
     - sur la carte, les chantiers en cours portent des échafaudages et une barre d'avancement ;
     - le survol (ou l'appui long au doigt) d'un bâtiment ou d'une maison affiche son nom, son niveau et ses statistiques.
2. **Ressources** : vivres, marbre, métal, savoir, herbes, plus des objets fabriqués (potion d'endurance, onguent, tisane, élixir, lingot, outils, matériel, ambroisie, huile sacrée).
3. **Carte animée du Sanctuaire**
   - Les villageois font la navette entre leur site et les réserves.
   - Forgerons et artisans travaillent sur place. Les apprentis s'entraînent dans l'arène et les maîtres les surveillent. Les gardes sont à leur poste.
   - Toucher un site ouvre sa gestion.
4. **Survivants au départ, selon la difficulté choisie en début de partie (demande de Seba du 2026-10-25, `DIFFS` dans `src/core/people.js`)** : Facile 4 or, 6 argent, 10 bronze ; Moyen 3 or, 4 argent, 8 bronze ; Difficile 2 or, 3 argent, 5 bronze. Le choix s'affiche au premier lancement (Moyen si on ferme la fenêtre) et dans Réglages › Nouvelle partie. Chaque chevalier mange 2 vivres par heure : les champs, les villageois et les réserves de départ suivent la difficulté pour que les vivres restent positives (environ +76/h en Facile, +33 en Moyen, +19 en Difficile). Chaque chevalier d'or relève sa maison au niveau 1. Rôles possibles : Grand Pope (unique), Recruteur, Maître (3 apprentis), Intendant, Maître d'œuvre, ou entraînement personnel.
5. **Apprentis**
   - Profil : signe, élément, statistiques (force, vitesse, dextérité, endurance, psychokinésie, cosmos ; les deux nouvelles ajoutées le 2026-10-24 à la demande de Seba), potentiel caché (environ 1 % peuvent atteindre l'or), impression visible approximative.
   - Biographie de 3 lignes, nationalité.
   - Qualités et défauts de niveau I à III. Exemples de qualités : persévérant, fougueux, patient, studieux, loyal, sociable… Exemples de défauts : paresseux, impulsif, peureux, distrait, arrogant, colérique, têtu, fragile, gourmand.
6. **Progression**
   - L'XP s'accumule en temps réel. Chaque niveau donne des points de compétence, répartis par le joueur.
   - Le cosmos s'éveille au niveau 5. Une technique est découverte aux niveaux 10, 20 et 30.
   - L'affinité de signe ou d'élément avec le maître accélère la formation.
   - **Effets des traits (précisés le 2026-10-24)** : chaque qualité et chaque défaut a un effet « au Sanctuaire », un effet « en combat » et un effet « avec les autres » (`src/core/data/traits.js`). Nouvelle qualité : **Drôle**.
   - **Affinités et vie entre personnages** (`src/core/social.js`) : l'entente (de −4 à +4) vient du caractère, des racines (même pays, même région du monde) et de l'histoire (orphelins, survivants, deuil, enfance au bord de la mer, appel du cosmos). Chaque jour, des amitiés se nouent ou s'effilochent seules, et la chronique le raconte. Les scènes au Sanctuaire « complicité », « tension » et « racines » en découlent.
7. **Énergie**, qui se recharge avec le temps. Les **entraînements sont ouverts à tous** (chevaliers, Pope, apprentis, gardes ; `src/core/training.js`) et coûtent surtout de l'énergie, rarement du savoir, parfois un objet fabriqué (matériel d'entraînement, élixir). **S'entraîner à deux** (apprentis entre eux, apprenti et chevalier, chevaliers et gardes entre eux) : le partenaire doit être disponible et accepter, selon l'affinité et le caractère ; un maître accepte toujours son apprenti. Objets d'entraînement fabriqués par les artisans (matériel, lingot) et les herboristes (onguent, élixir, tisane). Elle sert aussi aux :
   - séances spéciales ;
   - entraînements particuliers chevalier-apprenti (gain d'amitié, transmission possible d'une qualité) ;
   - travail sur soi : corriger un défaut ou renforcer une qualité, avec des objets fabriqués.
8. **Amitiés** : des points à distribuer entre deux personnages, qui accordent un bonus d'XP plafonné.
9. **Villageois** : ils travaillent sur les sites et progressent dans leur métier. Les apprentis peuvent être envoyés en renfort : ils gagnent une statistique mais se forment moins vite.
10. **Armures** : on les restaure à l'atelier avec des forgerons d'un niveau minimum, puis un apprenti passe l'épreuve. L'armure d'or n'accepte que les natifs de sa maison.
    - **Affinités (demandées par Seba le 2026-10-25, `src/core/armor.js`)** : chaque armure a deux qualités maîtresses. L'affinité (0 à 100) vient de l'élément du signe, des statistiques travaillées et des maîtres qui ont formé le personnage. Sous 25 (45 pour l'argent, 55 pour l'or), l'armure reste muette. La fiche montre les 3 armures pressenties, et l'atelier pour qui chaque armure est pressentie.
    - L'argent et l'or exigent des personnages très doués (potentiel caché).
    - **Promotion** : un chevalier de bronze très doué peut passer l'épreuve d'une armure d'argent, un chevalier d'argent celle de l'or de sa maison ; son ancienne armure redevient libre.
    - **Cartes de compétences (inventaire de Seba du 2026-10-25, `src/core/data/skills.js`, `src/core/skills.js`)** : une compétence = une carte, rangée en famille, de niveau 1 à 10 (monte avec l'XP).
      - **8 fondamentales** (Cosmos, Maîtrise, Physique, Combat, Mental, Perception, Survie, Harmonie), exigées par toutes les armures.
      - **3 vitesses**, une par rang et dans l'ordre : Mach 1 (bronze), Mach 5 (argent), vitesse de la lumière (or). On ne les découvre qu'auprès d'un maître de ce rang au moins : Mach 5 en quelques semaines, la lumière en plusieurs mois. Fossé immense entre les rangs.
      - **53 compétences spécifiques** (psychique, contrôle, projection, corporelles, éléments, arts martiaux, défense, physique, savoir) ; chaque armure en exige 2 à 4 (Bélier : télékinésie, réparation d'armure, barrières ; Cancer : âmes, passage spirituel, entrave psychique ; Baleine : onde de choc, pression, grande amplitude ; Cygne : glace, gel ciblé, cristallisation, précision thermique).
      - **Découverte** : avec le temps d'entraînement, selon les aptitudes (statistiques et qualités), l'effort, l'expérience (niveau), le maître (rang, niveau, Grand Pope ; un maître qui possède la compétence la transmet plus vite), l'affinité de signe ou d'élément avec lui et les amitiés. S'entraîner à deux avec plus fort aide aussi. Les spécifiques visées sont celles de l'armure pressentie la plus proche. Rien n'est automatique au passage de niveau.
      - **Niveaux** (précisé par Seba le 2026-10-25) : ils montent avec l'XP, selon l'aptitude, la part du programme d'entraînement qui nourrit la carte et les mêmes liens. Ils augmentent **la puissance du chevalier** (combat et puissance affichée), pas les chances à l'épreuve : fondamentales pour tout le corps, spécifiques pour les techniques, vitesse en gros paliers (Mach 1, Mach 5, lumière).
      - **Pour obtenir une armure** : avoir découvert ses compétences (fondamentales, vitesse, spécifiques), avoir assez d'affinité, puis réussir l'épreuve. Trois sortes d'épreuves (`src/core/trial.js`, règles précisées par Seba le 2026-10-25) :
        - **combat entre disciples** (Pégase, Licorne, Loup, Petit Lion, Lynx, Hydre…) : **le vainqueur reçoit l'armure**, quel qu'il soit. L'adversaire est un de vos apprentis qui y prétend aussi, sinon le disciple d'un autre maître, qui rejoint alors le Sanctuaire avec l'armure ;
        - **combat d'évaluation face à un chevalier, le « sempai »** (Dragon, Grande Ourse, Indien, Cerbère, Centaure, Orion, Hercule…), comme un passage de grade au dojo : le sempai retient ses coups et juge si le disciple montre ses fondamentales (Combat : placer des coups ; Maîtrise : réussir une technique ; Perception : esquiver ; Survie : tenir 5 échanges ; Mental : tenir 8 échanges). Il en faut 4 sur 5, ou gagner le combat ;
        - **épreuve classique** pour les autres armures (chance de réussite).
        - Les combats d'épreuve se jouent **en direct** dans la scène de combat animée (`src/ui/trialfight.js`), ou se résolvent automatiquement ; l'estimation affichée utilise le même moteur. Le sempai encaisse énormément (×12) et retient ses coups : le disciple ne le bat presque jamais.
      - **Résonance** : l'armure est vivante. Avec une affinité de 70, elle accepte un porteur à qui il manque une compétence spécifique et la lui transmet ; dès 85, elle les transmet toutes. Les fondamentales et la vitesse restent obligatoires.
      - À venir : quels maîtres transmettent le mieux quelles compétences, et les effets des niveaux en combat.
10 bis. **Suivi des formations (demandé par Seba le 2026-10-25, `src/core/formation.js`, onglet Apprentis)** :
    - Métier **Maître d'apprentissage** : il oriente les apprentis, révèle jusqu'où chacun peut aller (bronze, argent, or) et accélère leurs découvertes (jusqu'à +15 %).
    - **Vue par disciple** : potentiel, fondamentales, vitesse ; répartition vers un maître en touchant un chevalier (lien de signe ou d'élément, compétences utiles, place sur 3) ; 3 armures pressenties avec les compétences exigées.
    - **Vue par armure** : les candidats, prêts ou non, et le type d'épreuve.
    - Dans les deux vues, **les maîtres qui peuvent guider** : les constellations dont l'armure maîtrise une compétence exigée (le Verseau pour le froid du Cygne). **En couleur** si un chevalier porte cette armure, **en gris** sinon. Il reste alors la résonance si l'affinité est très forte.
11. **Gardes** : un apprenti qui a raté son épreuve ou qui est surpassé devient garde. Il est affecté à une maison, au village ou à un site, et sa valeur de défense comptera lors des attaques.
12. **Lecture des astres**, le duel quotidien du Pope contre un dieu :
    - **Fréquence** : une partie par jour réel, toutes les 24 minutes en mode test. Il faut un Grand Pope en poste.
    - **Format (revu le 2026-10-24, vraies règles de Splendor)** : au tour par tour, en plein écran et animé. À son tour, une action : prendre 3 gemmes d'éléments différents, ou 2 identiques (s'il en reste 4), ou acheter une carte, ou en réserver une (3 au plus, +1 cosmos d'or qui sert de joker). Les gemmes **s'accumulent** (10 au plus) et se dépensent. Les cartes donnent des ✦ et une **réduction permanente** de leur élément. Seba a choisi d'abandonner l'ancienne règle des capacités qui se rechargent.
    - **102 cartes** (40 de rang I, 32 de rang II, 20 de rang III, 10 artefacts) et **8 constellations sacrées** (les « nobles » de Splendor : 3 ✦ pour qui réunit les bonus demandés). Données dans `src/core/data/stars.js`, illustrations dans `src/art/cards.js`.
    - **Force du Sanctuaire** : les scores d'élément (personnages de l'élément × rang × cosmos) donnent les **gemmes de départ** (4 au plus par élément). La puissance totale fixe le **niveau de partie** (1 à 5) : dieu plus fort, carte gardée plus puissante, plus de faveur.
    - **Achats** : jusqu'à **2 cartes par tour** (demande de Seba) ; prendre des gemmes ou réserver reste une action unique.
    - **Renforts** : une gemme contre de vraies ressources, une fois par tour, sans perdre son action.
    - **Balayage** : renouveler une rangée de cartes contre des ressources du Sanctuaire (vivres et marbre), de plus en plus cher.
    - **Artefacts** (Masque du Grand Pope, Sceptre d'Athéna, etc.) : achetés en duel, ils agissent jusqu'à la fin de la partie et rejoignent la collection pour toujours. On en emporte 3 à chaque duel.
    - **Fin de partie** : le premier à 15 ✦ en fin de manche, sinon le meilleur après 20 manches.
    - **Difficulté** : le dieu reçoit des gemmes de départ selon son niveau, et un bonus tous les 6 niveaux. Ses acquis deviennent des gemmes de départ.
    - **Victoire** : on garde une carte, dont l'effet devient permanent.
    - **Défaite** : le dieu monte en niveau, garde ses acquis et sera plus dangereux lors de ses attaques.
13. **Factions** : une page présente le Sanctuaire et chaque dieu, avec niveaux, bilans et bonus. On y trouve aussi 10 artefacts mythologiques, débloqués en accumulant des bonus permanents.
14. **Expéditions dans le monde** (décidé avec Seba le 2026-10-24) :
    - **Mappemonde** dans l'onglet Monde. Des alertes apparaissent avec le temps : une toutes les 6 à 10 h de jeu, 4 au plus. Il y a deux sortes d'alertes : village attaqué par des pillards, des bêtes ou les serviteurs d'un dieu, ou enfant prometteur à recruter, qui vient alors de ce pays.
    - **Départ immédiat**, mais il coûte **30 d'énergie** au chevalier choisi. Une alerte ignorée disparaît au bout de 3 jours **sans pénalité** : on rate seulement la récompense.
    - **Combat au tour par tour** (frapper, technique, coup ultime, garde ; cosmos de 0 à 10 ; avantage d'élément) ou **automatique**. Les niveaux de danger sont calés sur un chevalier type : ★ bronze débutant, ★★★★★ chevalier d'or.
    - **Dialogues façon RPG** : choix de réponse, répliques selon les qualités et défauts du chevalier, tirages au sort, rebondissements inattendus. Des **scènes au Sanctuaire** se présentent environ une fois par jour.
    - Code : `src/core/combat.js`, `src/core/expeditions.js`, `src/core/data/scenes.js` (le texte des scènes), `src/ui/world.js`, `src/ui/scene.js`.
15. **Emploi du temps, missions, blessures (demandé le 2026-10-24, en 4 étapes)** :
    - **Étape 1, emploi du temps** (`src/core/schedule.js`) : un chevalier répartit son temps en % entre son métier (Grand Pope, Recruteur, Intendant, Maître d'œuvre, Chercheur à la bibliothèque), la formation de ses disciples (3 au plus ; « Maître » n'est plus un métier) et son entraînement personnel. Un apprenti en renfort répartit entre entraînement et aide au Sanctuaire. Le goût de l'effort (travailleur, persévérant) ou la paresse change le rendement de ce temps.
    - **Étape 2, programme d'entraînement** (`src/core/program.js`, revu par Seba le 2026-10-25) : le temps d'entraînement se répartit en **6 curseurs**.
      - **Physique** (force), **Rapidité** (vitesse), **Dextérité** (dextérité), **Endurance** (endurance) : chacun fait monter sa statistique.
      - **Méditation** : cosmos et psychokinésie, et énergie jusqu'à +50 %.
      - **Études** : XP jusqu'à +60 %, davantage pour un studieux.
      - Chaque part fait aussi **découvrir plus vite ses compétences** et monter leurs niveaux :
        - physique : physique, techniques corporelles, fondamentale Physique ;
        - rapidité : vitesses ;
        - dextérité : arts martiaux, contrôle, fondamentales Combat et Perception ;
        - endurance : défense, fondamentale Survie ;
        - méditation : psychique, éléments, projection, fondamentales Cosmos, Maîtrise et Mental ;
        - études : savoir, fondamentale Harmonie.
      - Séances ciblées à l'énergie pour chaque statistique.
    - **Dextérité** : précision (l'ennemi esquive moins) et coups précis à ×1,5 en combat ; atelier d'artisanat ; actions de mission (désarmer, ligoter). **Psychokinésie** : barrière qui amortit les coups (jusqu'à 20 %) et cosmos de départ plus haut ; herboristerie ; actions de mission (soulever le chariot, barrière autour d'un village). Les anciens personnages reçoivent dextérité = (force + vitesse) / 2 et psychokinésie = (cosmos + endurance) / 2.
    - **Métiers ajoutés le 2026-10-25** :
      - **Chercheur** (`src/core/research.js`) : en plus du savoir, il retrouve à la bibliothèque 10 savoirs perdus, de plus en plus longs à retrouver ; chacun ajoute +5 % à l'apprentissage et à la transmission des compétences.
      - **Médecin** (`src/core/medicine.js`) : repos après une épreuve jusqu'à −40 % et énergie jusqu'à +15 %. Il apprend la compétence **Maintien en vie** : découverte après 72 h de pratique, puis 10 niveaux très longs (des mois à plein temps). La survie d'un chevalier grièvement blessé passe de 10 % sans médecin à 27 % au niveau 1, puis jusqu'à 90 % ; elle servira à l'étape 4.
    - Étape 3 : tableau des missions (auto ou en direct). Étape 4 : fatigue, blessures (un blessé ne fait que se soigner), mort, armure à rapporter, cimetière, réparation à l'orichalque.
    - **Mort (décision de Seba le 2026-10-24)** : possible **seulement sur une mission risquée lancée par le joueur**, avec un avertissement clair avant le départ. **Jamais pendant une absence** si rien n'a été lancé.
16. **Comptes à rebours** : réveil de Poséidon au jour 90, guerre sainte contre Hadès au jour 270. La réincarnation d'Athéna sera révélée plus tard.

## Feuille de route

1. **Mise en place** : projet Phaser, PWA, hébergement, reprise des règles du prototype, import des sauvegardes.
2. **Charte graphique** :
   - consignes de génération cohérentes (portraits par rang et par origine, fonds, sites, maisons, dieux) ;
   - génération des images via une API (Gemini « Nano Banana » ou OpenAI), sur clé fournie par Seba ;
   - le générateur procédural de portraits reste en secours.
3. **Le Sanctuaire vivant** : carte animée en sprites, cycle jour et nuit, particules de cosmos, sons.
4. **Le duel des astres** mis en scène comme un vrai combat de cartes.
5. **Les fiches de personnages** retravaillées.
6. **Contenus suivants** :
   - incursions des dieux contre le Sanctuaire (les gardes et les chevaliers défendent) ;
   - arc de Poséidon (Marinas, 7 piliers, scellement) ;
   - réincarnation et progression d'Athéna ;
   - guerre sainte contre les 108 spectres d'Hadès, en tower defense sur les douze maisons.
