<template>
  <div class="card">
    <div class="card-body">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-slate-900">Els meus fills</h3>
        <button @click="showAddModal = true" class="btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Afegir fill/a
        </button>
      </div>

      <!-- Llista de fills -->
      <div v-if="children.length === 0" class="text-center py-8">
        <div class="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <p class="text-slate-500 mb-2">Encara no has afegit cap fill/a</p>
        <p class="text-sm text-slate-400">Clica "Afegir fill/a" per començar a gestionar la informació dels teus fills</p>
      </div>

      <div v-else class="grid gap-4">
        <div 
          v-for="child in children" 
          :key="child.id" 
          class="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {{ child.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h4 class="font-medium text-slate-900">{{ child.name }} {{ child.surname || '' }}</h4>
              <p class="text-sm text-slate-600">{{ child.class_group || 'Sense classe assignada' }}</p>
              <p v-if="child.age" class="text-xs text-slate-500">{{ child.age }} anys</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="editChild(child)" 
              class="text-primary-600 hover:text-primary-700 text-sm font-medium px-3 py-1 rounded hover:bg-primary-50 transition-colors"
            >
              Editar
            </button>
            <button 
              @click="deleteChild(child)" 
              class="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal afegir/editar fill -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-md w-full mx-4">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold">{{ editingChild ? 'Editar fill/a' : 'Afegir fill/a' }}</h4>
              <button @click="closeModal" class="text-slate-400 hover:text-slate-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form @submit.prevent="saveChild" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                <input 
                  v-model="childForm.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nom del fill/a"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Cognoms</label>
                <input 
                  v-model="childForm.surname"
                  type="text"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Cognoms del fill/a"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Edat</label>
                  <input 
                    v-model="childForm.age"
                    type="number"
                    min="3"
                    max="18"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Edat"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Classe</label>
                  <select 
                    v-model="childForm.class_group"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Selecciona...</option>
                    <option value="P3">P3</option>
                    <option value="P4">P4</option>
                    <option value="P5">P5</option>
                    <option value="1r Primària">1r Primària</option>
                    <option value="2n Primària">2n Primària</option>
                    <option value="3r Primària">3r Primària</option>
                    <option value="4t Primària">4t Primària</option>
                    <option value="5è Primària">5è Primària</option>
                    <option value="6è Primària">6è Primària</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Data de naixement</label>
                <input 
                  v-model="childForm.birth_date"
                  type="date"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div class="flex gap-3 pt-4">
                <button 
                  type="button" 
                  @click="closeModal"
                  class="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel·lar
                </button>
                <button 
                  type="submit"
                  class="flex-1 btn-primary"
                  :disabled="!childForm.name || isLoading"
                >
                  {{ isLoading ? 'Guardant...' : (editingChild ? 'Actualitzar' : 'Afegir') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const children = ref([])
const showAddModal = ref(false)
const isLoading = ref(false)
const editingChild = ref(null)

const childForm = reactive({
  name: '',
  surname: '',
  age: null,
  class_group: '',
  birth_date: ''
})

// Carregar fills de la família
const loadChildren = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/family/students', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      children.value = data.data || []
    }
  } catch (error) {
    console.error('Error carregant fills:', error)
  }
}

// Obrir modal per editar
const editChild = (child) => {
  editingChild.value = child
  Object.assign(childForm, {
    name: child.name || '',
    surname: child.surname || '',
    age: child.age || null,
    class_group: child.class_group || '',
    birth_date: child.birth_date || ''
  })
  showAddModal.value = true
}

// Tancar modal
const closeModal = () => {
  showAddModal.value = false
  editingChild.value = null
  Object.assign(childForm, {
    name: '',
    surname: '',
    age: null,
    class_group: '',
    birth_date: ''
  })
}

// Guardar fill
const saveChild = async () => {
  isLoading.value = true
  
  try {
    // Aquí implementaríem la crida a l'API per guardar/actualitzar
    console.log('Guardant fill:', childForm)
    
    // Simulem una resposta exitosa
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Recarregar llista
    await loadChildren()
    
    closeModal()
    
  } catch (error) {
    console.error('Error guardant fill:', error)
  } finally {
    isLoading.value = false
  }
}

// Eliminar fill
const deleteChild = async (child) => {
  if (confirm(`Estàs segur que vols eliminar ${child.name}?`)) {
    try {
      console.log('Eliminant fill:', child.id)
      // Implementar eliminació
      await loadChildren()
    } catch (error) {
      console.error('Error eliminant fill:', error)
    }
  }
}

onMounted(() => {
  loadChildren()
})
</script>

<style scoped>
/* Estils específics si cal */
</style>