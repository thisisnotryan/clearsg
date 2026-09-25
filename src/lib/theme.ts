import { createContext, useContext } from 'react'

export type Theme = 'dark' | 'light'

export const ThemeContext = createContext<Theme>('dark')

export function useTheme() {
  return useContext(ThemeContext)
}

/** Reads a colour token for code that needs a real value, such as the map. */
export function themeColor(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
