import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), VitePWA({
    // injectRegister: 'auto',
    registerType: 'autoUpdate',
    pwaAssets: {
      disabled: false,
      config: false,
    },
    devOptions: {
      enabled: true,
    },
    manifest: {
      name: '24点小游戏',
      short_name: '经典小游戏之24点小游戏',
      description: '使用加减乘除四则运算计算出24即可获胜',
      theme_color: '#ffffff',
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },
  })],
  base: '/vite-vue3-game-24/',
})
