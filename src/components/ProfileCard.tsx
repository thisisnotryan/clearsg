import { useIcons, type IconSet } from '../assets/icons'
import { labelFor } from '../data/personalQuestions'
import { getPersona } from '../data/personas'
import { getRegion } from '../data/regions'
import { tailoringNote } from '../data/tailored'
import type { PersonalProfile } from '../lib/personal'
import type { Profile, PersonaId } from '../lib/profile'
import styles from './ProfileCard.module.css'

/*
 * The card at the top of Settings: who ClearSG is set up for, the answers
 * behind that, and one line saying what those answers changed. Rows with no
 * answer are left out, so a skipped questionnaire simply shows the name.
 */

/* 'dots' is the only icon that is a list rather than one image. */
type Row = { icon: Exclude<keyof IconSet, 'dots'>; label: string; question: string }

const ROWS: Record<PersonaId, Row[]> = {
  myself: [
    { icon: 'birthdayCake', label: 'Age range', question: 'age' },
    { icon: 'lungs', label: 'Health conditions', question: 'conditions' },
    { icon: 'sun', label: 'Time outdoors', question: 'outdoors' },
  ],
  someone: [
    { icon: 'personaSomeone', label: 'Caring for', question: 'who' },
    { icon: 'birthdayCake', label: 'Age range', question: 'age' },
    { icon: 'lungs', label: 'Health conditions', question: 'conditions' },
  ],
  onTheGo: [
    { icon: 'walking', label: 'Work', question: 'work' },
    { icon: 'sun', label: 'Hours outdoors', question: 'hours' },
    { icon: 'pinSmall', label: 'Areas covered', question: 'areas' },
  ],
}

/**
 * Everyone's answers to one question, without repeats. Describing several
 * people can produce a long list, so the card summarises and leaves the full
 * answers to the Edit screen.
 */
function valueFor(personal: PersonalProfile, question: string, persona: PersonaId) {
  const chosen = [...new Set(personal.people.flatMap((person) => person[question] ?? []))]
  const labels = chosen.map((option) => labelFor(question, option, persona))
  return labels.length > 2 ? `${labels.slice(0, 2).join(', ')} +${labels.length - 2} more` : labels.join(', ')
}

type Props = {
  profile: Profile
  personal: PersonalProfile | null
  onEdit: () => void
}

export function ProfileCard({ profile, personal, onEdit }: Props) {
  const icons = useIcons()
  const persona = getPersona(profile.persona)
  const region = getRegion(profile.region)

  const rows =
    personal && !personal.skipped
      ? ROWS[profile.persona]
          .map((row) => ({ ...row, value: valueFor(personal, row.question, profile.persona) }))
          .filter((row) => row.value)
      : []
  const note = tailoringNote(personal)

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <span className={styles.avatar}>
          <img
            src={persona.iconSelected}
            alt=""
            width={persona.iconSize.width * 0.9}
            height={persona.iconSize.height * 0.9}
          />
        </span>
        <span className={styles.text}>
          <span className={styles.name}>{persona.title}</span>
          <span className={styles.region}>{region.label}, Singapore</span>
        </span>
        <button type="button" className={styles.edit} onClick={onEdit}>
          Edit
        </button>
      </header>

      {rows.length > 0 && (
        <dl className={styles.rows}>
          {rows.map((row) => (
            <div key={row.label} className={styles.row}>
              <img className={styles.rowIcon} src={icons[row.icon]} alt="" width={20} height={20} />
              <dt className={styles.rowLabel}>{row.label}</dt>
              <dd className={styles.rowValue}>{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {note && <p className={styles.note}>{note}</p>}
    </section>
  )
}
