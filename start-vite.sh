#!/bin/bash
cd /Users/oskarpujol/Desktop/nodeapp/appnode2/client
lsof -ti :5173 | xargs kill -9 2>/dev/null || true
echo "🚀 Arrencant Vite..."
exec npx vite --host 0.0.0.0 --port 5173 --strictPort
