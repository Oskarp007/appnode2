#!/usr/bin/env bash
# Script de restauració ràpida
# Ús: ./restore.sh AAAAMMDD-HHMMSS

set -euo pipefail

if [ $# -eq 0 ]; then
    echo "❌ Ús: ./restore.sh AAAAMMDD-HHMMSS"
    echo ""
    echo "📋 Snapshots disponibles:"
    ls -1 _snapshots 2>/dev/null | tail -n 10 | sed 's/^/  • /' || echo "  Cap snapshot trobat"
    exit 1
fi

SNAP="$1"
ROOT="/Users/oskarpujol/Desktop/nodeapp"
SNAP_DIR="$ROOT/_snapshots/$SNAP"

if [ ! -d "$SNAP_DIR" ]; then
    echo "❌ Snapshot '$SNAP' no existeix"
    echo "📋 Snapshots disponibles:"
    ls -1 "$ROOT/_snapshots" 2>/dev/null | tail -n 10 | sed 's/^/  • /' || echo "  Cap snapshot trobat"
    exit 1
fi

echo "🔄 Restaurant snapshot $SNAP..."

# Restore source code
echo "📁 Restaurant codi client..."
rsync -a --delete "$SNAP_DIR/src_client/" "$ROOT/appnode2/client/"

echo "📁 Restaurant codi server..."
rsync -a --delete "$SNAP_DIR/server/" "$ROOT/"

# Restore databases
echo "💾 Restaurant bases de dades..."
[ -f "$SNAP_DIR/databases/database.sqlite" ] && cp "$SNAP_DIR/databases/database.sqlite" "$ROOT/database.sqlite" && echo "  ✅ BD principal restaurada" || true
[ -f "$SNAP_DIR/databases/client_database.sqlite" ] && cp "$SNAP_DIR/databases/client_database.sqlite" "$ROOT/appnode2/client/database.sqlite" && echo "  ✅ BD client restaurada" || true

echo ""
echo "✅ Restaurat fitxers del snapshot $SNAP"
echo ""
echo "⚠️  RECORDATORI:"
echo "  1. Reinstal·lar dependències: cd appnode2/client && rm -rf node_modules && npm install --force"
echo "  2. Arrancar servidor: npx vite --host 0.0.0.0 --port 5173"
echo "  3. Si cal, tornar a la branca git: git checkout checkpoint/$SNAP"