# 🔄 PUNT DE RESTAURACIÓ - 28 SEPTEMBRE 2025

## 📍 Context Actual
**Data:** 28 de septiembre de 2025  
**Repositori:** Oskarp007/appnode2 (migrat correctament)  
**Branca:** feature/configuracions-sistema  
**Ubicació:** `/Users/oskarpujol/Desktop/nodeapp`  

## ✅ Estat Segur Confirmat
La migració de repositori està **100% completada** amb èxit:
- Origen: Oskarpp7/appnode → Destí: Oskarp007/appnode2
- 9 branques migrades
- 10 tags migrats  
- 470 objects transferits sense pèrdues
- Backups de seguretat creats
- Usuari Git: Oskarp007 (Oskarp7@gmail.com)

## ⚠️ ERRORS CONEGUTS I DOCUMENTATS

### 🚨 Confusió de Carpetes (CRÍTIC)
**PROBLEMA:** Confusió persistent entre dues carpetes client:
- ❌ `/Users/oskarpujol/Desktop/nodeapp/client` (INCORRECTA - causa errors)
- ✅ `/Users/oskarpujol/Desktop/nodeapp/appnode2/client` (CORRECTA - working)

**SÍMPTOMES:**
- Multiple terminals amb connexions perdudes (47+ restarts)
- Errors net::ERR_FAILED persistents
- Safari connectivity issues
- MIME type problems
- Vite server "running but not loading"

**SOLUCIÓ APLICADA:**
- Marcat `/client/DO_NOT_USE_THIS_FOLDER` per evitar confusió
- Lock de ruta a `/appnode2/client` en scripts
- Verificacions automàtiques de directori correcte

### 🛠️ Errors de Terminal
- Terminal shells constamment perdent connexió
- Parse error en .zshrc line 253: `builtin`
- Necessitat de reinicis freqüents

## 📋 Files amb Canvis Pendents
```
AM .DS_Store
A  .env
M  .gitignore
A  .vscode/extensions.json
A  .vscode/settings.json
A  RESTORE_INSTRUCTIONS.md
A  _logs/incident.log
A  _logs/no_repetir_errors.md
A  _snapshots/ (múltiples backups)
AM appnode2
A  client/.env
D  client/tailwind.config.js
M  client/vite.config.js
?? client/DO_NOT_USE_THIS_FOLDER
```

## 🎯 Pròxims Passos Segurs
1. **Sempre treballar desde:** `/Users/oskarpujol/Desktop/nodeapp/appnode2/client`
2. **Mai usar:** `/Users/oskarpujol/Desktop/nodeapp/client`
3. **Verificar path abans de qualsevol operació**
4. **Continuar amb script de reparacions Vite + Tailwind**

## 🔧 Script de Continuació
```bash
cd /Users/oskarpujol/Desktop/nodeapp/appnode2/client
# Continuar amb les reparacions de Vite + Tailwind
```

## 💾 Còpia de Seguretat
Aquest punt permet restaurar a:
- Repositori migrat correctament
- Errors de carpeta documentats i marcats
- Sistema de backups en funcionament
- Configuració Git correcta

**IMPORTANT:** Aquest és un punt segur per tornar si qualsevol operació futura falla.