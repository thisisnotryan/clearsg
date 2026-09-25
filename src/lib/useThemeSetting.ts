import { useEffect } from 'react'
import { getPersona } from '../data/personas'
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

/**
 * Scales the text for personas that need it — the brief asks for a large-text
 * option for the elderly reader. Applied as a zoom on the scrolling areas, so
 * spacing grows with the type instead of the layout cramping.
 */
export function useTextScale(persona: PersonaId | undefined) {
  const scale = persona ? getPersona(persona).emphasis.textScale : 1

  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(scale))
  }, [scale])

  return scale
}
