import { REGIONS } from './regions'
import type { PersonaId } from '../lib/profile'

/*
 * The follow-up questions after choosing a persona. Answers are optional —
 * every screen can be skipped — and are used to tailor the wording and the
 * alert level, never to gate anything.
 */

export type Question = {
  id: string
  label: string
  /** Multi-select questions let several answers stand at once. */
  multi?: boolean
  /** An answer that cancels the others, such as "None". */
  exclusive?: string
  /** `short` is what the profile card shows when the chip label is wordy. */
  options: { id: string; label: string; short?: string }[]
}

const AGE_OPTIONS = [
  { id: 'under12', label: 'Under 12' },
  { id: '13to59', label: '13-59' },
  { id: '60plus', label: '60+' },
]

const CONDITION_OPTIONS = [
  { id: 'asthma', label: 'Asthma' },
  { id: 'heart', label: 'Heart condition' },
  { id: 'pregnant', label: 'Pregnant' },
  { id: 'eczema', label: 'Eczema/skin sensitivity', short: 'Eczema' },
  { id: 'other', label: 'Others' },
  { id: 'none', label: 'None' },
]

const OUTDOORS_OPTIONS = [
  { id: 'under30', label: 'Under 30 min' },
  { id: '30to2', label: '30min~2hrs' },
  { id: '2to5', label: '2~5 hrs' },
  { id: '5plus', label: '5+ hrs' },
]

export type PersonaQuestions = {
  title: string
  subtitle: string
  questions: Question[]
  /** The caregiver screen can describe more than one person. */
  repeatable?: { addLabel: string; removeLabel: string }
}

export const PERSONAL_QUESTIONS: Record<PersonaId, PersonaQuestions> = {
  myself: {
    title: 'Tell us a bit more',
    subtitle: 'Helps us personalize your alerts. Only used within the app.',
    questions: [
      { id: 'age', label: 'Age range', options: AGE_OPTIONS },
      {
        id: 'conditions',
        label: 'Health conditions',
        multi: true,
        exclusive: 'none',
        // The designed order for this screen puts eczema with "Others".
        options: CONDITION_OPTIONS.filter((option) => option.id !== 'eczema'),
      },
      { id: 'outdoors', label: 'Typical time outdoors', options: OUTDOORS_OPTIONS },
    ],
  },

  someone: {
    title: 'Tell us about them',
    subtitle: 'Helps us tailor advice to their needs.',
    repeatable: { addLabel: '+ Add another person', removeLabel: 'Remove' },
    questions: [
      {
        id: 'who',
        label: 'Who is this for',
        options: [
          { id: 'child', label: 'Young child' },
          { id: 'elderly', label: 'Elderly relative' },
          { id: 'spouse', label: 'My spouse' },
          { id: 'household', label: 'My household' },
        ],
      },
      { id: 'age', label: 'Their age range', options: AGE_OPTIONS },
      { id: 'conditions', label: 'Their health conditions', multi: true, exclusive: 'none', options: CONDITION_OPTIONS },
      { id: 'outdoors', label: 'Their time outdoors', options: OUTDOORS_OPTIONS },
    ],
  },

  onTheGo: {
    title: 'Tell us about your day',
    subtitle: 'Helps us fine tune real-time alerts to your schedule.',
    questions: [
      {
        id: 'work',
        label: 'What best describes your work',
        options: [
          { id: 'delivery', label: 'Delivery rider' },
          { id: 'construction', label: 'Construction' },
          { id: 'security', label: 'Security/cleaning' },
          { id: 'other', label: 'Others' },
        ],
      },
      {
        id: 'hours',
        label: 'Hours outdoor daily',
        options: [
          { id: '4to6', label: '4~6 hrs' },
          { id: '6to10', label: '6~10 hrs' },
          { id: '10to12', label: '10~12 hrs' },
          { id: '12plus', label: '12+ hrs' },
        ],
      },
      {
        id: 'transport',
        label: 'How you get around',
        options: [
          { id: 'motorcycle', label: 'Motorcycle' },
          { id: 'bicycle', label: 'Bicycle/PMD' },
          { id: 'foot', label: 'On foot' },
          { id: 'car', label: 'Car/Van' },
        ],
      },
      {
        /*
         * Where someone actually spends the day. Alerts watch every area
         * picked here, not just the one region they chose at setup.
         */
        id: 'areas',
        label: 'Areas you usually cover',
        multi: true,
        options: REGIONS.map((region) => ({ id: region.id, label: region.label })),
      },
    ],
  },
}

function optionFor(questionId: string, optionId: string, persona: PersonaId) {
  const question = PERSONAL_QUESTIONS[persona].questions.find((q) => q.id === questionId)
  return question?.options.find((option) => option.id === optionId)
}

export function labelFor(questionId: string, optionId: string, persona: PersonaId) {
  return optionFor(questionId, optionId, persona)?.label ?? optionId
}

/** The same answer, trimmed for the profile card's narrow right column. */
export function shortLabelFor(questionId: string, optionId: string, persona: PersonaId) {
  const option = optionFor(questionId, optionId, persona)
  return option?.short ?? option?.label ?? optionId
}
