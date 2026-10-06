import apiClient from './api/axios'
import axios from 'axios'

export type Rol = 'ADMINISTRADOR' | 'ENCARGADO' | 'BENEFICIARIO'

export interface Usuario {
  id: number
  email: string
  nombre?: string | null
  rol: Rol
}

export interface RegisterRequest {
  nombre: string
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  tipo: string
  expiraEn: number
  usuario: Usuario
}

const TOKEN_KEY = 'siga_token'
const USER_KEY = 'siga_usuario'

const extraerMensajeError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object') {
      if ('mensaje' in data && typeof data.mensaje === 'string' && data.mensaje.length > 0) {
        if ('errores' in data && data.errores && typeof data.errores === 'object') {
          const primerError = Object.values(data.errores)[0]
          if (typeof primerError === 'string') {
            return `${data.mensaje}: ${primerError}`
          }
        }
        return data.mensaje
      }
    }
    if (error.response?.status === 401) {
      return 'El correo o la contraseña son incorrectos.'
    }
    if (error.response?.status === 409) {
      return 'Ya existe una cuenta con este correo electrónico.'
    }
  }
  return error instanceof Error ? error.message : fallback
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const { data } = await apiClient.post<LoginResponse>('/v1/auth/login', { email, password }, { skipAuth: true })
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.usuario))
    return data
  } catch (error) {
    throw new Error(extraerMensajeError(error, 'No fue posible conectar con el servidor.'), { cause: error })
  }
}

export const register = async (request: RegisterRequest): Promise<LoginResponse> => {
  try {
    const { data } = await apiClient.post<LoginResponse>('/v1/auth/register', request, { skipAuth: true })
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.usuario))
    return data
  } catch (error) {
    throw new Error(extraerMensajeError(error, 'No fue posible registrar la cuenta en el sistema.'), { cause: error })
  }
}

export const getStoredUser = (): Usuario | null => {
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

export const clearSession = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
