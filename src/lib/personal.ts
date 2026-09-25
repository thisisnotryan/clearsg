import type { PersonaId } from './profile'

/*
 * The optional answers from the "tell us a bit more" screen. They shape the
 * wording across the app and the alert level, and they never leave the phone
 * except as a coarse hint sent with a push subscription.
 */

/** One set of answers: the user, or a person they care for. */
export type Answers = Record<string, string[]>

export type PersonalProfile = {
  persona: PersonaId
  /** One entry per person; the caregiver screen can describe several. */
  people: Answers[]
  /** True when the questions were skipped, so nothing is inferred. */
  skipped: boolean
}

const STORAGE_KEY = 'clearsg.personal'

export function loadPersonal(): PersonalProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersonalProfile>
    return parsed.persona && Array.isArray(parsed.people)
      ? { persona: parsed.persona, people: parsed.people, skipped: Boolean(parsed.skipped) }
      : null
  } catch {
    return null
  }
}

export function savePersonal(personal: PersonalProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(personal))
  } catch {
    // The app simply stays generic.
  }
  window.dispatchEvent(new Event(PERSONAL_CHANGED_EVENT))
}

export function clearPersonal() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear.
  }
  window.dispatchEvent(new Event(PERSONAL_CHANGED_EVENT))
}

export const PERSONAL_CHANGED_EVENT = 'clearsg:personal-changed'

/** Every answer given, across everyone described. */
export function allAnswers(personal: PersonalProfile | null, questionId: string) {
  return personal?.people.flatMap((person) => person[questionId] ?? []) ?? []
}

const SENSITIVE_CONDITIONS = ['asthma', 'heart', 'pregnant', 'eczema']

/**
 * Whether anyone described is more affected by haze than most — the under-12s
 * and over-60s NEA singles out, or a named condition. Drives the alert level
 * and the wording.
 */
export function isSensitive(personal: PersonalProfile | null) {
  if (!personal || personal.skipped) return false
  const ages = allAnswers(personal, 'age')
  const conditions = allAnswers(personal, 'conditions')
  const who = allAnswers(personal, 'who')
  return (
    ages.includes('under12') ||
    ages.includes('60plus') ||
    who.includes('child') ||
    who.includes('elderly') ||
    conditions.some((condition) => SENSITIVE_CONDITIONS.includes(condition))
  )
}

/** Long hours outdoors, whoever the app is for. */
export function isOutdoorHeavy(personal: PersonalProfile | null) {
  const hours = [...allAnswers(personal, 'hours'), ...allAnswers(personal, 'outdoors')]
  return hours.some((value) => ['10to12', '12plus', '6to10', '5plus'].includes(value))
}

/** Short label for who an alert concerns, used in notifications. */
export function audienceLabel(personal: PersonalProfile | null): string | null {
  if (!personal || personal.skipped || personal.persona !== 'someone') return null
  const who = allAnswers(personal, 'who')
  if (who.includes('child')) return 'your child'
  if (who.includes('elderly')) return 'your relative'
  if (who.includes('household')) return 'your household'
  if (who.includes('spouse')) return 'your spouse'
  return null
}
