import { useCallback, useEffect, useState } from 'react'
import type { PersonaId } from './profile'
import { loadSettings, saveSettings, SETTINGS_CHANGED_EVENT, type Settings } from './settings'

/**
 * Settings shared across screens: the Settings screen writes them, and the
 * alert banner reads them, so both stay in step without prop drilling.
 */
export function useSettings(persona: PersonaId) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings(persona))

  useEffect(() => {
    const onChange = () => setSettings(loadSettings(persona))
    window.addEventListener(SETTINGS_CHANGED_EVENT, onChange)
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, onChange)
  }, [persona])

  const update = useCallback(
    (changes: Partial<Settings>) => {
      setSettings((previous) => {
        const next = { ...previous, ...changes }
        saveSettings(next)
        return next
      })
    },
    [],
  )

  return { settings, update }
}
