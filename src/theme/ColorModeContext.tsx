import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ColorMode } from '../types'

interface ColorModeContextValue {
  colorMode: ColorMode
  toggleColorMode: () => void
}

const STORAGE_KEY = 'colanpulse-color-mode'

const ColorModeContext = createContext<ColorModeContextValue | undefined>(
  undefined,
)

function readStoredMode(): ColorMode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
  } catch {
    // Ignore storage access errors (private mode, etc.)
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorMode] = useState<ColorMode>(readStoredMode)

  const toggleColorMode = useCallback(() => {
    setColorMode((current) => {
      const next = current === 'light' ? 'dark' : 'light'
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // Ignore storage access errors
      }
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ colorMode, toggleColorMode }),
    [colorMode, toggleColorMode],
  )

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  )
}

export function useColorMode() {
  const context = useContext(ColorModeContext)
  if (!context) {
    throw new Error('useColorMode must be used within ColorModeProvider')
  }
  return context
}
