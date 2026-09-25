import { useState } from 'react'
import { useIcons, type IconSet } from '../assets/icons'
import { shortLabelFor } from '../data/personalQuestions'
import { getRegion } from '../data/regions'
import { tailoringNote } from '../data/tailored'
import type { Answers, PersonalProfile } from '../lib/personal'
import type { PersonaId, Profile } from '../lib/profile'
import styles from './ProfileCard.module.css'

/*
 * The cards at the top of Settings: who ClearSG is set up for, the answers
 * behind that, and a footer that differs by persona — what the answers
 * changed, a way to describe another person, or how the map is set up.
 * A question with no answer shows "Add", which opens the same edit flow.
 *
 * A caregiver can describe several people, and each one gets its own card.
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
 * One person's answer to one question. A person can tick several boxes, so
 * the card summarises and leaves the full list to the edit flow.
 */
function valueFor(person: Answers | null, question: string, persona: PersonaId) {
  const chosen = person?.[question] ?? []
  const labels = chosen.map((option) => shortLabelFor(question, option, persona))
  return labels.length > 2 ? `${labels.slice(0, 2).join(', ')} +${labels.length - 2} more` : labels.join(', ')
}

type Props = {
  profile: Profile
  personal: PersonalProfile | null
  onEdit: () => void
  /** Adding or removing a person writes the profile straight back. */
  onChange: (personal: PersonalProfile) => void
}

export function ProfileCards({ profile, personal, onEdit, onChange }: Props) {
  const icons = useIcons()
  const [confirming, setConfirming] = useState<number | null>(null)

  const design = DESIGNS[profile.persona]
  const region = getRegion(profile.region)
  const caregiver = profile.persona === 'someone'

  const people = personal && !personal.skipped ? personal.people : []
  /*
   * A caregiver gets one card per person. The other personas only ever
   * describe one, so they keep a single card — empty if the questions were
   * skipped, which is how the card looked before any of this was asked.
   */
  const cards: (Answers | null)[] = caregiver && people.length ? people : [people[0] ?? null]

  const write = (next: Answers[]) => {
    setConfirming(null)
    onChange({ persona: profile.persona, people: next, skipped: false })
  }

  return (
    <>
      {cards.map((person, index) => {
        const last = index === cards.length - 1
        const subtitle =
          (design.subtitle && valueFor(person, design.subtitle, profile.persona)) || `${region.label}, Singapore`
        // Only the "Myself" card carries the line about the alert level; the
        // other two designs use that space for their own footer.
        const note = profile.persona === 'myself' ? tailoringNote(personal) : null

        return (
          <section key={index} className={`${styles.card} ${styles[profile.persona]}`}>
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

            {person && (
              <dl className={styles.rows}>
                {design.rows.map((row) => {
                  const value = valueFor(person, row.question, profile.persona)
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
            {profile.persona === 'onTheGo' && person && (
              <p className={styles.strip}>Pinned to your live map by default</p>
            )}

            {caregiver &&
              (confirming === index ? (
                /* Removing someone loses their answers, so it is asked first. */
                <div className={styles.confirm} role="group" aria-label="Confirm removing this person">
                  <span className={styles.confirmText}>Remove this person?</span>
                  <button type="button" className={styles.cancel} onClick={() => setConfirming(null)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => write(people.filter((_, i) => i !== index))}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className={styles.footer}>
                  {last && (
                    <button type="button" className={styles.addPerson} onClick={() => write([...people, {}])}>
                      + Add another person
                    </button>
                  )}
                  {people.length > 1 && (
                    <button
                      type="button"
                      className={styles.trash}
                      onClick={() => setConfirming(index)}
                      aria-label="Remove this person"
                    >
                      <img src={icons.trash} alt="" width={30} height={30} />
                    </button>
                  )}
                </div>
              ))}
          </section>
        )
      })}
    </>
  )
}
