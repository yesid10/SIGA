import { create } from 'zustand'
import { clearSession, getStoredUser, type Usuario } from '../services/auth'

type AuthState = {
  user: Usuario | null
  setUser: (user: Usuario) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  setUser: (user) => set({ user }),
  logout: () => {
    clearSession()
    set({ user: null })
  },
}))
