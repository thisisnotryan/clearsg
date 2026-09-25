import type { PersonaId } from '../lib/profile'
import myselfIcon from '../assets/figma/persona-myself.svg'
import myselfIconSelected from '../assets/figma/persona-myself-selected.svg'
import someoneIcon from '../assets/figma/persona-someone.png'
import someoneIconSelected from '../assets/figma/persona-someone-selected.png'
import onTheGoIcon from '../assets/figma/persona-onthego.png'
import onTheGoIconSelected from '../assets/figma/persona-onthego-selected.png'

export type Persona = {
  id: PersonaId
  title: string
  description: string
  icon: string
  iconSelected: string
  // The "Myself" glyph is narrower than the 40×40 heart and motorcycle glyphs.
  iconSize: { width: number; height: number }
}

export const PERSONAS: Persona[] = [
  {
    id: 'myself',
    title: 'Myself',
    description: 'General air quality updates',
    icon: myselfIcon,
    iconSelected: myselfIconSelected,
    iconSize: { width: 26, height: 36 },
  },
  {
    id: 'someone',
    title: 'Someone I care for',
    description: 'Elderly or child-friendly guidance',
    icon: someoneIcon,
    iconSelected: someoneIconSelected,
    iconSize: { width: 40, height: 40 },
  },
  {
    id: 'onTheGo',
    title: 'On the go often',
    description: 'Real-time, hyperlocal readings',
    icon: onTheGoIcon,
    iconSelected: onTheGoIconSelected,
    iconSize: { width: 40, height: 40 },
  },
]

export function getPersona(id: PersonaId) {
  return PERSONAS.find((p) => p.id === id)!
}
