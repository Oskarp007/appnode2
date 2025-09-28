import { createApp } from 'vue'
import App from './App.vue'

console.log('🚀 Iniciant aplicació Vue...')

const app = createApp(App)

app.mount('#app')

console.log('✅ Vue muntada correctament')