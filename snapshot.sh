#!/usr/bin/env bash
set -euo pipefail

# Script ràpid per crear snapshots
ROOT="/Users/oskarpujol/Desktop/nodeapp"
BACKUP_DIR="$ROOT/_snapshots"
TS="$(date +%Y%m%d-%H%M%S)"
SNAP="$BACKUP_DIR/$TS"

echo "📸 Creant snapshot $TS..."
mkdir -p "$SNAP"

cd "$ROOT"

# Git state
echo "🔄 Guardant estat git..."
git add -A >/dev/null 2>&1 || true
git status > "$SNAP/git_status.txt"
git rev-parse --abbrev-ref HEAD > "$SNAP/git_branch.txt" 2>/dev/null || echo "no-git" > "$SNAP/git_branch.txt"
git rev-parse HEAD > "$SNAP/git_commit.txt" 2>/dev/null || echo "no-commit" > "$SNAP/git_commit.txt"
git diff > "$SNAP/git_diff.patch" 2>/dev/null || true

# Databases
echo "💾 Copiant bases de dades..."
mkdir -p "$SNAP/databases"
[ -f "$ROOT/database.sqlite" ] && cp "$ROOT/database.sqlite" "$SNAP/databases/" || true
CLIENT="$ROOT/appnode2/client"
[ -f "$CLIENT/database.sqlite" ] && cp "$CLIENT/database.sqlite" "$SNAP/databases/client_database.sqlite" || true

# Source code (excluding heavy folders)
echo "📁 Copiant codi font..."
mkdir -p "$SNAP/src_client" "$SNAP/server"
rsync -a --exclude node_modules --exclude dist --exclude .vite "$CLIENT/" "$SNAP/src_client/"
rsync -a --exclude node_modules "$ROOT/controllers" "$ROOT/models" "$ROOT/routes" "$ROOT/config" "$SNAP/server/" 2>/dev/null || true

# Git checkpoint branch
echo "🌿 Creant branca checkpoint..."
SAFE_BRANCH="checkpoint/$TS"
git checkout -b "$SAFE_BRANCH" >/dev/null 2>&1 || git checkout "$SAFE_BRANCH" 2>/dev/null || true
git add -A && git commit -m "checkpoint: $TS (manual)" >/dev/null 2>&1 || true

echo "✅ Snapshot creat: $SNAP"
echo "✅ Branca git: $SAFE_BRANCH"
echo ""
echo "📋 Per restaurar: ./restore.sh $TS"