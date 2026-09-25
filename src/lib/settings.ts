import type { PersonaId } from './profile'

export type Settings = {
  unhealthyPsiAlert: boolean
  dailyDigest: boolean
  /** PSI level that triggers an alert. */
  alertThreshold: number
  lightMode: boolean
}

/*
 * Alert levels are the points where NEA's bands change, so each choice means
 * something: below the first one the air is "good" and nothing is worth
 * saying. A custom level covers anything in between.
 */
export const THRESHOLD_OPTIONS = [
  { value: 51, label: 'Moderate' },
  { value: 101, label: 'Unhealthy' },
  { value: 201, label: 'Very unhealthy' },
]

export const DEFAULT_THRESHOLD = 51

/** "Moderate 51+" for a band level, "PSI 75" for a custom one. */
export function thresholdLabel(value: number) {
  const band = THRESHOLD_OPTIONS.find((option) => option.value === value)
  return band ? `${band.label} ${band.value}+` : `PSI ${value}`
}

/** Bounds for a custom level: below 20 is never reached, above 300 never useful. */
export const CUSTOM_THRESHOLD_MIN = 20
export const CUSTOM_THRESHOLD_MAX = 300
export const CUSTOM_THRESHOLD_STEP = 10

/*
 * Everyone starts at PSI 50, and the daily digest follows the persona: a
 * caregiver planning around someone vulnerable gets it, while the others,
 * who mainly want the moment-to-moment reading, do not.
 */
const DEFAULTS_BY_PERSONA: Record<PersonaId, Settings> = {
  myself: { unhealthyPsiAlert: true, dailyDigest: false, alertThreshold: DEFAULT_THRESHOLD, lightMode: false },
  someone: { unhealthyPsiAlert: true, dailyDigest: true, alertThreshold: DEFAULT_THRESHOLD, lightMode: false },
  onTheGo: { unhealthyPsiAlert: true, dailyDigest: false, alertThreshold: DEFAULT_THRESHOLD, lightMode: false },
}

const STORAGE_KEY = 'clearsg.settings'

/** Fired after settings are saved, so other screens can pick them up. */
export const SETTINGS_CHANGED_EVENT = 'clearsg:settings-changed'

export function defaultSettings(persona: PersonaId): Settings {
  return { ...DEFAULTS_BY_PERSONA[persona] }
}

export function loadSettings(persona: PersonaId): Settings {
  const defaults = defaultSettings(persona)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<Settings>) } : defaults
  } catch {
    return defaults
  }
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Settings fall back to the persona defaults next launch.
  }
  window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT))
}

export function clearSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear.
  }
}
