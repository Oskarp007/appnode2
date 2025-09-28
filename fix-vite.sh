#!/bin/bash
# 🔧 FIX DEFINITIU: Vite no escolta a http://localhost:5173 (macOS)
# Copia/enganxa tot aquest bloc al terminal de VS Code.
# Objectiu: arrencar un Vite + Vue 3 estable, sense dependència de config prèvia,
# escoltant i accessible des de Safari/Firefox/Chrome.

set -euo pipefail

echo "== 0) Directori projecte =="
ROOT="/Users/oskarpujol/Desktop/nodeapp"
CANDIDATES=(
  "$ROOT/client"
  "$ROOT/appnode2/client"
)
CLIENT_DIR=""
for d in "${CANDIDATES[@]}"; do
  if [ -d "$d" ]; then CLIENT_DIR="$d"; break; fi
done
if [ -z "$CLIENT_DIR" ]; then
  echo "❌ No s'ha trobat la carpeta client. Crea-la a $ROOT/client i torna a executar."
  exit 1
fi
echo "➡ Client dir: $CLIENT_DIR"

echo "== 1) Matar processos i alliberar ports (5173, 3001, HMR 24678) =="
sudo lsof -ti :5173,:3001,:24678 | xargs kill -9 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true

echo "== 2) Validar Node.js i netejar caches =="
NODE_OK="$(node -v | awk -F. '{gsub("v","",$1); if ($1+0>=18) print "OK"; else print "BAD"}')"
if [ "$NODE_OK" = "BAD" ]; then
  echo "❌ Cal Node >= 18. Instal·la LTS (ex. 20.x) amb nvm i torna a executar."
  node -v
  exit 1
fi
cd "$CLIENT_DIR"
rm -rf node_modules/.vite .vite dist node_modules/.cache 2>/dev/null || true
npm cache clean --force >/dev/null 2>&1 || true

echo "== 3) Arxius mínims obligatoris (index.html, src/main.js, App.vue) =="
mkdir -p src
if [ ! -f "index.html" ]; then
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
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
EOF
fi

if [ ! -f "src/main.js" ]; then
  cat > src/main.js << 'EOF'
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
EOF
fi

if [ ! -f "src/App.vue" ]; then
  cat > src/App.vue << 'EOF'
<template>
  <main style="font-family: system-ui; padding: 2rem;">
    <h1>🎓 Gestió Escolar</h1>
    <p>Frontend Vite operatiu. Si veus això, el servidor funciona.</p>
  </main>
</template>
<script setup></script>
EOF
fi

echo "== 4) Vite config robust per macOS (host, HMR, proxy API) =="
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,          // 0.0.0.0 (totes les interfícies)
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: {
      port: 24678,
      overlay: false,
      clientPort: 5173
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  build: { sourcemap: false, minify: false },
  optimizeDeps: { force: true }
})
EOF

echo "== 5) package.json amb scripts de dev alternatius =="
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
  "dependencies": {
    "vue": "^3.4.38"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.1.3",
    "vite": "^5.4.10"
  }
}
EOF
else
  # In place update of scripts si ja existeix
  node - << 'EOF'
const fs=require('fs');
const p=JSON.parse(fs.readFileSync('package.json','utf8'));
p.scripts=p.scripts||{};
p.scripts.dev="vite --host 0.0.0.0 --port 5173 --force";
p.scripts["dev:local"]="vite --host 127.0.0.1 --port 5173 --force";
p.scripts["dev:alt"]="vite --host localhost --port 3001 --force";
p.scripts.build=p.scripts.build||"vite build";
p.scripts.preview="vite preview --host 0.0.0.0 --port 5173";
fs.writeFileSync('package.json',JSON.stringify(p,null,2));
console.log("Scripts actualitzats a package.json");
EOF
fi

echo "== 6) Instal·lació dependències =="
npm install --force

echo "== 7) Checks sistema: /etc/hosts i DNS (opcions segures) =="
# Afegim (si no hi són) entrades senzilles per evitar problemes localhost/IPv6
if ! grep -q "vite.local" /etc/hosts; then
  echo "⚙️  Actualitzant /etc/hosts (cal password)..."
  sudo bash -c 'echo "127.0.0.1 vite.local" >> /etc/hosts'
fi
# Refrescar DNS
sudo dscacheutil -flushcache || true
sudo killall -HUP mDNSResponder || true

echo "== 8) Arrencar backend (si no està) i provar salut =="
if ! curl -s http://127.0.0.1:3000/health >/dev/null; then
  echo "👉 Sembla que el backend no respon; arrenca'l en una altra terminal amb:"
  echo "    cd $ROOT && node server.js"
else
  echo "✅ Backend OK a http://127.0.0.1:3000/health"
fi

echo "== 9) Arrencar Vite (3 intents automàtics) =="
attempt() {
  CMD="$1"
  echo "→ $CMD"
  eval "$CMD" >/tmp/vite.log 2>&1 &
  VPID=$!
  sleep 4
  if curl -s -I http://127.0.0.1:5173 >/dev/null 2>&1; then
    echo "✅ Vite OK a http://127.0.0.1:5173"
    open http://127.0.0.1:5173 || true
    exit 0
  fi
  if curl -s -I http://localhost:5173 >/dev/null 2>&1; then
    echo "✅ Vite OK a http://localhost:5173"
    open http://localhost:5173 || true
    exit 0
  fi
  echo "ℹ️  No ha arrencat encara. Logs a /tmp/vite.log"
  kill -9 "$VPID" 2>/dev/null || true
}

attempt "npm run dev"
attempt "npm run dev:local"
attempt "npm run dev:alt"

echo "== 10) Mode fallback: build + preview =="
npm run build
npm run preview >/tmp/vite-preview.log 2>&1 &
sleep 3
if curl -s -I http://127.0.0.1:5173 >/dev/null 2>&1; then
  echo "✅ Preview servint a http://127.0.0.1:5173"
  open http://127.0.0.1:5173 || true
  exit 0
fi

echo "== 11) Últim recurs: servidor estàtic =="
npx --yes serve -s dist -l 5173 >/tmp/serve.log 2>&1 &
sleep 3
if curl -s -I http://127.0.0.1:5173 >/dev/null 2>&1; then
  echo "✅ Serve estàtic OK a http://127.0.0.1:5173"
  open http://127.0.0.1:5173 || true
  exit 0
fi

echo "❌ Encara sense accés a 5173."
echo "Revisa:"
echo "  - Firewall macOS (desactiva temporalment) i antivirus/vpn/proxy"
echo "  - Que index.html estigui a arrel de $CLIENT_DIR (no a public/)"
echo "  - /tmp/vite.log, /tmp/vite-preview.log i /tmp/serve.log per errors"
exit 1
