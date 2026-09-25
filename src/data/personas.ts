import type { Metric } from './airQuality'
import type { PersonaId } from '../lib/profile'
import myselfIcon from '../assets/figma/persona-myself.svg'
import myselfIconSelected from '../assets/figma/persona-myself-selected.svg'
import someoneIcon from '../assets/figma/persona-someone.png'
import someoneIconSelected from '../assets/figma/persona-someone-selected.png'
import onTheGoIcon from '../assets/figma/persona-onthego.png'
import onTheGoIconSelected from '../assets/figma/persona-onthego-selected.png'

/*
 * The same dashboard, weighted differently — the brief's three readers want
 * different things from the same numbers.
 */
export type Emphasis = {
  /** Headline reading: the day's PSI, or what the air is doing right now. */
  metric: Metric
  /** Points the dashboard at the trend, for someone planning around it. */
  planning: boolean
}

export type Persona = {
  id: PersonaId
  title: string
  description: string
  icon: string
  iconSelected: string
  // The "Myself" glyph is narrower than the 40×40 heart and motorcycle glyphs.
  iconSize: { width: number; height: number }
  emphasis: Emphasis
}

export const PERSONAS: Persona[] = [
  {
    id: 'myself',
    title: 'Myself',
    description: 'General air quality updates',
    icon: myselfIcon,
    iconSelected: myselfIconSelected,
    iconSize: { width: 26, height: 36 },
    emphasis: { metric: 'psi24h', planning: false },
  },
  {
    id: 'someone',
    title: 'Someone I care for',
    description: 'Elderly or child-friendly guidance',
    icon: someoneIcon,
    iconSelected: someoneIconSelected,
    iconSize: { width: 40, height: 40 },
    // Mrs Rahman: planning school runs and windows, so lead to the trend.
    emphasis: { metric: 'psi24h', planning: true },
  },
  {
    id: 'onTheGo',
    title: 'On the go often',
    description: 'Real-time, hyperlocal readings',
    icon: onTheGoIcon,
    iconSelected: onTheGoIconSelected,
    iconSize: { width: 40, height: 40 },
    // Rizwan, outdoors all day: what the air is doing right now, not a
    // 24-hour average.
    emphasis: { metric: 'pm25_1h', planning: false },
  },
]

export function getPersona(id: PersonaId) {
  return PERSONAS.find((p) => p.id === id)!
}
