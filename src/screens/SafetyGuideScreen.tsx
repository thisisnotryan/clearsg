import { useIcons } from '../assets/icons'
import { GuideLayout } from '../components/GuideLayout'
import { BANDS, psiBand } from '../data/airQuality'
import { CHECKLIST_ITEMS, SAFETY_GUIDANCE } from '../data/guidance'
import { loadChecklist, saveChecklist } from '../lib/checklist'
import type { Profile } from '../lib/profile'
import { useAirQuality } from '../lib/airQualityContext'
import { useEffect, useState, type CSSProperties } from 'react'
import styles from './SafetyGuideScreen.module.css'

type Props = {
  profile: Profile
  onBack: () => void
}

export function SafetyGuideScreen({ profile, onBack }: Props) {
  const [done, setDone] = useState<string[]>(loadChecklist)
  const { current } = useAirQuality()
  const icons = useIcons()
  const psi = current[profile.region].psi24h
  const bandKey = psiBand(psi)
  const band = BANDS[bandKey]
  const guidance = SAFETY_GUIDANCE[bandKey]

  const cards = [
    { icon: icons.walking, title: 'Outdoor activity', body: guidance.outdoor },
    { icon: icons.house, title: 'At home', body: guidance.home },
    { icon: icons.stethoscope, title: 'Watch for', body: guidance.watchFor },
  ]

  useEffect(() => {
    saveChecklist(done)
  }, [done])

  // Updating from the previous value keeps quick successive taps from
  // overwriting each other.
  const toggle = (id: string) => {
    setDone((previous) => (previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]))
  }

  return (
    <GuideLayout title="Safety guide" onBack={onBack}>
      <p
        className={styles.bandPill}
        style={{ '--band-fill': band.background, '--band-solid': band.solid, color: band.color } as CSSProperties}
      >
        {band.label.charAt(0).toUpperCase() + band.label.slice(1)}, PSI {psi}
      </p>

      {cards.map((card) => (
        <section key={card.title} className={styles.card}>
          <h2 className={styles.cardTitle}>
            <img src={card.icon} alt="" width={30} height={30} />
            {card.title}
          </h2>
          <p className={styles.cardBody}>{card.body}</p>
        </section>
      ))}

      <h2 className={styles.checklistTitle}>Haze readiness checklist</h2>
      <ul className={styles.checklist}>
        {CHECKLIST_ITEMS.map((item) => {
          const checked = done.includes(item.id)
          return (
            <li key={item.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                className={styles.checklistItem}
                onClick={() => toggle(item.id)}
              >
                <span className={checked ? styles.boxChecked : styles.box}>
                  {checked && <img src={icons.check} alt="" width={20} height={20} />}
                </span>
                <span className={checked ? styles.labelDone : styles.label}>{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </GuideLayout>
  )
}
