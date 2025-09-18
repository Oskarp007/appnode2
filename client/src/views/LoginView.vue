<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <div class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
          <span class="text-white font-bold text-xl">GE</span>
        </div>
      </div>
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
        Gestió Escolar
      </h2>
      <p class="mt-2 text-center text-sm text-slate-600">
        Accedeix al teu compte
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="card">
        <div class="card-body space-y-6">
          <form @submit.prevent="login" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700">
                Correu electrònic
              </label>
              <div class="mt-1">
                <input 
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  autocomplete="email"
                  class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="el-teu-email@exemple.com"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-700">
                Contrasenya
              </label>
              <div class="mt-1">
                <input 
                  id="password"
                  v-model="form.password"
                  type="password"
                  required
                  autocomplete="current-password"
                  class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Introdueix la teva contrasenya"
                />
              </div>
            </div>

            <div>
              <button 
                type="submit"
                :disabled="isLoading"
                class="w-full btn-primary justify-center"
              >
                <div v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {{ isLoading ? 'Accedint...' : 'Iniciar sessió' }}
              </button>
            </div>
          </form>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-slate-500">o</span>
            </div>
          </div>

          <div>
            <button 
              @click="showRegisterModal = true"
              class="w-full btn-outline justify-center"
            >
              Registrar-se com a família
            </button>
          </div>
          
          <div v-if="error" class="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">
            {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de registre -->
    <RegisterFamiliaModal 
      :isVisible="showRegisterModal"
      @close="showRegisterModal = false"
      @registered="handleRegistered"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import RegisterFamiliaModal from '@/components/RegisterFamiliaModal.vue'

const auth = useAuthStore()
const router = useRouter()

const isLoading = ref(false)
const error = ref('')
const showRegisterModal = ref(false)

const form = reactive({
  email: '',
  password: '',
  tenant_slug: 'escola-demo' // Default tenant
})

async function login() {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    await auth.login({
      email: form.email,
      password: form.password,
      tenant_slug: form.tenant_slug
    })
    
    // Redirigir segons el rol
    const roleRoutes = {
      'SUPER_ADMIN': '/superadmin',
      'ADMIN': '/admin', 
      'COORDINADOR': '/coordinador',
      'MONITOR': '/monitor',
      'FAMILIA': '/familia'
    }
    
    const route = roleRoutes[auth.user.role] || '/admin'
    await router.push(route)
    
  } catch (err) {
    error.value = err.message || 'Error d\'autenticació'
  } finally {
    isLoading.value = false
  }
}

function handleRegistered(data) {
  showRegisterModal.value = false
  // Mostrar missatge d'èxit i preparar login automàtic
  error.value = ''
  // Podriem emplenar automàticament l'email al formulari
  if (data.user && data.user.email) {
    form.email = data.user.email
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-shake {
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translateX(-2px); }
  20%, 80% { transform: translateX(4px); }
  30%, 50%, 70% { transform: translateX(-8px); }
  40%, 60% { transform: translateX(8px); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>