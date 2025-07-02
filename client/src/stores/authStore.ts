import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  authProvider: 'local' | 'google' | 'github'
  preferences: {
    theme: 'light' | 'dark' | 'system'
    difficultyLevel: 'easy' | 'medium' | 'hard'
    preferredTechStack: string
    notifications: {
      email: boolean
      practice: boolean
      weekly: boolean
    }
  }
  stats: {
    totalSessions: number
    totalTime: number
    averageScore: number
    lastActivity: string
  }
  emailVerified?: boolean
  createdAt?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  getCurrentUser: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  initializeAuth: () => Promise<void>
  clearError: () => void
}

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Login failed')
          }

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null
          })
          throw error
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ name, email, password })
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Signup failed')
          }

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Signup failed',
            isLoading: false,
            isAuthenticated: false,
            user: null
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        
        try {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
          })
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      getCurrentUser: async () => {
        set({ isLoading: true })
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            credentials: 'include'
          })

          if (response.ok) {
            const data = await response.json()
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
          }
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get()
        if (!user) throw new Error('No user logged in')

        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data)
          })

          const responseData = await response.json()

          if (!response.ok) {
            throw new Error(responseData.message || 'Profile update failed')
          }

          set({
            user: responseData.user,
            isLoading: false,
            error: null
          })

        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Profile update failed',
            isLoading: false
          })
          throw error
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true }); // Set isLoading to true at the start
        const { user, isAuthenticated } = get();
        
        if (isAuthenticated && user) {
          try {
            await get().getCurrentUser();
          } catch (error) {
            set({
              user: null,
              isAuthenticated: false,
              error: null,
            });
          } finally {
            set({ isLoading: false }); // Ensure isLoading is reset
          }
        } else {
          set({ isLoading: false }); // If not authenticated, just reset isLoading
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)