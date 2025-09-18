import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useFamilyStore = defineStore('family', () => {
  const dashboardData = ref(null)
  const fills = ref([])
  const isLoading = ref(false)
  const error = ref('')

  // Configurar axios amb token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Obtenir dades del dashboard
  const fetchDashboardData = async () => {
    try {
      isLoading.value = true
      error.value = ''
      
      const response = await axios.get('/api/family/dashboard', {
        headers: getAuthHeaders()
      })
      
      if (response.data.success) {
        dashboardData.value = response.data.data
        fills.value = response.data.data.fills || []
        console.log('✅ Dades dashboard familia carregades:', response.data.data)
      } else {
        throw new Error(response.data.message || 'Error carregant dashboard')
      }
      
    } catch (err) {
      console.error('❌ Error fetchDashboardData:', err)
      error.value = err.response?.data?.message || err.message || 'Error carregant dades'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Obtenir fills
  const fetchFills = async () => {
    try {
      isLoading.value = true
      error.value = ''
      
      const response = await axios.get('/api/family/students', {
        headers: getAuthHeaders()
      })
      
      if (response.data.success) {
        fills.value = response.data.data || []
        console.log('✅ Fills carregats:', fills.value.length)
      } else {
        throw new Error(response.data.message || 'Error carregant fills')
      }
      
    } catch (err) {
      console.error('❌ Error fetchFills:', err)
      error.value = err.response?.data?.message || err.message || 'Error carregant fills'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Enviar missatge
  const enviarMissatge = async (assumpte, missatge) => {
    try {
      isLoading.value = true
      error.value = ''
      
      const response = await axios.post('/api/family/message', {
        assumpte,
        missatge
      }, {
        headers: getAuthHeaders()
      })
      
      if (response.data.success) {
        console.log('✅ Missatge enviat correctament')
        return true
      } else {
        throw new Error(response.data.message || 'Error enviant missatge')
      }
      
    } catch (err) {
      console.error('❌ Error enviarMissatge:', err)
      error.value = err.response?.data?.message || err.message || 'Error enviant missatge'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    dashboardData,
    fills,
    isLoading,
    error,
    
    // Actions
    fetchDashboardData,
    fetchFills,
    enviarMissatge
  }
})