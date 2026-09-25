import heroImage from '../assets/figma/mask-guide-hero.png'
import { useIcons } from '../assets/icons'
import { VerdictCard } from '../components/VerdictCard'
import { getRegion } from '../data/regions'
import type { Profile } from '../lib/profile'
import { todayRange } from '../lib/trend'
import { useAirQuality } from '../lib/airQualityContext'
import styles from './HomeScreen.module.css'

type Props = {
  profile: Profile
  onOpenSettings: () => void
  onOpenMaskGuide: () => void
}

export function HomeScreen({ profile, onOpenSettings, onOpenMaskGuide }: Props) {
  const { current, history } = useAirQuality()
  const icons = useIcons()
  const region = getRegion(profile.region)
  const psi = current[profile.region].psi24h
  // NEA publishes no forecast, so the strip shows now against today so far.
  const range = todayRange(history.psi24h, profile.region)
  const outlook = [
    { label: 'Now', value: psi },
    { label: 'High today', value: range?.high ?? psi },
    { label: 'Low today', value: range?.low ?? psi },
  ]

  return (
    <>
      <header className={styles.header}>
        <img src={icons.pin} alt="" width={30} height={30} />
        <h1 className={styles.location}>{region.label}, Singapore</h1>
        <button type="button" className={styles.settings} aria-label="Settings" onClick={onOpenSettings}>
          <img src={icons.gear} alt="" width={35} height={35} />
        </button>
      </header>

      <div className={styles.verdict}>
        <VerdictCard metric="psi24h" value={psi} />
      </div>

      <ul className={styles.outlook}>
        {outlook.map((slot) => (
          <li key={slot.label} className={styles.outlookCard}>
            <span className={styles.outlookLabel}>{slot.label}</span>
            <span className={styles.outlookValue}>{slot.value}</span>
          </li>
        ))}
      </ul>

      <button type="button" className={styles.guide} onClick={onOpenMaskGuide}>
        <img className={styles.guideImage} src={heroImage} alt="" />
        <span className={styles.guideBar}>
          <img src={icons.shield} alt="" width={40} height={40} />
          <span className={styles.guideText}>
            <span className={styles.guideTitle}>Heading out?</span>
            <span className={styles.guideSubtitle}>Check today’s mask guide</span>
          </span>
          <img src={icons.forward} alt="" width={30} height={30} />
        </span>
      </button>
    </>
  )
}
