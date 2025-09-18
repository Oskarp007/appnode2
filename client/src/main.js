import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

console.log('🚀 Iniciant app...')

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')

console.log('✅ App muntada correctament')

// Inicialitzar store auth després de muntar l'app
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
authStore.initializeAuth()

console.log('🔐 Store auth inicialitzat')
