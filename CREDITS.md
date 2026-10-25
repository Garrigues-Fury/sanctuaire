# Crédits et licences

Tout ce qui est intégré au jeu est gratuit et sous licence libre. Chaque nouvel élément graphique ou sonore est ajouté ici avec sa source et sa licence.

## Code

| Élément | Rôle | Licence | Source |
|---|---|---|---|
| Phaser 4.2 | Moteur de jeu (carte animée, puis duel et sprites) | MIT | https://phaser.io |
| Vite 8 | Outil de construction du site | MIT | https://vite.dev |
| vite-plugin-pwa / Workbox | Appli installable et jeu hors ligne | MIT | https://vite-pwa-org.netlify.app |
| @vite-pwa/assets-generator | Génération des icônes PNG | MIT | https://github.com/vite-pwa/assets-generator |
| Vitest | Tests automatiques | MIT | https://vitest.dev |
| acorn, acorn-walk | Outil ponctuel de découpage du prototype | MIT | https://github.com/acornjs/acorn |
| three.js 0.179 | Affichage 3D du créateur de personnage | MIT | https://threejs.org |
| @pixiv/three-vrm 3.4 | Lecture des personnages 3D au format VRM (os, matériaux anime, physique des cheveux) | MIT | https://github.com/pixiv/three-vrm |

## Polices

| Police | Licence | Source |
|---|---|---|
| Marcellus SC (Brian J. Bonislawsky) | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Marcellus+SC, via @fontsource/marcellus-sc |
| Alegreya Sans (Juan Pablo del Peral, Huerta Tipográfica) | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Alegreya+Sans, via @fontsource/alegreya-sans |

## Sons

| Élément | Auteur | Licence | Source |
|---|---|---|---|
| Bruitages `public/audio/` : chantier, marteau1-3, pieces, carte, tour, porte, livre (pack « RPG Audio ») | Kenney Vleugels (Kenney.nl) | CC0 1.0, domaine public | https://kenney.nl/assets/rpg-audio |
| Bruitages `public/audio/` : toucher, ouvrir, fermer, valider, fabrique, echec (pack « Interface Sounds ») | Kenney Vleugels (Kenney.nl) | CC0 1.0, domaine public | https://kenney.nl/assets/interface-sounds |
| Ambiance (vent, cigales, grillons), cloches et carillons | synthétisés par le code du jeu (`src/audio/audio.js`) | propre au projet | — |

## Images

| Élément | Auteur | Licence |
|---|---|---|
| Icône de l'appli (`public/icon.svg`) et dérivés PNG | créée pour le projet | propre au projet |
| Vues du Sanctuaire (`public/img/sanctuaire/`) | générées par Seba avec ChatGPT (OpenAI), d'après `art/sanctuaire/` | les conditions d'OpenAI attribuent la propriété des images produites à l'utilisateur ; usage privé |
| Chevaliers d'or (`public/img/or/`) | générés par Seba avec ChatGPT (OpenAI), d'après `art/personnages/` | idem ; usage privé, ressemblance avec le canon assumée par Seba |
| Armures d'or en style anime (`public/img/armures/`) | générées par Seba (outil d'IA de son abonnement), d'après `docs/prompts-images.md` | images produites par l'utilisateur ; usage privé |
| Chevaliers et armures façon gacha, charte v3 (`public/img/gacha/`, `public/img/armures/armure-*`) | générés par Claude avec Gemini 3 Pro Image (Google), via l'API Mammouth AI sur l'abonnement de Seba, d'après `scripts/generate-images.mjs` | les conditions de Google et de Mammouth laissent l'usage des images produites à l'utilisateur ; usage privé |
| Personnages 3D de base (`public/models/vroid-f.vrm`, `vroid-m.vrm`), une femme et un homme créés avec VRoid Studio | publiés sur OpenGameArt (« VRoid Studio CC0 models », https://opengameart.org/content/vroid-studio-cc0-models) | CC0 1.0, domaine public |
| Armures 3D du créateur de personnage | construites par le code du jeu (`src/three/avatar3d.js`) | propre au projet |
| Portraits et carte | dessinés par le code du jeu (générateur procédural repris du prototype) | propre au projet |
| `docs/reference.jpeg` | image de référence fournie par Seba | usage privé, non diffusée dans le jeu |
