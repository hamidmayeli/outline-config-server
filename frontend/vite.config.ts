import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import istanbul from 'vite-plugin-istanbul';
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
    tsconfigPaths(),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules'],
      extension: [ '.js', '.ts', '.jsx', '.tsx',  ],
      requireEnv: !process.env.CYPRESS,
      checkProd: true,
    }),
    VitePWA({ 
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox:{
        skipWaiting: true,
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifestFilename: "manifest.json",
      manifest: {
        name: 'Outline Manager',
        short_name: 'OL Mngr',
        description: 'To manage Outline servers.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
     }),
  ],
})
