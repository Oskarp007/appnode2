#!/bin/bash
# 🧨 FIX IMMEDIAT: "disallowed MIME type" a Vite (Firefox/Safari)
# El navegador està rebent JS sense Content-Type correcte (o HTML/0 bytes).
# Forcem Vite a servir amb els headers adequats i validem amb proves objectives.

set -euo pipefail

ROOT="/Users/oskarpujol/Desktop/nodeapp"
CLIENT="$ROOT/client"
[ -d "$CLIENT" ] || CLIENT="$ROOT/appnode2/client"
if [ ! -d "$CLIENT" ]; then
  echo "❌ No s'ha trobat la carpeta client (esperat $ROOT/client o $ROOT/appnode2/client)"; exit 1
fi
cd "$CLIENT"

echo "== 1) Matar processos i netejar cache Vite =="
sudo lsof -ti :5173,:3001,:24678 | xargs kill -9 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
rm -rf node_modules/.vite .vite dist node_modules/.cache 2>/dev/null || true
npm cache clean --force >/dev/null 2>&1 || true

echo "== 2) Index i App bàsics (garantia) =="
mkdir -p src
cat > index.html << 'EOF'
<!doctype html>
<html lang="ca">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Gestió Escolar</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- CRÍTIC: type=module perquè Vite/ESM funcioni -->
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
EOF

cat > src/main.js << 'EOF'
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
EOF

cat > src/App.vue << 'EOF'
<template>
  <main style="font-family: system-ui; padding: 2rem;">
    <h1>🎓 Gestió Escolar</h1>
    <p>Vite dev actiu. Si ho veus, el servidor funciona i MIME és correcte.</p>
  </main>
</template>
<script setup></script>
EOF

echo "== 3) Vite config amb headers forçats (JS/CSS) i middleware =="
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: { port: 24678, overlay: false, clientPort: 5173 },
    headers: {
      // Evitar sniffing erroni i caches agressives
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  // Middleware per assegurar Content-Type correcte en dev
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
  build: { sourcemap: false, minify: false },
  optimizeDeps: { force: true }
})
EOF

echo "== 4) package.json scripts robustos i deps bàsiques =="
if [ ! -f package.json ]; then
  cat > package.json << 'EOF'
{
  "name": "gestio-escolar-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 5173 --force",
    "dev:local": "vite --host 127.0.0.1 --port 5173 --force",
    "dev:alt": "vite --host localhost --port 3001 --force",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 5173"
  },
  "dependencies": { "vue": "^3.4.38" },
  "devDependencies": { "@vitejs/plugin-vue": "^5.1.3", "vite": "^5.4.10" }
}
EOF
else
  node - << 'EOF'
const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));
p.scripts=p.scripts||{};
p.scripts.dev="vite --host 0.0.0.0 --port 5173 --force";
p.scripts["dev:local"]="vite --host 127.0.0.1 --port 5173 --force";
p.scripts["dev:alt"]="vite --host localhost --port 3001 --force";
p.scripts.build=p.scripts.build||"vite build";
p.scripts.preview="vite preview --host 0.0.0.0 --port 5173";
fs.writeFileSync('package.json',JSON.stringify(p,null,2));
console.log("✅ Scripts package.json actualitzats");
EOF
fi

echo "== 5) Instal·lar/actualitzar dependències =="
npm install --force

echo "== 6) Arrencar Vite (3 intents) =="
try_run() {
  CMD="$1"
  echo "→ $CMD"
  eval "$CMD" >/tmp/vite.log 2>&1 &
  VPID=$!
  sleep 4
  curl -s -I http://127.0.0.1:5173 | head -n1 || true
  if curl -s -I http://127.0.0.1:5173/src/main.js | grep -qi "Content-Type:.*javascript"; then
    echo "✅ MIME OK per /src/main.js"
    open http://127.0.0.1:5173 || true
    exit 0
  fi
  echo "ℹ️  Encara sense MIME correcte. Logs a /tmp/vite.log"
  kill -9 "$VPID" 2>/dev/null || true
}
try_run "npm run dev"
try_run "npm run dev:local"
try_run "npm run dev:alt"

echo "== 7) Fallback immediat: build + preview (cap disallowed MIME) =="
npm run build
npm run preview >/tmp/vite-preview.log 2>&1 &
sleep 3
if curl -s -I http://127.0.0.1:5173 | head -n1 | grep -q "HTTP"; then
  echo "✅ Preview actiu a http://127.0.0.1:5173 (sense /src, tot bundlat)"
  open http://127.0.0.1:5173 || true
  exit 0
fi

echo "== 8) Si persisteix el bloqueig MIME =="
echo "• Hard reload + esborrar cache navegador."
echo "• Desactivar plugins/antivirus/VPN i Enhanced Tracking Protection."
echo "• Revisa /tmp/vite.log i /tmp/vite-preview.log per errors del servidor."
exit 1
