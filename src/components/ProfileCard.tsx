import { useIcons, type IconSet } from '../assets/icons'
import { shortLabelFor } from '../data/personalQuestions'
import { getRegion } from '../data/regions'
import { tailoringNote } from '../data/tailored'
import type { PersonalProfile } from '../lib/personal'
import type { PersonaId, Profile } from '../lib/profile'
import styles from './ProfileCard.module.css'

/*
 * The card at the top of Settings: who ClearSG is set up for, the answers
 * behind that, and a footer that differs by persona — what the answers
 * changed, a way to describe another person, or how the map is set up.
 * A question with no answer shows "Add", which opens the same edit flow.
 */

/* 'dots' is the only icon that is a list rather than one image. */
type Icon = Exclude<keyof IconSet, 'dots'>
type Row = { icon: Icon; label: string; question: string }

type Design = {
  /** The heading. Only "Myself" names the persona as the picker does. */
  title: string
  /** The glyph inside the coloured circle, and how big the design draws it. */
  glyph: Icon
  glyphSize: number
  rows: Row[]
  /** The answer used as the subtitle, in place of the region. */
  subtitle?: string
}

const DESIGNS: Record<PersonaId, Design> = {
  myself: {
    title: 'Myself',
    glyph: 'personaMyselfSelected',
    glyphSize: 36,
    rows: [
      { icon: 'birthdayCake', label: 'Age range', question: 'age' },
      { icon: 'lungs', label: 'Health conditions', question: 'conditions' },
      { icon: 'sun', label: 'Time outdoors', question: 'outdoors' },
    ],
  },
  someone: {
    title: 'Caring for:',
    glyph: 'cardHeart',
    glyphSize: 35,
    subtitle: 'who',
    rows: [
      { icon: 'birthdayCake', label: 'Their age range', question: 'age' },
      { icon: 'lungs', label: 'Health conditions', question: 'conditions' },
      { icon: 'sun', label: 'Outdoor activities', question: 'outdoors' },
    ],
  },
  onTheGo: {
    title: 'On the go often',
    glyph: 'cardMotorcycle',
    glyphSize: 35,
    subtitle: 'work',
    rows: [
      { icon: 'clock', label: 'Hours outdoors daily', question: 'hours' },
      { icon: 'motorcycle', label: 'Transport', question: 'transport' },
      { icon: 'location', label: 'Areas covered', question: 'areas' },
    ],
  },
}

/**
 * Everyone's answers to one question, without repeats. Describing several
 * people can produce a long list, so the card summarises and leaves the full
 * answers to the edit flow.
 */
function valueFor(personal: PersonalProfile | null, question: string, persona: PersonaId) {
  if (!personal || personal.skipped) return ''
  const chosen = [...new Set(personal.people.flatMap((person) => person[question] ?? []))]
  const labels = chosen.map((option) => shortLabelFor(question, option, persona))
  return labels.length > 2 ? `${labels.slice(0, 2).join(', ')} +${labels.length - 2} more` : labels.join(', ')
}

type Props = {
  profile: Profile
  personal: PersonalProfile | null
  onEdit: () => void
}

export function ProfileCard({ profile, personal, onEdit }: Props) {
  const icons = useIcons()
  const design = DESIGNS[profile.persona]
  const region = getRegion(profile.region)

  const answered = Boolean(personal && !personal.skipped)
  const subtitle = (design.subtitle && valueFor(personal, design.subtitle, profile.persona)) || `${region.label}, Singapore`
  const note = profile.persona === 'myself' ? tailoringNote(personal) : null

  return (
    <section className={`${styles.card} ${styles[profile.persona]}`}>
      <header className={styles.head}>
        <span className={styles.avatar}>
          <img src={icons[design.glyph]} alt="" height={design.glyphSize} />
        </span>
        <span className={styles.text}>
          <span className={styles.name}>{design.title}</span>
          <span className={styles.subtitle}>{subtitle}</span>
        </span>
        <button type="button" className={styles.edit} onClick={onEdit}>
          Edit
        </button>
      </header>

      {/* Answers, or an invitation to give one. Hidden entirely when the
          questions were skipped, so the card stays as small as it was. */}
      {answered && (
        <dl className={styles.rows}>
          {design.rows.map((row) => {
            const value = valueFor(personal, row.question, profile.persona)
            return (
              <div key={row.label} className={styles.row}>
                <img className={styles.rowIcon} src={icons[row.icon]} alt="" width={20} height={20} />
                <dt className={styles.rowLabel}>{row.label}</dt>
                <dd className={styles.rowValue}>
                  {value || (
                    <button type="button" className={styles.add} onClick={onEdit}>
                      Add
                      <span className={styles.srOnly}> {row.label.toLowerCase()}</span>
                    </button>
                  )}
                </dd>
              </div>
            )
          })}
        </dl>
      )}

      {note && <p className={styles.strip}>{note}</p>}

      {/* Rizwan's areas are pinned on the Live Map, so the card says so. */}
      {profile.persona === 'onTheGo' && answered && (
        <p className={styles.strip}>Pinned to your live map by default</p>
      )}

      {profile.persona === 'someone' && (
        <button type="button" className={styles.addPerson} onClick={onEdit}>
          + Add another person
        </button>
      )}
    </section>
  )
}
