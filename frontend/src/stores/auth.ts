import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'src/boot/axios'

interface User {
  id: string
  usuario: string
  name?: string
  empresaId: number
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(
    JSON.parse(localStorage.getItem('auth_user') || 'null')
  )

  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('auth_token', newToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  function setUser(newUser: User) {
    user.value = newUser
    localStorage.setItem('auth_user', JSON.stringify(newUser))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    delete api.defaults.headers.common['Authorization']
  }

  return { token, user, isAuthenticated, setToken, setUser, logout }
})
