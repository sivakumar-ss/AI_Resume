import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { authApi } from '../api/auth'
import { AUTH_EVENT, sessionHint } from '../api/client'
import { parseApiError } from '../utils/errors'

const AuthContext = createContext(null)

const SESSION_EXPIRED_MESSAGE =
  'Your session has expired. Please sign in again to continue.'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [sessionMessage, setSessionMessage] = useState('')

  const applySession = useCallback((data) => {
    setUser(data.user ?? null)
    setProfile(data.profile ?? null)
    setStatus('authenticated')
    setSessionMessage('')
  }, [])

  const clearSession = useCallback((message = '') => {
    sessionHint.clear()
    setUser(null)
    setProfile(null)
    setStatus('anonymous')
    setSessionMessage(message)
  }, [])

  const restoreSession = useCallback(async () => {
    // The JWT is an HttpOnly cookie, so JavaScript cannot inspect it. The
    // non-sensitive session hint avoids an unnecessary (and noisy) 401 on a
    // first visit while still restoring returning sessions.
    if (!sessionHint.has()) {
      setStatus('anonymous')
      return null
    }

    const hadSession = true

    try {
      const data = await authApi.me()
      sessionHint.mark()
      applySession(data)
      return data
    } catch (error) {
      const status = error?.response?.status
      const unauthorized = status === 401 || status === 403

      setUser(null)
      setProfile(null)
      setStatus('anonymous')
      sessionHint.clear()

      if (unauthorized) {
        setSessionMessage(hadSession ? SESSION_EXPIRED_MESSAGE : '')
      } else {
        setSessionMessage(parseApiError(error, 'We could not restore your session.').message)
      }
      return null
    }
  }, [applySession])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  useEffect(() => {
    const handleUnauthorized = () => clearSession(SESSION_EXPIRED_MESSAGE)
    window.addEventListener(AUTH_EVENT, handleUnauthorized)
    return () => window.removeEventListener(AUTH_EVENT, handleUnauthorized)
  }, [clearSession])

  const login = useCallback(
    async (credentials) => {
      const data = await authApi.login(credentials)
      sessionHint.mark()
      applySession(data)
      return data
    },
    [applySession],
  )

  const register = useCallback(
    async (payload) => {
      const data = await authApi.register(payload)
      sessionHint.mark()
      applySession(data)
      return data
    },
    [applySession],
  )

  const logout = useCallback(async () => {
    try {
      // Revokes the token server-side and clears the HttpOnly cookies.
      await authApi.logout()
    } catch {
      // Local logout still succeeds when the API is temporarily unreachable.
    } finally {
      clearSession('')
    }
  }, [clearSession])

  const refreshSession = useCallback(async () => {
    const data = await authApi.me()
    sessionHint.mark()
    applySession(data)
    return data
  }, [applySession])

  const syncProfile = useCallback((nextProfile) => {
    setProfile(nextProfile)
    if (nextProfile?.full_name) {
      setUser((current) =>
        current ? { ...current, full_name: nextProfile.full_name } : current,
      )
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      status,
      sessionMessage,
      isAuthenticated: status === 'authenticated',
      login,
      register,
      logout,
      refreshSession,
      syncProfile,
    }),
    [
      user,
      profile,
      status,
      sessionMessage,
      login,
      register,
      logout,
      refreshSession,
      syncProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }
  return context
}
