// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Modo server: Todo es SSR por defecto
  // Las páginas con "export const prerender = true" serán estáticas
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});