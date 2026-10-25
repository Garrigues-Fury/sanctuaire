import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const built = new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });

// base './' : le site marche quel que soit le dossier d'hébergement (GitHub Pages met le jeu dans /<nom-du-dépôt>/).
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 2000 },
  // Numéro de version affiché dans le jeu, pour savoir d'un coup d'œil si le téléphone est à jour.
  define: { __APP_VERSION__: JSON.stringify('v' + pkg.version + ' du ' + built) },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // l'enregistrement se fait dans main.js, avec une vérification à chaque retour dans l'appli
      includeAssets: ['favicon.ico', 'icon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Sanctuaire Renaissant',
        short_name: 'Sanctuaire',
        description: 'Relevez le Sanctuaire d’Athéna, formez les futurs chevaliers.',
        lang: 'fr',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#16110f',
        theme_color: '#16110f',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico,jpg,webp,ogg}'],
        // Seules les polices latines servent ; inutile de stocker les alphabets cyrillique, grec, vietnamien.
        globIgnores: ['**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // La nouvelle version prend la main tout de suite, sans attendre que l'appli soit complètement fermée.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Personnages 3D (16 à 18 Mo chacun) : téléchargés seulement quand on ouvre le créateur, puis gardés hors ligne.
        runtimeCaching: [{ urlPattern: /\/models\/.*\.vrm$/, handler: 'CacheFirst', options: { cacheName: 'modeles-3d', expiration: { maxEntries: 6 } } }]
      }
    })
  ],
  // les simulations longues (30 jours de jeu, parties complètes) dépassent 5 s quand l'ordinateur est chargé
  test: { environment: 'node', testTimeout: 30000 }
});
