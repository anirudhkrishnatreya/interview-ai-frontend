import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

const authApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const { user, refreshToken, login, logout } = useAuthStore.getState()

  if (!refreshToken) {
    logout()
    return null
  }

  try {
    const { data } = await authApi.post('/auth/refresh', { refreshToken })
    const nextUser = data.user || {}
    const tokens = data.tokens || {}

    login(
      {
        ...(user || {}),
        ...nextUser,
        companyName: nextUser.companyName ?? user?.companyName,
        plan: nextUser.plan ?? user?.plan,
      },
      tokens.accessToken,
      tokens.refreshToken,
    )

    return tokens.accessToken || null
  } catch {
    logout()
    return null
  }
}

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 → logout
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const isUnauthorized = error.response?.status === 401
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh')
    const { refreshToken, logout } = useAuthStore.getState()

    if (!isUnauthorized || !originalRequest || originalRequest._retry || isRefreshRequest) {
      if (isUnauthorized && !refreshToken) {
        logout()
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    if (!refreshToken) {
      logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    originalRequest._retry = true
    refreshPromise = refreshPromise || refreshAccessToken().finally(() => {
      refreshPromise = null
    })

    const nextAccessToken = await refreshPromise
    if (!nextAccessToken) {
      window.location.href = '/login'
      return Promise.reject(error)
    }

    originalRequest.headers = originalRequest.headers || {}
    originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`
    return api(originalRequest)
  },
)

export default api
