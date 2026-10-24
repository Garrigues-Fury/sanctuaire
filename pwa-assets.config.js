import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Génère les icônes PNG de l'appli à partir de public/icon.svg : npm run icons
export default defineConfig({
  preset: { ...minimal2023Preset, maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#16110f' } }, apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#16110f' } } },
  images: ['public/icon.svg']
});
