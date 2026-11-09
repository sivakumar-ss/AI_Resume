import axios from 'axios'

export const AUTH_EVENT = 'career-guidance:unauthorized'

const SESSION_HINT_KEY = 'career-guidance.session'
const CSRF_COOKIE_NAME = 'career_csrf_token'
const baseURL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

/**
 * The JWT itself lives in an HttpOnly cookie set by Flask, so JavaScript cannot
 * read or persist it. This non-sensitive hint only lets the UI distinguish a
 * first visit from a session that expired, so it can show the right message.
 */
export const sessionHint = {
  has() {
    try {
      return window.localStorage.getItem(SESSION_HINT_KEY) === '1'
    } catch {
      return false
    }
  },
  mark() {
    try {
      window.localStorage.setItem(SESSION_HINT_KEY, '1')
    } catch {
      // Storage may be unavailable; cookie auth still works.
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(SESSION_HINT_KEY)
    } catch {
      // Ignore storage failures.
    }
  },
}

/** Read a non-HttpOnly cookie (used for Flask-JWT-Extended's CSRF token). */
function readCookie(name) {
  const prefix = `${name}=`
  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : ''
}

export const api = axios.create({
  baseURL,
  timeout: 20000,
  // Send and receive the HttpOnly auth cookie. Flask CORS also allows
  // credentials for deployments where the API is on another origin.
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toUpperCase()
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = readCookie(CSRF_COOKIE_NAME)
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const requestUrl = error?.config?.url || ''
    const isCredentialCall =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')
    const isSessionProbe = requestUrl.includes('/auth/me')

    // AuthContext handles session probes explicitly. For any other 401 the
    // cookie is missing/expired/revoked, so clear the in-memory user and let
    // the route guards redirect to sign-in.
    if (status === 401 && !isCredentialCall && !isSessionProbe) {
      window.dispatchEvent(new Event(AUTH_EVENT))
    }

    return Promise.reject(error)
  },
)

export default api
