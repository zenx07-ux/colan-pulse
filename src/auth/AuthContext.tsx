import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'colanpulse-auth'
const DEMO_USER = {
  name: 'SuperAdmin',
  id: 'CIPL1234',
}
const DEMO_USERNAMES = ['superadmin', 'cipl1234']
const DEMO_PASSWORD = 'Colan@123'

export interface AuthUser {
  name: string
  id: string
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (username: string, password: string) => string | null
  logout: () => void
  changePassword: (current: string, next: string) => string | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredUser(): AuthUser | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as AuthUser
    if (parsed?.name && parsed?.id) return parsed
  } catch {
    // Ignore storage access errors
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)
  const [password, setPassword] = useState(DEMO_PASSWORD)

  const login = useCallback(
    (username: string, nextPassword: string) => {
      const normalized = username.trim().toLowerCase()
      if (!DEMO_USERNAMES.includes(normalized) || nextPassword !== password) {
        return 'Invalid username or password.'
      }
      setUser(DEMO_USER)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USER))
      } catch {
        // Ignore storage access errors
      }
      return null
    },
    [password],
  )

  const logout = useCallback(() => {
    setUser(null)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore storage access errors
    }
  }, [])

  const changePassword = useCallback(
    (current: string, next: string) => {
      if (current !== password) return 'Current password is incorrect.'
      if (next.length < 8) return 'New password must be at least 8 characters.'
      setPassword(next)
      return null
    },
    [password],
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      changePassword,
    }),
    [changePassword, login, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
