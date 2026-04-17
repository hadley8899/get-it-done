import axios from 'axios'
import { notifyError } from '@/services/toastService'

export const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
export const TOKEN_KEY = 'loggedInUser'
export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

const apiDebug = ['1', 'true', 'yes', 'on'].includes(
  (import.meta.env.VITE_API_DEBUG ?? (import.meta.env.DEV ? 'true' : 'false')).toLowerCase(),
)

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData
  if (isFormData && config.headers) {
    const headers = config.headers as unknown as {
      delete?: (name: string) => void
      [key: string]: unknown
    }

    // Let the browser set multipart/form-data with boundary for file uploads.
    if (typeof headers.delete === 'function') {
      headers.delete('Content-Type')
    } else {
      delete headers['Content-Type']
      delete headers['content-type']
    }
  }

  if (apiDebug) {
    config.params = {
      ...(config.params ?? {}),
      XDEBUG_SESSION_START: 'PHPSTORM',
    }
  }

  if (config.method) {
    const method = config.method.toUpperCase()
    if (['DELETE', 'PATCH', 'PUT'].includes(method)) {
      config.headers._method = method
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const hadToken = Boolean(localStorage.getItem(TOKEN_KEY))
      if (hadToken) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('userData')
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
        return Promise.reject(error)
      }
    }

    const skipToast =
      error?.config?.headers?.['X-Skip-Error-Toast'] === '1' ||
      error?.config?.headers?.['x-skip-error-toast'] === '1'

    const message =
      (error?.response?.data?.message as string | undefined) ??
      (typeof error?.message === 'string' && error.message.trim() ? error.message : null) ??
      'Request failed.'

    if (!skipToast) {
      notifyError(message)
    }
    return Promise.reject(error)
  },
)
