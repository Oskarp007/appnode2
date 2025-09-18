import { defineStore } from 'pinia'
import axios from 'axios'
import router from '@/router'

// Configurar axios base
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    tenant: JSON.parse(localStorage.getItem('tenant') || 'null'),
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userRole: (state) => state.user?.role,
    canAccess: (state) => (allowedRoles) => {
      if (!state.user) return false
      if (state.user.role === 'SUPER_ADMIN') return true
      return allowedRoles.includes(state.user.role)
    }
  },
  
  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      
      console.log('🔐 INTENTANT LOGIN:', credentials)
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Slug': 'escola-demo'
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            tenant_slug: 'escola-demo'
          })
        })
        
        const data = await response.json()
        console.log('📡 RESPOSTA LOGIN:', data)
        
        if (data.success && data.token && data.user) {
          this.token = data.token
          this.user = data.user
          this.tenant = data.tenant
          
          // Guardar al localStorage
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
          localStorage.setItem('tenant', JSON.stringify(this.tenant))
          
          console.log('✅ LOGIN EXITÓS - USUARI:', this.user)
          
          // REDIRECCIONAR AUTOMÀTICAMENT SEGONS ROL
          this.redirectUserByRole()
          
          return { success: true }
        } else {
          throw new Error(data.message || 'Login fallit')
        }
      } catch (error) {
        console.error('❌ ERROR LOGIN:', error)
        this.error = error.message || 'Error de connexió'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },
    
    // NOVA FUNCIÓ PER REDIRIGIR SEGONS ROL
    redirectUserByRole() {
      if (!this.user) {
        console.log('❌ NO HI HA USUARI PER REDIRECCIONAR')
        return
      }
      
      const roleRedirects = {
        'SUPER_ADMIN': '/superadmin',
        'ADMIN': '/admin',
        'COORDINADOR': '/coordinador', 
        'MONITOR': '/monitor',
        'FAMILIA': '/familia'
      }
      
      const redirectTo = roleRedirects[this.user.role]
      
      if (redirectTo) {
        console.log(`🎯 REDIRIGINT ${this.user.role} A:`, redirectTo)
        
        // Utilitzar setTimeout per assegurar que el DOM està actualitzat
        setTimeout(() => {
          router.push(redirectTo).then(() => {
            console.log('✅ REDIRECCIÓ COMPLETADA A:', redirectTo)
          }).catch((error) => {
            console.error('❌ ERROR EN REDIRECCIÓ:', error)
            // Si falla, forçar reload de la pàgina
            window.location.href = redirectTo
          })
        }, 100)
      } else {
        console.log('⚠️ ROL DESCONEGUT:', this.user.role)
        router.push('/unauthorized')
      }
    },
    
    initializeAuth() {
      console.log('🔄 Inicialitzant auth des localStorage...')
      
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      const tenantStr = localStorage.getItem('tenant')
      
      if (token && userStr) {
        try {
          this.token = token
          this.user = JSON.parse(userStr)
          this.tenant = tenantStr ? JSON.parse(tenantStr) : null
          
          console.log('✅ Auth inicialitzat:', {
            user: this.user?.name,
            role: this.user?.role,
            tenant: this.tenant?.name
          })
          
          return true
        } catch (error) {
          console.error('❌ Error parsejar dades localStorage:', error)
          this.logout()
          return false
        }
      }
      
      console.log('ℹ️ No hi ha dades d\'auth al localStorage')
      return false
    },
    
    logout() {
      this.user = null
      this.token = null
      this.tenant = null
      this.error = null
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('tenant')
      
      console.log('👋 Logout completat')
      router.push('/login')
    }
  }
})
