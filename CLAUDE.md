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
- **3D abandonnée (décision de Seba le 2026-10-26)** : l'essai de créateur 3D (VRoid + three-vrm, 25 octobre) a été jugé sans humanité, pas au niveau d'un jeu moderne ; il a été retiré le 27. Thrixel et Tripo (générateurs 3D) sont écartés pour la même raison. Direction retenue à valider : illustrations 2D façon gacha (Mammouth), animées en code, et interface refaite sur maquettes. Le cahier des charges de Seba est un document Claude Docs : https://claude.ai/artifact/GPJyjQHZgjhnQFrRjZs4Ku.
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
10 ter. **Échelle des statistiques par rang (demandée par Seba le 2026-10-27, « cf. Saint Seiya », `src/core/scale.js`)** :
    - un bronze a 3 à 7 fois les statistiques d'un apprenti, un argent 5 à 15 fois celles d'un bronze, un or 5 à 30 fois celles d'un argent (coefficients moyens : bronze ×5, argent ×50, or ×750) ;
    - à la promotion, chaque statistique est multipliée (×3 à 10 vers le bronze, ×5 à 15 vers l'argent, ×5 à 30 vers l'or) selon les qualités maîtresses de l'armure, les points forts du personnage et ses fondamentales ;
    - chaque point gagné (points de niveau, séances, programme) vaut le coefficient du rang ;
    - les formules réglées à l'échelle d'un apprenti lisent la statistique « ramenée » (÷ coefficient) : combat (puis ×coefficient pour les PV, la force, la défense, la vitesse ; esquive selon l'écart relatif de vitesse), cosmos du Pope, recrutement, épreuves, scènes ; le sempai se bat au niveau du disciple ;
    - les anciennes parties sont converties une fois (`migrateScale`, après la sauvegarde automatique d'avant mise à jour).
11. **Attaques du Sanctuaire, missions, blessures (demandées par Seba le 2026-10-27)** :
    - **Attaques** (`src/core/defense.js`, page Défense) : de temps en temps (tous les 2 à 5 jours), les chevaliers d'un dieu attaquent une zone (village, champs, carrière, mine, jardin, ateliers ; jamais la bibliothèque) ou l'escalier des douze maisons, dans l'ordre. Les chevaliers d'or gardent leur maison ; le joueur affecte bronzes et argents aux zones et aux maisons ; les autres interviennent en renfort ; le Pope en dernier. Duels loyaux un contre un, le vainqueur garde sa fatigue et ses blessures pour le suivant, dans les deux camps. Ennemis d'abord plus faibles que le bronze, jusqu'à l'argent avec le temps et le niveau du dieu. Chaque ennemi vaincu vaut 12 h d'entraînement (18 h s'il est d'un rang au-dessus). Une attaque perdue fait piller une partie des réserves de la zone. Tableau d'honneur (victoires et défaites par camp, par dieu et par personnage, reportées sur les fiches) et rapports de combat.
    - **Blessures** (`src/core/wounds.js`) : un vaincu est soigné environ 36 h à l'infirmerie, moins avec des médecins et des gardes postés à l'infirmerie (×2 s'ils savent soigner par le cosmos). Un blessé ne s'entraîne pas et ne part pas.
    - **Missions** (`src/core/missions.js`, `src/core/data/missions.js`, onglet Monde) : 18 types (volcan, raz-de-marée, séisme, incendie, avalanche, barrage, navire en perdition, épidémie, escorte, temple profané, bête mythique, infiltrés, fouilles, crue, sauvetage en montagne, village méfiant, orage de cosmos, faille d'un autre monde). Chacune demande des compétences, des statistiques, parfois un élément et des qualités ; équipe de 1 à 3 chevaliers, 30 d'énergie chacun ; durée de 6 à 24 h ; réussite estimée affichée. Rapporte ressources, faveur, expérience (8 h par étoile), compétences apprises sur le terrain, amitié entre équipiers. Un échec peut blesser, jamais tuer.
12. **Entraînement de la nuit (demandé par Seba le 2026-10-27, `src/core/autotrain.js`)** : chaque nuit à 2 h (heure du téléphone ; toutes les 24 h de jeu en mode test), l'énergie restante de chacun sert à s'entraîner, d'abord avec ses partenaires dans l'ordre choisi (par défaut : le maître pour un apprenti, les disciples pour un chevalier), puis seul ; réserve d'énergie réglable. Réglage dans la fiche, rubrique Emploi du temps.
13. **Noms uniques (2026-10-27)** : listes de prénoms allongées, jamais deux personnes du même prénom au Sanctuaire ; les doublons des anciennes parties sont renommés au chargement.
14. **Recensement (2026-10-27, `src/ui/census.js`, Personnages › Recensement)** : vue générale, éléments, signes, nationalités (par région du monde puis par pays), classements par compétence et par statistique.
14 bis. **Caractère et vétérans (demandés par Seba le 2026-10-27, `src/core/character.js`)** :
    - **Compétences de niveau 1 à 30** (plafond monté de 10 à 30) : courbe d'origine jusqu'à 10, puis +25 % d'XP par niveau.
    - **Vétérans** : les survivants de la guerre sainte précédente portent la marque « Vétéran » après leur grade ; leurs points forts (compétences de leur armure, 4 meilleures fondamentales, vitesse) sont au niveau 20 à 24 (22 à 26 pour l'or), le reste au moins 10 à 14.
    - **Cœur** (−100 haine à +100 bonté) : ±10 d'affinité avec toutes les armures ; une armure d'or refuse un cœur rancunier (sous −40 ; sous −70 pour les Gémeaux et le Cancer, qui connaissent la part d'ombre). Compte aussi dans les affinités entre personnages.
    - **Ton** (subtil, déconneur, taquin, franc, réservé, solennel, tendre) : façon de parler dans les scènes, et affinités.
    - **Complexes** (apparence, taille, origines, force, échec, parole) : −3 points aux épreuves par niveau tant que la confiance n'est pas revenue ; chaque jour, les amis bienveillants la font remonter.
14 ter. **Scènes de vie (demandées par Seba le 2026-10-27, `src/core/romance.js`, `src/core/data/lifescenes.js`)** :
    - Une scène au Sanctuaire toutes les 10 à 16 h (au lieu d'une par jour), qui attend sans pénalité.
    - 10 scènes à choix : regard (attirance), promenade (prendre la main), aveu (couple ou refus), tendresse, jalousie (couple + un tiers), dispute de couple, réconciliation, rivalité (course, duel), soutien d'un ami qui doute (confiance du complexe), farce.
    - Les répliques varient selon le **ton** de l'orateur (clés `t_<ton>`), puis ses qualités et défauts ; certains choix exigent un ton ou un cœur bienveillant.
    - Effets : attirance 0–10 (aveu possible à 6, chance d'acceptation selon l'attirance, l'entente et le cœur), couples, rivalités 0–10, amitié, cœur, confiance. Affichés dans Personnages › Relations (« Cœurs et rivalités ») et dans la rubrique Liens des fiches.
    - **Romances entre un homme et une femme adultes seulement** (choix de Seba), jamais avec un apprenti.
14 ter bis. **Feuilletons « façon Is it love » (demandés par Seba le 2026-10-27, `src/core/arcs.js`, `src/core/data/arcs.js`)** : de longues histoires en épisodes entre deux chevaliers, que Seba met en scène (il n'incarne pas de personnage).
    - Un épisode à la fois, le suivant 18 à 30 h plus tard ; deux feuilletons au plus en même temps ; un nouveau toutes les 30 à 48 h. Annoncés par un bandeau, dans « À faire » et dans Personnages › Relations › Feuilletons.
    - **Affection cachée** (aucun chiffre pendant l'histoire), **mémoire des choix** (drapeaux rappelés dans les épisodes suivants), **indices** pour l'enquête ; aiguillages invisibles (`branch`) ; un choix dont la condition de feuilleton manque est caché, pas grisé.
    - 3 feuilletons : « Ce que cachent les étoiles » (romance lente, 6 épisodes : pendentif brisé, forge, infirmerie, rumeurs, fête des moissons, aveu ; fin en couple, tendre amitié ou refus), « Les pages arrachées » (enquête, 5 épisodes, une seule fois : 7 indices, accuser juste ou non, vérité ou miséricorde), « Le sable de l'arène » (rivaux, 4 épisodes ; respect, couple si homme et femme, ou rivalité qui continue).
    - Seba veut de la profondeur, de la subtilité, de la délicatesse, de la drague et des enquêtes : à enrichir avec d'autres feuilletons.
    - **À faire ensuite (choix de Seba du 2026-10-27)** : défis physiques réels liés aux épreuves des chevaliers (VTT et course par import de fichier GPX, cordes à sauter, pompes, gainage sur l'honneur), niveau de départ « sportif » (course 10 km, VTT 50 km, 40 pompes, 2 min de gainage, 300 sauts), progressifs ; « rendre le joueur meilleur ». Et des mini-jeux dans plein de domaines, parfois pour le pur plaisir.
14 quater. **Mini-jeux, épreuves et collection (demandés par Seba le 2026-10-27)** : `src/core/data/minigames.js`, `src/core/minigames.js`, `src/core/epreuves.js`, `src/ui/minigames.js`, `src/ui/collection.js` ; Personnages › Épreuves et Personnages › Collection.
    - **6 mini-jeux de 20 niveaux** à difficulté croissante, puis finis ; chacun s'ouvre quand son armure a un porteur : Flèche (glisser jusqu'au premier obstacle, étoiles puis cible, coups limités ; vitesse, dextérité), Lyre (rejouer une mélodie ; cosmos, psychokinésie), Horloge (toucher les zones au passage de l'aiguille ; vitesse, dextérité), Burin (tailler un motif de mémoire ; dextérité, force), Fourneau (garder la chaleur dans la bande ; force, endurance), Caméléon (trouver la pierre différente ; dextérité, psychokinésie). Niveaux tirés d'une graine fixe ; la Flèche est vérifiée faisable par recherche.
    - Gains au premier succès d'un niveau : heures d'entraînement dans une **réserve à répartir** sur qui on veut (2 h + 0,5 h par niveau), et 1 point de chaque statistique du jeu pour le porteur. Au-delà de 4 niveaux réussis par jour (jour réel), les gains valent un quart.
    - **Épreuve de chaque constellation** : son mini-jeu, sinon 3 objectifs pour son porteur (niveau 30/45/60, compétences de l'armure 15/20/25, puis missions, ennemis vaincus en défense, amitié 6/10, ou maison au niveau 5 pour l'or).
    - **À 100 %** : bonus permanent pour tout le Sanctuaire (selon l'élément : forge/défense, énergie/vivres, XP/amitié, chantiers/réserves ; 2 % bronze, 4 % argent, 8 % or), carte dorée.
    - **Collection** : 88 cartes (grisées tant que l'armure n'a jamais eu de porteur), avancement, bonus gagnés, palmarès du porteur.
    - À venir : quêtes d'histoire écrites pour certains chevaliers, combats d'entraînement, autres mini-jeux (Seba a des idées).
15. **Gardes** : un apprenti qui a raté son épreuve ou qui est surpassé devient garde. Il est affecté à une maison, au village ou à un site, et sa valeur de défense comptera lors des attaques.
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
