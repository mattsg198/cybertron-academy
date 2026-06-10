import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages project site is served under /<repo>/.
const base = '/cybertron-academy/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Cybertron Academy · 赛博坦英语学院',
        short_name: '赛博坦学院',
        description: '变形金刚主题 · 冲刺剑桥 KET 的英语闯关训练',
        lang: 'zh-CN',
        theme_color: '#0a0f2c',
        background_color: '#0a0f2c',
        display: 'standalone',
        orientation: 'landscape',
        start_url: base,
        scope: base,
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // precache the whole built app so it runs fully offline after first load
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: base + 'index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
})
