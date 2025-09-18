<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
    <div class="max-w-md mx-auto">
      <!-- Logo/Títol -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">🎓 Gestió Escolar</h1>
        <p class="text-gray-600">Plataforma de gestió de serveis escolars</p>
      </div>

      <!-- Card principal -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <!-- Toggle Login/Registre -->
        <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button 
            @click="switchTab(true)" 
            :class="isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'"
            class="flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200"
          >
            Iniciar Sessió
          </button>
          <button 
            @click="switchTab(false)" 
            :class="!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'"
            class="flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200"
          >
            Registrar-se
          </button>
        </div>

        <!-- FORMULARI LOGIN -->
        <form v-if="isLogin && !loading" @submit.prevent="handleLogin">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Benvingut/da!</h2>
          
          <div class="space-y-4">
            <input 
              v-model="loginForm.email" 
              placeholder="Correu electrònic" 
              type="email" 
              required 
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            
            <input 
              v-model="loginForm.password" 
              placeholder="Contrasenya" 
              type="password" 
              required 
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            
            <select 
              v-model="loginForm.tenant_slug" 
              required 
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Selecciona el teu centre</option>
              <option 
                v-for="school in availableSchools.filter(s => s.active)" 
                :key="school.slug" 
                :value="school.slug"
              >
                {{ school.name }}
              </option>
            </select>
          </div>
          
          <button 
            type="submit" 
            class="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Iniciar Sessió
          </button>
        </form>

        <!-- FORMULARI REGISTRE -->
        <form v-if="!isLogin && !loading" @submit.prevent="handleRegister">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Crear Compte</h2>
          
          <div class="space-y-4">
            <input 
              v-model="registerForm.name" 
              placeholder="Nom complet mare/pare/tutor/a" 
              required 
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            
            <input 
              v-model="registerForm.dni" 
              placeholder="DNI/NIE/NIF" 
              required 
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            
            <!-- SELECTOR ESCOLA - CRÍTIC MULTI-TENANT -->
            <select 
              v-model="registerForm.school" 
              required 
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">🏫 Selecciona la teva escola/centre</option>
              <option value="escola-europa">🇪🇺 Escola Europa</option>
              <option value="ceip-la-pau">🕊️ CEIP La Pau</option>
              <option value="institut-maspujols">🏛️ Institut Mas Pujols</option>
              <option value="escola-sant-jordi">🐉 Escola Sant Jordi</option>
              <option value="escola-montessori">🌱 Escola Montessori</option>
            </select>
            
            <input 
              v-model="registerForm.email" 
              placeholder="Correu electrònic" 
              type="email" 
              required 
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            
            <input 
              v-model="registerForm.password" 
              placeholder="Contrasenya (mínim 6 caràcters)" 
              type="password" 
              required 
              minlength="6"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            
            <input 
              v-model="registerForm.phone" 
              placeholder="Telèfon de contacte" 
              required 
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            
            <input 
              v-model="registerForm.iban" 
              placeholder="IBAN (opcional)" 
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
          
          <button 
            type="submit" 
            class="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Crear Compte
          </button>
        </form>

        <!-- LOADING STATE -->
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p class="mt-4 text-gray-600">{{ isLogin ? 'Iniciant sessió...' : 'Creant compte...' }}</p>
          <button 
            @click="cancelAction" 
            class="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Cancel·lar
          </button>
        </div>

        <!-- MISSATGES -->
        <div v-if="message" class="mt-6 p-4 rounded-md" :class="success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg v-if="success" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="ml-3">
              <p :class="success ? 'text-green-800' : 'text-red-800'" class="font-medium">{{ message }}</p>
              
              <!-- Botons específics per error 409 -->
              <div v-if="!success" class="mt-3 space-x-2">
                <button 
                  v-if="showSwitchToLogin" 
                  @click="switchToLoginFromError" 
                  class="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Anar al Login
                </button>
                <button 
                  @click="retryAction" 
                  class="text-sm bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Corregir dades
                </button>
              </div>
              
              <!-- Botó per registre exitós -->
              <button 
                v-if="success && !isLogin" 
                @click="switchToLogin" 
                class="mt-2 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
              >
                Iniciar Sessió
              </button>
            </div>
          </div>
        </div>

        <!-- Peu de pàgina -->
        <div class="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>Sistema de Gestió Escolar</p>
          <p>Menjadors - Acollides - Activitats - Comunicació</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Estado principal
const isLogin = ref(true) // Començar amb LOGIN per defecte
const loading = ref(false)
const message = ref('')
const success = ref(false)
const showSwitchToLogin = ref(false)
let timeoutId = null

// Formularis
const loginForm = ref({
  email: '',
  password: '',
  tenant_slug: 'escola-demo' // Per defecte
})

const registerForm = ref({
  name: '',
  dni: '',
  school: '', // ← CAMP ESCOLA ESSENCIAL RESTAURAT
  email: '',
  password: '',
  phone: '',
  iban: '',
  tenant_slug: 'escola-demo' // Per defecte
})

// Escoles disponibles
const availableSchools = ref([
  { slug: 'escola-demo', name: 'Escola Europa Demo', active: true },
  { slug: 'escola-bcn', name: 'Escola Barcelona', active: false },
  { slug: 'escola-girona', name: 'Escola Girona', active: false }
])

// LOGIN
async function handleLogin() {
  if (loading.value) return
  
  loading.value = true
  message.value = ''
  success.value = false
  
  timeoutId = setTimeout(() => {
    if (loading.value) {
      loading.value = false
      message.value = 'Temps d\'espera esgotat. Comprova la connexió.'
      success.value = false
    }
  }, 15000)
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...loginForm.value,
        tenant_slug: 'escola-demo'
      })
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.token && data.user) {
      success.value = true
      message.value = `Benvingut/da ${data.user.name}! Redirigint al dashboard...`
      
      // Guardar token i user (localStorage o Pinia store)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Redirigir després de 2s
      setTimeout(() => {
        // Aquí pots fer redirect al dashboard segons el rol
        if (data.user.role === 'FAMILIA') {
          window.location.href = '/familia'
        } else {
          window.location.href = '/dashboard'
        }
      }, 2000)
      
    } else {
      throw new Error(data.message || 'Credencials incorrectes')
    }
    
  } catch (error) {
    success.value = false
    message.value = error.message || 'Error d\'autenticació'
  } finally {
    clearTimeout(timeoutId)
    loading.value = false
  }
}

// REGISTRE (mantenir funcionalitat existent)
async function handleRegister() {
  if (loading.value) return
  
  loading.value = true
  message.value = ''
  success.value = false
  
  timeoutId = setTimeout(() => {
    if (loading.value) {
      loading.value = false
      message.value = 'Temps d\'espera esgotat. Comprova la connexió.'
      success.value = false
    }
  }, 15000)
  
  try {
    const response = await fetch('/api/auth/register-familia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...registerForm.value,
        school: 'escola-europa',
        tenant_slug: 'escola-demo'
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      success.value = true
      message.value = 'Compte creat amb èxit! Ja pots iniciar sessió amb les teves credencials.'
      // Netejar formulari
      registerForm.value = { name: '', dni: '', school: '', email: '', password: '', phone: '', iban: '', tenant_slug: 'escola-demo' }
      
    } else if (response.status === 409) {
      // ERROR 409 - Dades duplicades
      success.value = false
      
      if (data.field === 'email') {
        message.value = `${data.message} Si ja tens compte, canvia al Login.`
        showSwitchToLogin.value = true
      } else if (data.field === 'dni') {
        message.value = `${data.message} Comprova el DNI o canvia al Login si ja tens compte.`
        showSwitchToLogin.value = true
      } else {
        message.value = data.message || 'Algunes dades ja existeixen. Revisa la informació.'
      }
      
    } else {
      throw new Error(data.message || `Error ${response.status}`)
    }
    
  } catch (error) {
    success.value = false
    message.value = error.message || 'Error de connexió'
  } finally {
    clearTimeout(timeoutId)
    loading.value = false
  }
}

// UTILITATS
function switchTab(toLogin) {
  isLogin.value = toLogin
  message.value = ''
  success.value = false
  showSwitchToLogin.value = false
}

function cancelAction() {
  clearTimeout(timeoutId)
  loading.value = false
  message.value = 'Acció cancel·lada'
  success.value = false
}

function retryAction() {
  message.value = ''
  showSwitchToLogin.value = false
  if (isLogin.value) {
    handleLogin()
  } else {
    handleRegister()
  }
}

function switchToLogin() {
  isLogin.value = true
  message.value = ''
  success.value = false
  showSwitchToLogin.value = false
  // Pre-emplenar email si s'ha registrat
  if (registerForm.value.email) {
    loginForm.value.email = registerForm.value.email
  }
}

function switchToLoginFromError() {
  isLogin.value = true
  message.value = ''
  success.value = false
  showSwitchToLogin.value = false
  // Pre-emplenar email si s'ha intentat registrar
  if (registerForm.value.email) {
    loginForm.value.email = registerForm.value.email
  }
}
</script>



