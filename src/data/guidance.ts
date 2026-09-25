import type { Band } from './airQuality'

export type Guidance = { title: string; detail: string }

/*
 * Mask advice per PSI band. The "moderate" wording is the one drawn in the
 * Figma mask guide; the rest follow the same voice — plain, calm, specific.
 */
export const MASK_GUIDANCE: Record<Band, Guidance> = {
  good: {
    title: 'No mask needed',
    detail: 'Air is clear enough for normal outdoor plans',
  },
  moderate: {
    title: 'N95 or KN95 recommended',
    detail: 'For prolonged outdoor time or sensitive groups',
  },
  unhealthy: {
    title: 'Wear an N95 or KN95 outdoors',
    detail: 'Everyone benefits from one, not just sensitive groups',
  },
  veryUnhealthy: {
    title: 'N95 or KN95, and keep trips short',
    detail: 'Stay indoors where you can; a mask is not full protection',
  },
  hazardous: {
    title: 'Stay indoors',
    detail: 'If you must go out, wear an N95 and keep it brief',
  },
}

/** The fallback note under the recommendation card. */
export const MASK_NOTE = 'No N95 on hand? A well-fitted surgical mask still helps for short trips outside.'

export const MASK_TIPS = [
  'Ensure a snug fit with no gaps around the nose or chin',
  'Replace when damp, dirty, or after 8 hours of use',
  'Avoid strenuous outdoor exercise today',
]

/** The three safety guide cards, per band. */
export const SAFETY_GUIDANCE: Record<Band, { outdoor: string; home: string; watchFor: string }> = {
  good: {
    outdoor: 'Normal outdoor activity is fine, including exercise and sport.',
    home: 'No special steps needed. Open windows as usual.',
    watchFor: 'Nothing unusual. See a doctor if you feel unwell anyway.',
  },
  moderate: {
    outdoor: 'Fine for short errands. Limit prolonged exertion, especially for children and the elderly.',
    home: 'Keep windows closed during peak haze hours. Run your air purifier if you have one.',
    watchFor: 'Coughing, throat irritation, or shortness of breath. See a doctor if symptoms persist.',
  },
  unhealthy: {
    outdoor: 'Cut down outdoor activity. Postpone sport and long errands where you can.',
    home: 'Keep windows closed and run an air purifier. Avoid burning candles or incense.',
    watchFor: 'Coughing, wheezing, chest tightness, or eye irritation. See a doctor if it worsens.',
  },
  veryUnhealthy: {
    outdoor: 'Stay indoors. Go out only when you have to, and keep it short.',
    home: 'Seal gaps around windows and doors. Run an air purifier in the room you use most.',
    watchFor: 'Breathlessness, a persistent cough, or a racing heart. Seek medical help early.',
  },
  hazardous: {
    outdoor: 'Avoid all outdoor activity.',
    home: 'Stay in the least draughty room with an air purifier running.',
    watchFor: 'Any breathing difficulty, chest pain, or dizziness. Seek medical help straight away.',
  },
}

export const CHECKLIST_ITEMS = [
  { id: 'masks', label: 'Stock N95 masks' },
  { id: 'purifier', label: 'Check air purifier filter' },
  { id: 'hotline', label: 'Save NEA hotline number' },
]
