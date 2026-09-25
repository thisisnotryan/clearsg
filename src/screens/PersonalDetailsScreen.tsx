import { useState } from 'react'
import { useIcons } from '../assets/icons'
import { ChoiceChip } from '../components/ChoiceChip'
import { PERSONAL_QUESTIONS, type Question } from '../data/personalQuestions'
import type { PersonaId } from '../lib/profile'
import { loadPersonal, type Answers, type PersonalProfile } from '../lib/personal'
import styles from './PersonalDetailsScreen.module.css'

type Props = {
  persona: PersonaId
  onBack: () => void
  onDone: (personal: PersonalProfile) => void
}

/**
 * The optional follow-up after choosing a persona. Everything here can be
 * skipped; the answers only tailor wording and the alert level.
 */
export function PersonalDetailsScreen({ persona, onBack, onDone }: Props) {
  const icons = useIcons()
  const { title, subtitle, questions, repeatable } = PERSONAL_QUESTIONS[persona]
  /*
   * Editing from Settings comes back through this screen, so it starts from
   * what is already stored — including anyone added from a profile card.
   */
  const [people, setPeople] = useState<Answers[]>(() => {
    const stored = loadPersonal()
    return stored && !stored.skipped && stored.persona === persona && stored.people.length ? stored.people : [{}]
  })

  const answer = (personIndex: number, question: Question, optionId: string) => {
    setPeople((previous) =>
      previous.map((person, index) => {
        if (index !== personIndex) return person
        const chosen = person[question.id] ?? []

        if (!question.multi) {
          // Tapping the chosen option again clears it — nothing is compulsory.
          return { ...person, [question.id]: chosen.includes(optionId) ? [] : [optionId] }
        }
        if (optionId === question.exclusive) {
          return { ...person, [question.id]: chosen.includes(optionId) ? [] : [optionId] }
        }
        const withoutExclusive = chosen.filter((id) => id !== question.exclusive)
        return {
          ...person,
          [question.id]: withoutExclusive.includes(optionId)
            ? withoutExclusive.filter((id) => id !== optionId)
            : [...withoutExclusive, optionId],
        }
      }),
    )
  }

  const finish = (skipped: boolean) => onDone({ persona, people: skipped ? [] : people, skipped })

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <header className={styles.header}>
          <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
            <img src={icons.backArrow} alt="" width={30} height={30} />
          </button>
          <button type="button" className={styles.skip} onClick={() => finish(true)}>
            Skip for now
          </button>
        </header>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        {people.map((person, personIndex) => (
          <section key={personIndex} className={styles.person}>
            {personIndex > 0 && (
              <div className={styles.personHeader}>
                <h2 className={styles.personTitle}>Person {personIndex + 1}</h2>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => setPeople((previous) => previous.filter((_, index) => index !== personIndex))}
                >
                  {repeatable?.removeLabel}
                </button>
              </div>
            )}

            {questions.map((question) => (
              <div key={question.id} className={styles.question}>
                <h3 className={styles.questionLabel}>{question.label}</h3>
                <div
                  className={styles.options}
                  role={question.multi ? 'group' : 'radiogroup'}
                  aria-label={question.label}
                >
                  {question.options.map((option) => (
                    <ChoiceChip
                      key={option.id}
                      label={option.label}
                      multi={question.multi}
                      selected={(person[question.id] ?? []).includes(option.id)}
                      onSelect={() => answer(personIndex, question, option.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

        {repeatable && (
          <button type="button" className={styles.add} onClick={() => setPeople((previous) => [...previous, {}])}>
            {repeatable.addLabel}
          </button>
        )}
      </div>

      <footer className={styles.footer}>
        <button type="button" className={styles.action} onClick={() => finish(false)}>
          Continue
        </button>
      </footer>
    </div>
  )
}
