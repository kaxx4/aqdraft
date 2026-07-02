import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  build: {
    // The two entry chunks (index ~745kB, ParadoxRoot ~894kB) were large
    // partly because shared vendor libs were duplicated/inlined. Splitting
    // long-lived vendor code into its own chunks (a) shrinks the entry
    // chunks, (b) lets browsers cache vendor separately across deploys
    // (app code changes far more often than React/Supabase), and (c) keeps
    // the heavy paradox-only libs off the main path — they only load when
    // the lazy /paradox route does. Pure build-output change; no runtime
    // or design impact.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // React ecosystem — loaded everywhere, changes rarely.
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/') ||
            id.includes('react-router')
          ) return 'vendor-react'
          // framer-motion (v12 splits into motion-dom / motion-utils too).
          if (
            id.includes('framer-motion') ||
            id.includes('motion-dom') ||
            id.includes('motion-utils')
          ) return 'vendor-motion'
          if (id.includes('@supabase')) return 'vendor-supabase'
          // Paradox-only heavies — barcode/QR tickets, physics, svg paths.
          // Only the lazy ParadoxRoot imports these, so this chunk is only
          // fetched on /paradox.
          if (
            id.includes('@zxing') ||
            id.includes('jsbarcode') ||
            id.includes('matter-js') ||
            id.includes('poly-decomp') ||
            id.includes('qrcode') ||
            id.includes('svg-path-commander')
          ) return 'vendor-paradox-heavy'
        },
      },
    },
  },
})
