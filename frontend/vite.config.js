import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'netSum',
        short_name: 'netSum',
        display: 'standalone',
        background_color: '#101214',
        theme_color: '#101214',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      // app shell only; API calls always go to the network
      workbox: { navigateFallbackDenylist: [/^\/api/] },
    }),
  ],
})
