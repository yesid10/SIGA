import { GoogleAuthProvider, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
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
    case 'auth/user-not-found':
      return 'No existe una cuenta registrada con este correo.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'El correo o la contraseña son incorrectos. Verifica los datos o crea una cuenta.'
    case 'auth/invalid-email':
      return 'El correo electrónico no tiene un formato válido.'
    case 'auth/too-many-requests':
      return 'Hay demasiados intentos. Espera unos minutos e inténtalo nuevamente.'
    case 'auth/popup-closed-by-user':
      return 'El inicio de sesión con Google fue cancelado.'
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes e inténtalo nuevamente.'
    default:
      return error instanceof Error ? error.message : 'No fue posible autenticar la cuenta.'
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

export async function loginWithFirebase(email: string, password: string) {
  const auth = getFirebaseAuth()
  try {
    await signInWithEmailAndPassword(auth, email, password)
    return await exchangeToken()
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error), { cause: error })
  }
}

export async function loginWithGoogle() {
  const auth = getFirebaseAuth()
  try {
    await signInWithPopup(auth, new GoogleAuthProvider())
    return await exchangeToken()
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error), { cause: error })
  }
}

export async function registerWithFirebase(email: string, password: string) {
  const auth = getFirebaseAuth()
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await sendEmailVerification(credential.user)
  await signOut(auth)
}
