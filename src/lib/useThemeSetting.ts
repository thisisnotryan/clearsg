import { useEffect } from 'react'
import type { PersonaId } from './profile'
import type { Theme } from './theme'
import { useSettings } from './useSettings'

/**
 * The theme comes from the Light mode setting. Onboarding runs before a
 * persona is chosen, so it falls back to the defaults for "Myself".
 */
export function useThemeSetting(persona: PersonaId | undefined): Theme {
  const { settings } = useSettings(persona ?? 'myself')
  const theme: Theme = settings.lightMode ? 'light' : 'dark'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    // Keeps the phone's status bar and browser chrome in step.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'light' ? '#ffffff' : '#1a1a19')
  }, [theme])

  return theme
}

