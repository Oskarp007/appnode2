<template>
  <div style="padding: 2rem; font-family: system-ui; min-height: 100vh; background-color: #f9fafb;">
    <h1 style="color: #2563eb; font-size: 2rem; margin-bottom: 1rem; text-align: center; font-weight: 700;">
      🎓 Gestió Escolar Vue
    </h1>
    <p style="color: #6b7280; text-align: center;">
      Vue.js funcionant correctament sense Tailwind
    </p>
    <div style="text-align: center; margin-top: 1rem;">
      <span style="background-color: #dcfce7; color: #166534; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem;">
        ✅ Vue.js carregat correctament
      </span>
    </div>
  </div>
</template>

<script setup>
console.log('✅ Vue App carregat!')
</script>
</script>

<style>
/* Tailwind classes inline per evitar dependencies CSS */
.min-h-screen { min-height: 100vh; }
.bg-gray-50 { background-color: #f9fafb; }
.text-3xl { font-size: 1.875rem; }
.font-bold { font-weight: 700; }
.p-8 { padding: 2rem; }
.text-center { text-align: center; }
.text-gray-600 { color: #6b7280; }
.mt-4 { margin-top: 1rem; }
.bg-green-100 { background-color: #dcfce7; }
.text-green-800 { color: #166534; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.rounded-full { border-radius: 9999px; }
.text-sm { font-size: 0.875rem; }
html, body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
</style>