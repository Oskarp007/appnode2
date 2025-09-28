# NO REPETIR ERRORS - Diari de Solucions

Aquest fitxer recull els errors més comuns i les seves solucions comprovades per evitar repetir els mateixos problemes.

## Registre d'Errors i Solucions

- 2025-09-27 20:58 | Vite no arrenca o no respon a 127.0.0.1:5173 | Solució: Forçar host 0.0.0.0 i strictPort a vite.config.js; matar processos i alliberar port 5173
- 2025-09-27 20:58 | 404 favicon.ico en Safari | Solució: Afegir public/favicon.ico i <link rel='icon' href='/favicon.ico'> a index.html
- 2025-09-27 20:58 | Tailwind IntelliSense bloqueja i dona falsos errors | Solució: Eliminar configs tailwind/postcss si no s'usen; desactivar extensió si cal
- 2025-09-27 20:58 | App.vue corromput duplica blocs | Solució: Recrear App.vue mínim i main.js; validar que index.html té <div id='app'> i script type='module'
- 2025-09-27 20:58 | node_modules ENOTEMPTY error durant npm install | Solució: sudo rm -rf node_modules package-lock.json && npm install --force
- 2025-09-27 20:58 | Servidor Vite no accessible per curl | Solució: Usar open_simple_browser per verificar, curl pot fallar per CORS locals
- 2025-09-27 20:58 | Pèrdua d'estat durant debugging excessiu | Solució: Sistema de snapshots amb git checkpoints i còpies BD

## Patrons d'Error Més Freqüents

1. **Problemes de xarxa local**: Sempre usar host 0.0.0.0 en lloc de localhost
2. **Fitxers corromputs**: Recrear des de zero abans que intentar arreglar
3. **Dependencies conflicts**: Eliminar node_modules completament i reinstal·lar
4. **Port blocking**: Matar tots els processos i alliberar ports abans d'arrancar

---
*Sistema automàtic de prevenció d'errors - Actualitzat: 2025-09-27*