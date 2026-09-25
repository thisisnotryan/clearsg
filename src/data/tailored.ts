import {
  allAnswers,
  audienceLabel,
  coveredRegions,
  isOutdoorHeavy,
  isSensitive,
  type PersonalProfile,
} from '../lib/personal'
import type { Band, CurrentReadings, Metric } from './airQuality'
import { getRegion } from './regions'

/*
 * Lines written from the answers people gave after picking a persona. Each
 * function returns null when nothing useful can be said, so the app stays
 * quiet rather than padding the screen with filler.
 */

const has = (personal: PersonalProfile | null, question: string, option: string) =>
  allAnswers(personal, question).includes(option)

/** One line under the verdict, naming who it applies to and what to do. */
export function dashboardNote(personal: PersonalProfile | null, band: Band): string | null {
  if (!personal || personal.skipped) return null
  if (band === 'good') return null

  const audience = audienceLabel(personal)
  const sensitive = isSensitive(personal)

  if (personal.persona === 'someone' && audience) {
    return band === 'moderate'
      ? `Keep outdoor time short for ${audience} today.`
      : `Keep ${audience} indoors where you can, with windows closed.`
  }
  if (has(personal, 'work', 'delivery') || has(personal, 'work', 'construction') || has(personal, 'work', 'security')) {
    return band === 'moderate'
      ? 'Take your breaks indoors where you can.'
      : 'Wear an N95 on shift and take breaks indoors.'
  }
  if (sensitive) {
    return band === 'moderate'
      ? 'You’re in a sensitive group — keep outdoor time short.'
      : 'You’re in a sensitive group — stay indoors where you can.'
  }
  return null
}

/** An extra tip on the mask guide, specific to how someone spends their day. */
export function maskTip(personal: PersonalProfile | null): string | null {
  if (!personal || personal.skipped) return null

  if (has(personal, 'transport', 'motorcycle')) {
    return 'Fit the mask before your helmet, and check the seal at every stop.'
  }
  if (has(personal, 'transport', 'bicycle') || has(personal, 'transport', 'foot')) {
    return 'Carry a spare — masks dampen quickly when you’re working up a sweat.'
  }
  if (has(personal, 'hours', '10to12') || has(personal, 'hours', '12plus')) {
    return 'On a long shift, change to a fresh mask partway through the day.'
  }
  if (has(personal, 'conditions', 'asthma')) {
    return 'Keep your reliever inhaler with you, even on short trips.'
  }
  if (has(personal, 'who', 'child') || has(personal, 'age', 'under12')) {
    return 'Child-sized masks seal far better than adult ones — check the fit around the nose.'
  }
  return null
}

/** An extra line on the safety guide's "Watch for" card. */
export function watchForNote(personal: PersonalProfile | null): string | null {
  if (!personal || personal.skipped) return null

  if (has(personal, 'conditions', 'asthma')) return 'With asthma, treat any wheeze or tight chest as a reason to stop and rest indoors.'
  if (has(personal, 'conditions', 'heart')) return 'With a heart condition, chest discomfort or unusual breathlessness needs medical advice the same day.'
  if (has(personal, 'conditions', 'pregnant')) return 'In pregnancy, err on the side of staying indoors on hazy days.'
  if (has(personal, 'conditions', 'eczema')) return 'Haze can flare eczema — rinse off and moisturise after time outside.'
  if (has(personal, 'who', 'elderly') || has(personal, 'age', '60plus')) return 'Older adults often feel it first as tiredness or breathlessness rather than coughing.'
  return null
}

/**
 * The alert level to start from. Anyone in a sensitive group hears about it
 * as soon as the air stops being good; everyone else at "unhealthy".
 */
export function suggestedThreshold(personal: PersonalProfile | null) {
  return isSensitive(personal) ? 51 : 101
}

/** "North, West and Central" — for sentences that list the areas someone covers. */
export function listLabels(labels: string[]) {
  if (labels.length <= 1) return labels[0] ?? ''
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}

/**
 * The line inside the profile card that says, in one phrase, why this
 * person's alerts differ from the default.
 */
export function tailoringNote(personal: PersonalProfile | null): string | null {
  if (!personal || personal.skipped) return null

  if (has(personal, 'conditions', 'asthma')) return 'Alerts trigger earlier due to asthma'
  if (has(personal, 'conditions', 'heart')) return 'Alerts trigger earlier due to a heart condition'
  if (has(personal, 'conditions', 'pregnant')) return 'Alerts trigger earlier due to pregnancy'
  if (has(personal, 'conditions', 'eczema')) return 'Alerts trigger earlier due to eczema'
  if (has(personal, 'who', 'child') || has(personal, 'age', 'under12')) return 'Alerts trigger earlier for a young child'
  if (has(personal, 'who', 'elderly') || has(personal, 'age', '60plus')) return 'Alerts trigger earlier for an older adult'

  const areas = coveredRegions(personal)
  if (areas.length) return `Alerts watch ${listLabels(areas.map((id) => getRegion(id).label))}`
  if (isOutdoorHeavy(personal)) return 'Alerts tuned for long hours outdoors'
  return null
}

/**
 * For someone working across several areas: which of them is worst right now.
 * Pointless with only one area, since that is already the headline reading.
 */
export function routesNote(personal: PersonalProfile | null, current: CurrentReadings, metric: Metric) {
  const areas = coveredRegions(personal)
  if (areas.length < 2) return null

  const worst = areas.reduce((a, b) => (current[b][metric] > current[a][metric] ? b : a))
  return `Across your areas, ${getRegion(worst).label} is highest right now at ${current[worst][metric]}.`
}
