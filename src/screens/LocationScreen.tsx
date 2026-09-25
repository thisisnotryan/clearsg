import { OnboardingLayout } from '../components/OnboardingLayout'
import { RegionChip } from '../components/RegionChip'
import { RegionMap } from '../components/RegionMap'
import { ScreenHeading } from '../components/ScreenHeading'
import { REGIONS } from '../data/regions'
import type { RegionId } from '../lib/profile'
import styles from './LocationScreen.module.css'

type Props = {
  region: RegionId | null
  onChange: (region: RegionId) => void
  onBack: () => void
  onNext: () => void
}

export function LocationScreen({ region, onChange, onBack, onNext }: Props) {
  return (
    <OnboardingLayout step={2} actionLabel="Continue" onAction={onNext} actionDisabled={!region} onBack={onBack}>
      <ScreenHeading title="Where are you based?" subtitle="We’ll show air quality for your area." />
      <div className={styles.chips} role="radiogroup" aria-label="Region">
        {REGIONS.map((r) => (
          <RegionChip key={r.id} label={r.label} selected={region === r.id} onSelect={() => onChange(r.id)} />
        ))}
      </div>
      <div className={styles.map}>
        <RegionMap region={region} />
      </div>
    </OnboardingLayout>
  )
}
