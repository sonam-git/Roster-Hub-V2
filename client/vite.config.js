import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'RH-Logo.png', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'RosterHub - Team Management',
        short_name: 'RosterHub',
        description: 'Where Players Connect & Understand Before The Game!',
        theme_color: '#3B82F6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['sports', 'productivity', 'social'],
        icons: [
          {
            src: 'RH-Logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'RH-Logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'RH-Logo.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ],
        shortcuts: [
          {
            name: 'New Game',
            short_name: 'New Game',
            description: 'Create a new game',
            url: '/game-schedule#create',
            icons: [{ src: 'RH-Logo.png', sizes: '192x192' }]
          },
          {
            name: 'Messages',
            short_name: 'Messages',
            description: 'View team messages',
            url: '/message',
            icons: [{ src: 'RH-Logo.png', sizes: '192x192' }]
          },
          {
            name: 'Team Roster',
            short_name: 'Roster',
            description: 'View team roster',
            url: '/roster',
            icons: [{ src: 'RH-Logo.png', sizes: '192x192' }]
          }
        ]
      }
    })
  ],
  build: {
    // Code splitting and optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'apollo-vendor': ['@apollo/client', 'graphql', 'graphql-ws'],
          'icons-vendor': ['react-icons', '@fortawesome/react-fontawesome', '@fortawesome/free-solid-svg-icons'],
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 600,
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@apollo/client'],
  },
  server: {
    port: 3000,
    proxy: {
      '/graphql': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
