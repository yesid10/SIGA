import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import axios from 'axios'
import apiClient from '../api/axios'
import { getFirebaseAuth } from './firebase'
import type { LoginResponse } from '../../services/auth'

function getFirebaseErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const backendMessage = error.response?.data?.mensaje
    if (typeof backendMessage === 'string' && backendMessage.length > 0) return backendMessage
    if (!error.response) return 'No fue posible conectar con el backend.'
  }

  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : ''

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'El inicio de sesión con Google fue cancelado.'
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes e inténtalo nuevamente.'
    case 'auth/account-exists-with-different-credential':
      return 'Ya existe una cuenta asociada a este correo con otro método de inicio de sesión.'
    default:
      return error instanceof Error ? error.message : 'No fue posible autenticar con Google.'
  }
}

async function exchangeToken(): Promise<LoginResponse> {
  const auth = getFirebaseAuth()
  if (!auth.currentUser) throw new Error('No hay un usuario Firebase autenticado.')
  if (!auth.currentUser.emailVerified) throw new Error('Verifica tu correo antes de ingresar.')

  const idToken = await auth.currentUser.getIdToken()
  const { data } = await apiClient.post<LoginResponse>('/v1/auth/firebase', { idToken }, { skipAuth: true })
  localStorage.setItem('siga_token', data.token)
  localStorage.setItem('siga_usuario', JSON.stringify(data.usuario))
  return data
}

export async function loginWithGoogle(): Promise<LoginResponse> {
  const auth = getFirebaseAuth()
  try {
    await signInWithPopup(auth, new GoogleAuthProvider())
    return await exchangeToken()
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error), { cause: error })
  }
}
