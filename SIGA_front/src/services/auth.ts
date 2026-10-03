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

const API_URL = import.meta.env.VITE_API_URL ?? '/api'
const TOKEN_KEY = 'siga_token'
const USER_KEY = 'siga_usuario'

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('El correo o la contraseña son incorrectos.')
    }
    throw new Error('No fue posible conectar con el servidor.')
  }

  const data = (await response.json()) as LoginResponse
  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem(USER_KEY, JSON.stringify(data.usuario))
  return data
}

export function getStoredUser(): Usuario | null {
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
