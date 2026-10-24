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
- **Sauvegarde locale**, avec export et import d'un code de sauvegarde. Le code du prototype doit pouvoir être importé : reprendre sa fonction `migrate()` (versions 1 à 6).
- **Temps réel** : le jeu progresse téléphone fermé et affiche un résumé d'absence au retour. Prévoir un mode test où le temps passe 60 fois plus vite.

## Structure du projet (v0.7, étape 1)

- `src/core/` : règles et données, sans affichage. `rules.js` reprend les formules du prototype telles quelles ; `migrate.js` reprend `migrate()` ; `save.js` gère la sauvegarde et le code (même encodage que le prototype, même clé `localStorage`). L'état `S` vit dans `state.js` et ne se réaffecte que par `setS()`.
- `src/map/` : carte animée en Phaser 4. Le décor fixe est dessiné en Canvas 2D (`background.js`) puis passé à Phaser ; les personnages sont redessinés à chaque image (`agents.js`, `map.js`).
- `src/ui/app.js` : interface HTML des onglets et fenêtres (reprise du prototype). Choix assumé : menus en HTML, scènes animées en Phaser.
- `tests/` : tests Vitest (`npm test`), dont la reprise des sauvegardes v1 à v6.
- Commandes : `npm run dev` (jeu en développement), `npm run build` (site dans `dist/`), `npm run icons` (icônes depuis `public/icon.svg`).
- Hébergement : `.github/workflows/deploy.yml` publie sur GitHub Pages à chaque envoi sur `main`.

## Refonte graphique « idle RPG » (demandée le 2026-10-24)

- **Personnages** : générateur vectoriel anime `src/art/character.js`. Les personnages restent infinis (choix de Seba), avec une apparence qui suit le pays, le sexe, le rang, la constellation et la faction. Les chevaliers adultes ont un look « sexy » de RPG mobile (taille marquée, ventre et cuisses nus, armures ajustées). **Les apprentis (8 à 16 ans) ne sont jamais sexualisés** : silhouette d'enfant, tunique sobre. La page `galerie.html` (développement seulement) montre un échantillon.
- **Charte v3, style « idol gacha » (demandée par Seba le 2026-10-24)** : personnages adultes beaux et sexy façon splash art de jeu gacha, **jamais de casque** (cheveux libres, un petit accessoire discret ou une boucle d'oreille). Images générées par l'API Mammouth (clé dans `.env.local`, jamais publiée) avec `node scripts/generate-images.mjs`, puis branchées par `node scripts/integrate-images.mjs` (webp dans `public/img/gacha/` et `public/img/armures/`, liste dans `src/core/data/art-list.js`). Chaque armure d'or est illustrée portée par une femme et par un homme, chaque armure d'argent et de bronze par élément. Un chevalier reçoit l'image de son armure et de son sexe s'il en est le premier porteur ; sinon, le générateur vectoriel (sans casque lui aussi) prend le relais.
- **Combat** : scène Phaser animée `src/battle/battle.js` (ruées, impacts, projectiles d'élément, garde, coup ultime avec encart, secousses, chiffres de dégâts). La logique reste dans `src/core/combat.js`.
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
2. **Ressources** : vivres, marbre, métal, savoir, herbes, plus des objets fabriqués (potion d'endurance, onguent, tisane, élixir, lingot, outils, matériel, ambroisie, huile sacrée).
3. **Carte animée du Sanctuaire**
   - Les villageois font la navette entre leur site et les réserves.
   - Forgerons et artisans travaillent sur place. Les apprentis s'entraînent dans l'arène et les maîtres les surveillent. Les gardes sont à leur poste.
   - Toucher un site ouvre sa gestion.
4. **Survivants au départ** : 1 chevalier d'or, 1 d'argent, 2 de bronze. Rôles possibles : Grand Pope (unique), Recruteur, Maître (3 apprentis), Intendant, Maître d'œuvre, ou entraînement personnel.
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
    - **Étape 2, programme d'entraînement** (`src/core/program.js`, livré le 2026-10-24) : le temps d'entraînement se répartit en 8 curseurs (physique, rapidité, dextérité, endurance, psychokinésie, cosmos, méditation, études). Chaque part fait monter sa statistique en continu ; la méditation recharge l'énergie (jusqu'à +80 %) et nourrit un peu le cosmos ; les études accélèrent l'XP (jusqu'à +60 %, plus pour un studieux). Séances ciblées à l'énergie pour les nouvelles statistiques.
    - **Dextérité** : précision (l'ennemi esquive moins) et coups précis à ×1,5 en combat ; atelier d'artisanat ; actions de mission (désarmer, ligoter). **Psychokinésie** : barrière qui amortit les coups (jusqu'à 20 %) et cosmos de départ plus haut ; herboristerie ; actions de mission (soulever le chariot, barrière autour d'un village). Les anciens personnages reçoivent dextérité = (force + vitesse) / 2 et psychokinésie = (cosmos + endurance) / 2.
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
