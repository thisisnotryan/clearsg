export type RegionId = 'north' | 'south' | 'east' | 'west' | 'central'
export type PersonaId = 'myself' | 'someone' | 'onTheGo'

export type Profile = {
  region: RegionId
  persona: PersonaId
}

const STORAGE_KEY = 'clearsg.profile'

// Storage can be unavailable (private browsing, blocked site data), so every access is guarded.
export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Profile>
    return parsed.region && parsed.persona ? (parsed as Profile) : null
  } catch {
    return null
  }
}

export function saveProfile(profile: Profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // Onboarding will simply show again next launch.
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear.
  }
}
