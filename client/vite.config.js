import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Configuració simplificada i robusta + Fix MIME type
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: { host: 'localhost', port: 5173 },
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    },
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  // Middleware crític per MIME type correcte (soluciona "disallowed MIME type")
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.match(/\.(js|mjs|jsx|ts|tsx)(\?.*)?$/)) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
      } else if (req.url?.match(/\.(css)(\?.*)?$/)) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8')
      }
      next()
    })
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  },
  optimizeDeps: { 
    force: true
  }
})
