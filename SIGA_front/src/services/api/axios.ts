import axios from 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('siga_token')
  if (token && !config.skipAuth) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('siga_token')
      localStorage.removeItem('siga_usuario')
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

export default apiClient
