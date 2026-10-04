import apiClient from './api/axios'
import axios from 'axios'

export type Rol = 'ADMINISTRADOR' | 'ENCARGADO' | 'BENEFICIARIO'

export interface Usuario {
  id: number
  email: string
  rol: Rol
}

export interface LoginResponse {
  token: string
  tipo: string
  expiraEn: number
  usuario: Usuario
}

const TOKEN_KEY = 'siga_token'
const USER_KEY = 'siga_usuario'

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const { data } = await apiClient.post<LoginResponse>('/v1/auth/login', { email, password })
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.usuario))
    return data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error('El correo o la contraseña son incorrectos.', { cause: error })
    }
    throw new Error('No fue posible conectar con el servidor.', { cause: error })
  }
}

export function getStoredUser(): Usuario | null {
  if (!localStorage.getItem(TOKEN_KEY)) {
    localStorage.removeItem(USER_KEY)
    return null
  }

  const storedUser = localStorage.getItem(USER_KEY)
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser) as Usuario
  } catch {
    clearSession()
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
