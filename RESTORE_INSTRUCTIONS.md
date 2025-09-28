# Restauració ràpida des d'un SNAPSHOT

## 1) Trobar el codi del snapshot:
```bash
ls -1 _snapshots | tail -n 20
```

## 2) Restaurar fitxers client i server (sense node_modules):
```bash
SNAP="AAAAmmdd-HHMMSS"
rsync -a --delete _snapshots/$SNAP/src_client/ appnode2/client/
rsync -a --delete _snapshots/$SNAP/server/ .
```

## 3) Restaurar BD (si cal):
```bash
cp _snapshots/$SNAP/databases/database.sqlite ./database.sqlite
cp _snapshots/$SNAP/databases/client_database.sqlite appnode2/client/database.sqlite
```

## 4) Reinstal·lar i arrencar:
```bash
cd appnode2/client && rm -rf node_modules && npm install --force
npx vite --host 0.0.0.0 --port 5173 &
```

## 5) Si vols tornar exactament al codi del moment:
```bash
git checkout checkpoint/AAAAmmdd-HHMMSS
```

---
*Guia generada automàticament pel sistema de snapshots*