import { OnboardingLayout } from '../components/OnboardingLayout'
import { PersonaCard } from '../components/PersonaCard'
import { ScreenHeading } from '../components/ScreenHeading'
import { PERSONAS } from '../data/personas'
import type { PersonaId } from '../lib/profile'
import styles from './PersonaScreen.module.css'

type Props = {
  persona: PersonaId | null
  onChange: (persona: PersonaId) => void
  onBack: () => void
  onNext: () => void
}

export function PersonaScreen({ persona, onChange, onBack, onNext }: Props) {
  return (
    <OnboardingLayout step={3} actionLabel="Continue" onAction={onNext} actionDisabled={!persona} onBack={onBack}>
      <ScreenHeading title="Who’s this for?" subtitle="Helps us tailor alerts and advice." />
      <div className={styles.cards} role="radiogroup" aria-label="Who's this for">
        {PERSONAS.map((p) => (
          <PersonaCard key={p.id} persona={p} selected={persona === p.id} onSelect={() => onChange(p.id)} />
        ))}
      </div>
    </OnboardingLayout>
  )
}
