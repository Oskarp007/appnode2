<template>
  <div id="app" class="wrap">
    <h1>🎓 Gestió Escolar</h1>
    <p>Vue 3 + Vite funcionant sense Tailwind</p>
    <button @click="clicked = !clicked" class="btn">🧪 Prova Vue</button>
    <p v-if="clicked">✅ Vue reacciona correctament</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const clicked = ref(false)
console.log('✅ App.vue carregada')
</script>

<style scoped>
.wrap{min-height:100vh;display:flex;gap:1rem;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui}
h1{color:#2563eb}
.btn{background:#2563eb;color:#fff;border:0;border-radius:8px;padding:.8rem 1.4rem;cursor:pointer}
.btn:hover{background:#1d4ed8}
</style>
