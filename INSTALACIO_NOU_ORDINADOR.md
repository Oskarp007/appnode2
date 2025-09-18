# 🚀 GUIA MIGRACIÓ NOU ORDINADOR - Sistema Gestió Escolar

## ✅ ESTAT BACKUP ACTUAL:
- **Data**: 18 Setembre 2025
- **Estat**: Sistema 100% operacional verificat
- **Backup local**: ~/Desktop/backup-gestio-escolar-20250918-1413/ (221MB)
- **GitHub**: https://github.com/Oskarp007/appnode2 - Branch: feature/configuracions-sistema
- **Base dades**: backup_database_20250918.sql (14.8KB) inclòs

## 🔧 INSTAL·LACIÓ NOU ORDINADOR (10 minuts):

### 1. PREREQUISITS:
```bash
# Instal·lar Node.js (v18+)
# Visitar: https://nodejs.org/
node --version  # Verificar v18+
npm --version   # Verificar v8+

# Instal·lar Git
# Visitar: https://git-scm.com/
git --version   # Verificar instal·lació
```

### 2. CLONAR REPOSITORI:
```bash
# Anar a directori desitjat
cd ~/Desktop

# Clonar des de GitHub
git clone https://github.com/Oskarp007/appnode2.git
cd appnode2

# Canviar a branch correcte
git checkout feature/configuracions-sistema

# Verificar tots els fitxers presents
ls -la
# Ha de mostrar: server.js, package.json, client/, database.sqlite, etc.
```

### 3. INSTAL·LAR DEPENDÈNCIES:
```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 4. VERIFICAR BASE DADES:
```bash
# Verificar que database.sqlite existeix
ls -la database.sqlite

# Si no existeix, restaurar des de backup:
# sqlite3 database.sqlite < backup_database_20250918.sql
```

### 5. INICIAR SISTEMA:
```bash
# Terminal 1 - Backend
npm start
# Ha de mostrar: "✅ API listening on 3000"

# Terminal 2 - Frontend (nou terminal)
cd client
npm run dev
# Ha de mostrar: "Local: http://localhost:5173/"
```

### 6. TEST SISTEMA RESTAURAT:
```bash
# 1. Backend actiu
curl http://localhost:3000/health
# Resposta: HTTP 200 OK

# 2. Frontend actiu
curl -I http://localhost:5173
# Resposta: HTTP 200 OK

# 3. Test login (navegador)
# Obrir: http://localhost:5173
# Email: testfinal@backup.com
# Password: password123
# Centre: Escola Europa Demo
```

## ✅ VERIFICACIÓ MIGRACIÓ EXITOSA:

### Sistema funcionant si:
- ✅ Backend corre a http://localhost:3000
- ✅ Frontend corre a http://localhost:5173  
- ✅ Login/registre funcional
- ✅ Base dades amb usuaris de prova
- ✅ Selector escola visible al registre
- ✅ Errors 409 específics operatius

### Usuaris de prova per verificar:
- **testfinal@backup.com** / password123
- **anna.garcia@email.com** / familia123
- **pere.lopez@email.com** / familia123

## 🔧 TROUBLESHOOTING:

### Error "Port already in use":
```bash
# Matar processos en ports
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Error dependències:
```bash
# Netejar i reinstal·lar
rm -rf node_modules client/node_modules
npm install
cd client && npm install
```

### Error base de dades:
```bash
# Restaurar des de backup SQL
rm database.sqlite
sqlite3 database.sqlite < backup_database_20250918.sql
```

### Frontend blanc:
```bash
# Netejar cache Vite
cd client
rm -rf .vite dist
npm run dev
```

## 📊 TEMPS ESTIMAT MIGRACIÓ:
- **Descàrrega Node.js**: 3 minuts
- **Clone repositori**: 1 minut  
- **npm install**: 4 minuts
- **Tests verificació**: 2 minuts
- **TOTAL**: ~10 minuts

## 🎯 RESULTAT FINAL:
Al final hauràs de tenir el sistema complet funcionant idèntic a l'original amb:
- Tots els endpoints operatius
- Base de dades completa amb usuaris
- Frontend professional amb formularis
- Sistema multi-tenant funcional
- Autenticació JWT segura

**MIGRACIÓ 100% GARANTIDA** 🚀