import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// base './' : le site marche quel que soit le dossier d'hébergement (GitHub Pages met le jeu dans /<nom-du-dépôt>/).
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 2000 },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
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
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico,jpg,webp}'],
        // Seules les polices latines servent ; inutile de stocker les alphabets cyrillique, grec, vietnamien.
        globIgnores: ['**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024
      }
    })
  ],
  test: { environment: 'node' }
});
