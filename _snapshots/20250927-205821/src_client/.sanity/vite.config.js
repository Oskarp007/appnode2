import { defineConfig } from 'vite'
export default defineConfig({
  root: '.',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: { port: 24678, overlay: false, clientPort: 5173 }
  }
})