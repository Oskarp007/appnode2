<template>
  <ModernLayoutNew>
    <template #title>
      <div class="flex items-center gap-3">
        <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white">FA</span>
        <div>
          <h1 class="text-xl font-bold">Família</h1>
          <p class="text-sm text-slate-500">{{ dashboardData?.user?.name || 'Els meus fills' }}</p>
        </div>
      </div>
    </template>

    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-600">{{ error }}</p>
      <button @click="loadDashboard" class="mt-2 btn-primary text-sm">Tornar a carregar</button>
    </div>

    <div v-else>
      <!-- Gestió de fills -->
      <section class="mt-6">
        <GestioFills />
      </section>
      
      <!-- Els meus fills -->
      <section v-if="dashboardData?.fills?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div 
          v-for="fill in dashboardData.fills" 
          :key="fill.id"
          class="card bg-gradient-to-r from-blue-500 to-blue-600 text-white"
        >
          <div class="card-body">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span class="text-xl font-bold">
                  {{ fill.name?.charAt(0) }}{{ fill.surname?.charAt(0) }}
                </span>
              </div>
              <div>
                <h3 class="text-lg font-semibold">{{ fill.full_name }}</h3>
                <p class="text-blue-100">{{ fill.class_group || 'Sense classe' }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span class="text-sm">Present avui</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div v-else class="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p class="text-amber-600">No tens fills registrats al sistema.</p>
      </div>

      <!-- Resum mensual -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div class="card"><div class="card-body">
          <p class="text-sm text-slate-500">Dies Aquest Mes</p>
          <p class="text-3xl font-bold text-green-600">{{ dashboardData?.summary?.days || 0 }}</p>
          <p class="text-sm text-green-600 mt-1">Excel·lent</p>
        </div></div>
        <div class="card"><div class="card-body">
          <p class="text-sm text-slate-500">Activitats</p>
          <p class="text-3xl font-bold text-blue-600">{{ dashboardData?.summary?.activities || 0 }}</p>
          <p class="text-sm text-blue-600 mt-1">Ambdós fills</p>
        </div></div>
        <div class="card"><div class="card-body">
          <p class="text-sm text-slate-500">Pagament Pendent</p>
          <p class="text-3xl font-bold text-amber-600">€{{ dashboardData?.summary?.pending?.toFixed(2) || '0.00' }}</p>
          <p class="text-sm text-amber-600 mt-1">Setembre 2025</p>
        </div></div>
        <div class="card"><div class="card-body">
          <p class="text-sm text-slate-500">Missatges</p>
          <p class="text-3xl font-bold text-purple-600">{{ dashboardData?.summary?.messages || 0 }}</p>
          <p class="text-sm text-purple-600 mt-1">Nous del centre</p>
        </div></div>
      </section>

      <!-- Activitats i comunicacions -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div class="card"><div class="card-body">
          <h3 class="text-lg font-semibold mb-4">Activitats Aquesta Setmana</h3>
          <div class="space-y-3">
            <div 
              v-for="activitat in dashboardData?.activitats || []" 
              :key="`${activitat.student_id}-${activitat.activity_name}`"
              class="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-semibold text-sm">{{ activitat.student_name }} - {{ activitat.activity_name }}</h4>
                  <p class="text-xs text-slate-600">{{ activitat.day }} {{ activitat.time }}</p>
                  <p class="text-xs text-blue-600">Monitor: {{ activitat.monitor }}</p>
                </div>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{{ activitat.status === 'present' ? 'Present' : 'Absent' }}</span>
              </div>
            </div>
            
            <div v-if="!dashboardData?.activitats?.length" class="text-sm text-slate-500 text-center py-4">
              No hi ha activitats programades
            </div>
          </div>
        </div></div>

        <div class="card"><div class="card-body">
          <h3 class="text-lg font-semibold mb-4">Comunicacions</h3>
          <div class="space-y-3">
            <div 
              v-for="comunicacio in dashboardData?.comunicacions || []" 
              :key="comunicacio.id"
              class="p-3 rounded-lg border-l-4"
              :class="{
                'bg-purple-50 border-purple-400': comunicacio.type === 'reunio',
                'bg-amber-50 border-amber-400': comunicacio.type === 'pagament'
              }"
            >
              <h4 class="font-semibold text-sm">{{ comunicacio.title }}</h4>
              <p class="text-xs text-slate-600 mt-1">{{ comunicacio.message }}</p>
              <button 
                class="text-xs font-medium mt-2"
                :class="{
                  'text-purple-600': comunicacio.type === 'reunio',
                  'text-amber-600': comunicacio.type === 'pagament'
                }"
                @click="handleComunicacioAction(comunicacio)"
              >
                {{ comunicacio.pending_action }}
              </button>
            </div>
            
            <div v-if="!dashboardData?.comunicacions?.length" class="text-sm text-slate-500 text-center py-4">
              No hi ha comunicacions pendents
            </div>
          </div>
          <button @click="showMessageModal = true" class="w-full mt-4 btn-primary text-sm">
            Enviar Missatge
          </button>
        </div></div>
      </section>

      <!-- Historial pagaments -->
      <section class="card mt-6"><div class="card-body">
        <h3 class="text-lg font-semibold mb-4">Historial Pagaments</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-2 px-3 text-sm">Mes</th>
                <th class="text-left py-2 px-3 text-sm">Import</th>
                <th class="text-left py-2 px-3 text-sm">Estat</th>
                <th class="text-left py-2 px-3 text-sm">Data</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="pagament in dashboardData?.pagaments || []" 
                :key="pagament.id"
                class="border-b border-slate-100"
              >
                <td class="py-2 px-3 text-sm">{{ pagament.mes }}</td>
                <td class="py-2 px-3 text-sm font-medium">€{{ pagament.import?.toFixed(2) }}</td>
                <td class="py-2 px-3">
                  <span 
                    class="text-xs px-2 py-1 rounded-full"
                    :class="{
                      'bg-amber-100 text-amber-800': pagament.estat === 'pendent',
                      'bg-green-100 text-green-800': pagament.estat === 'pagat'
                    }"
                  >
                    {{ pagament.estat === 'pendent' ? 'Pendent' : 'Pagat' }}
                  </span>
                </td>
                <td class="py-2 px-3 text-sm text-slate-500">
                  {{ pagament.data_pagament || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div></section>
    </div>

    <!-- Modal per enviar missatge -->
    <div v-if="showMessageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold">Enviar Missatge</h3>
            <button @click="showMessageModal = false" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="enviarMissatge">
            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-700 mb-2">Assumpte</label>
              <input 
                v-model="messageForm.assumpte"
                type="text"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Assumpte del missatge"
              />
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-700 mb-2">Missatge</label>
              <textarea 
                v-model="messageForm.missatge"
                required
                rows="4"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Escriu el teu missatge aquí..."
              ></textarea>
            </div>
            
            <div class="flex gap-3">
              <button 
                type="button" 
                @click="showMessageModal = false"
                class="flex-1 btn-outline"
              >
                Cancel·lar
              </button>
              <button 
                type="submit"
                class="flex-1 btn-primary"
                :disabled="isLoadingMessage"
              >
                {{ isLoadingMessage ? 'Enviant...' : 'Enviar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </ModernLayoutNew>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import ModernLayoutNew from '@/components/layout/ModernLayoutNew.vue'
import GestioFills from '@/components/familia/GestioFills.vue'
import { useFamilyStore } from '@/stores/family'

const familyStore = useFamilyStore()
const { dashboardData, isLoading, error } = storeToRefs(familyStore)

const showMessageModal = ref(false)
const isLoadingMessage = ref(false)

const messageForm = reactive({
  assumpte: '',
  missatge: ''
})

// Carregar dades del dashboard
const loadDashboard = async () => {
  try {
    await familyStore.fetchDashboardData()
  } catch (err) {
    console.error('Error carregant dashboard:', err)
  }
}

// Manejar accions de comunicació
const handleComunicacioAction = (comunicacio) => {
  if (comunicacio.type === 'reunio') {
    alert('Funcionalitat de confirmació de reunió en desenvolupament')
  } else if (comunicacio.type === 'pagament') {
    alert('Funcionalitat de pagament en desenvolupament')
  }
}

// Enviar missatge
const enviarMissatge = async () => {
  if (!messageForm.assumpte || !messageForm.missatge) return
  
  try {
    isLoadingMessage.value = true
    await familyStore.enviarMissatge(messageForm.assumpte, messageForm.missatge)
    
    // Resetar formulari i tancar modal
    messageForm.assumpte = ''
    messageForm.missatge = ''
    showMessageModal.value = false
    
    alert('Missatge enviat correctament!')
    
  } catch (err) {
    alert('Error enviant missatge: ' + err.message)
  } finally {
    isLoadingMessage.value = false
  }
}

// Carregar dades a l'iniciar
onMounted(() => {
  loadDashboard()
})
</script>