<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-slate-900">Registre família</h3>
          <button 
            @click="close"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="register" class="space-y-4">
          <!-- Nom complet -->
          <div>
            <label for="name" class="block text-sm font-medium text-slate-700">
              Nom complet mare/pare/tutor/a <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <input 
                id="name"
                v-model="form.name"
                type="text"
                required
                class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="El teu nom complet"
              />
            </div>
          </div>

          <!-- DNI/NIE/NIF -->
          <div>
            <label for="dni" class="block text-sm font-medium text-slate-700">
              DNI/NIE/NIF <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <input 
                id="dni"
                v-model="form.dni"
                type="text"
                required
                @input="validateDNI"
                class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="12345678Z / X1234567L"
              />
            </div>
            <div v-if="errors.dni" class="text-sm text-red-600 mt-1">{{ errors.dni }}</div>
          </div>

          <!-- Escola/Centre -->
          <div>
            <label for="school" class="block text-sm font-medium text-slate-700">
              Escola / Centre <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <select 
                id="school"
                v-model="form.school"
                required
                class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Selecciona el centre...</option>
                <option value="escola-europa">Escola Europa</option>
                <option value="collegi-maspujols">Col·legi Maspujols</option>
                <option value="ceip-sant-pere">CEIP Sant Pere</option>
                <option value="escola-montessori">Escola Montessori</option>
                <option value="collegi-internacional">Col·legi Internacional</option>
              </select>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700">
              Correu electrònic <span class="text-red-500">*</span>
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

          <!-- Contrasenya -->
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700">
              Contrasenya <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <input 
                id="password"
                v-model="form.password"
                type="password"
                required
                minlength="6"
                autocomplete="new-password"
                class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Mínim 6 caràcters"
              />
            </div>
            <p class="mt-1 text-xs text-slate-500">La contrasenya ha de tenir com a mínim 6 caràcters</p>
          </div>

          <!-- Confirmar contrasenya -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-slate-700">
              Confirmar contrasenya <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <input 
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                required
                autocomplete="new-password"
                @input="validatePasswordMatch"
                class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Repeteix la contrasenya"
              />
            </div>
            <div v-if="errors.passwordConfirm" class="text-sm text-red-600 mt-1">{{ errors.passwordConfirm }}</div>
          </div>

          <!-- Telèfon -->
          <div>
            <label for="phone" class="block text-sm font-medium text-slate-700">
              Telèfon de contacte <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <input 
                id="phone"
                v-model="form.phone"
                type="tel"
                required
                class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="600 123 456"
              />
            </div>
          </div>

          <!-- IBAN -->
          <div>
            <label for="iban" class="block text-sm font-medium text-slate-700">
              IBAN (opcional)
            </label>
            <div class="mt-1">
              <input 
                id="iban"
                v-model="form.iban"
                type="text"
                @input="validateIBAN"
                class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="ES91 2100 0418 4502 0005 1332"
              />
            </div>
            <div v-if="errors.iban" class="text-sm text-red-600 mt-1">{{ errors.iban }}</div>
            <p class="mt-1 text-xs text-slate-500">Per facilitar els pagaments dels serveis</p>
          </div>

          <!-- Termes i condicions -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input 
                id="terms"
                v-model="form.acceptTerms"
                type="checkbox"
                required
                class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-slate-300 rounded"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="terms" class="text-slate-700">
                Accepto els 
                <a href="#" class="text-primary-600 hover:text-primary-700">termes i condicions</a>
                i la 
                <a href="#" class="text-primary-600 hover:text-primary-700">política de privacitat</a>
                <span class="text-red-500">*</span>
              </label>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="error" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {{ error }}
          </div>

          <!-- Success message -->
          <div v-if="success" class="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            {{ success }}
          </div>

          <!-- Botons -->
          <div class="flex gap-3 pt-6">
            <button 
              type="button"
              @click="close"
              class="flex-1 btn-outline"
              :disabled="isLoading"
            >
              Cancel·lar
            </button>
            <button 
              type="submit"
              class="flex-1 btn-primary"
              :disabled="isLoading || !canSubmit"
            >
              <div v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {{ isLoading ? 'Registrant...' : 'Registrar-se' }}
            </button>
          </div>
        </form>

        <!-- Nota sobre fills -->
        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-medium text-blue-800 mb-1">Informació sobre els fills</h4>
              <p class="text-sm text-blue-700">
                Podràs afegir la informació dels teus fills després de completar el registre, des del teu dashboard personal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineEmits, defineProps, computed } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'registered'])

const isLoading = ref(false)
const error = ref('')
const success = ref('')
const errors = ref({})

const form = reactive({
  name: '',
  dni: '',
  school: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  iban: '',
  acceptTerms: false,
  tenant_slug: 'escola-demo' // Default tenant
})

// Computed per validar si es pot enviar el formulari
const canSubmit = computed(() => {
  return form.name && 
         form.dni && 
         form.school && 
         form.email && 
         form.password && 
         form.confirmPassword && 
         form.acceptTerms &&
         !errors.value.dni &&
         !errors.value.passwordConfirm &&
         !errors.value.iban
})

// Validar DNI/NIE
function validateDNI() {
  const dni = form.dni.toUpperCase().replace(/\s/g, '')
  const dniPattern = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/
  const niePattern = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/
  
  if (dni && !dniPattern.test(dni) && !niePattern.test(dni)) {
    errors.value.dni = 'Format DNI/NIE incorrecte'
  } else {
    delete errors.value.dni
  }
}

// Validar coincidència de contrasenyes
function validatePasswordMatch() {
  if (form.password !== form.confirmPassword) {
    errors.value.passwordConfirm = 'Les contrasenyes no coincideixen'
  } else {
    delete errors.value.passwordConfirm
  }
}

// Validar IBAN espanyol
function validateIBAN() {
  const iban = form.iban.replace(/\s/g, '')
  if (iban && !/^ES\d{2}[0-9]{20}$/.test(iban)) {
    errors.value.iban = 'Format IBAN espanyol incorrecte (ES + 22 dígits)'
  } else {
    delete errors.value.iban
  }
}

function close() {
  // Reset form
  Object.assign(form, {
    name: '',
    dni: '',
    school: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    iban: '',
    acceptTerms: false,
    tenant_slug: 'escola-demo'
  })
  
  error.value = ''
  success.value = ''
  errors.value = {}
  emit('close')
}

async function register() {
  if (isLoading.value) return
  
  console.log('🔵 INTENT REGISTRE - Iniciando función register')
  
  // Validacions finals
  if (form.password !== form.confirmPassword) {
    error.value = 'Les contrasenyes no coincideixen'
    return
  }
  
  if (form.password.length < 6) {
    error.value = 'La contrasenya ha de tenir com a mínim 6 caràcters'
    return
  }
  
  // Validació del telèfon
  if (!form.phone || form.phone.length < 9) {
    error.value = 'El telèfon és obligatori i ha de tenir mínim 9 dígits'
    return
  }
  
  isLoading.value = true
  error.value = ''
  success.value = ''
  
  const requestData = {
    name: form.name,
    dni: form.dni.toUpperCase().replace(/\s/g, ''),
    school: form.school,
    email: form.email,
    password: form.password,
    phone: form.phone,
    iban: form.iban.replace(/\s/g, '') || null,
    tenant_slug: form.tenant_slug
  }
  
  console.log('📝 DADES REGISTRE:', requestData)
  console.log('📡 URL destí:', '/api/auth/register-familia')
  
  try {
    console.log('🚀 Enviant petició fetch...')
    
    const response = await fetch('/api/auth/register-familia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    
    console.log('📊 Status resposta:', response.status)
    console.log('📋 Headers resposta:', Object.fromEntries(response.headers))
    console.log('✅ Response OK:', response.ok)
    
    // Llegir resposta com a text primer per debug
    const responseText = await response.text()
    console.log('📄 Raw response text:', responseText)
    
    let data
    try {
      data = JSON.parse(responseText)
      console.log('✅ JSON parseat correctament:', data)
    } catch (parseError) {
      console.error('❌ Error parsing JSON:', parseError)
      console.error('📄 Response text que ha fallat:', responseText)
      throw new Error('Resposta del servidor no és JSON vàlid')
    }
    
    if (!response.ok) {
      console.error('❌ Response NO OK:', data)
      throw new Error(data.message || 'Error en el registre')
    }
    
    console.log('🎉 REGISTRE EXITÓS!')
    success.value = 'Registre completat amb èxit! Ja pots iniciar sessió.'
    
    // Esperar 2 segons i tancar modal
    setTimeout(() => {
      emit('registered', data)
      close()
    }, 2000)
    
  } catch (err) {
    console.error('❌ ERROR COMPLET:', err)
    console.error('📍 Error stack:', err.stack)
    error.value = err.message || 'Error en el registre'
  } finally {
    isLoading.value = false
    console.log('🔄 isLoading = false, procés finalitzat')
  }
}
</script>

<style scoped>
/* Animacions pel modal */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>