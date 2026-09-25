import heroImage from '../assets/figma/mask-guide-hero.png'
import { useIcons } from '../assets/icons'
import { VerdictCard } from '../components/VerdictCard'
import { getPersona } from '../data/personas'
import { bandKeyFor } from '../data/airQuality'
import { dashboardNote } from '../data/tailored'
import { getRegion } from '../data/regions'
import type { Profile } from '../lib/profile'
import { todayRange } from '../lib/trend'
import { useAirQuality } from '../lib/airQualityContext'
import { usePersonal } from '../lib/usePersonal'
import styles from './HomeScreen.module.css'

type Props = {
  profile: Profile
  onOpenSettings: () => void
  onOpenMaskGuide: () => void
  onOpenTrend: () => void
}

export function HomeScreen({ profile, onOpenSettings, onOpenMaskGuide, onOpenTrend }: Props) {
  const { current, history } = useAirQuality()
  const icons = useIcons()
  const personal = usePersonal()
  const region = getRegion(profile.region)
  // Which reading leads depends on who the app is for.
  const { metric, planning } = getPersona(profile.persona).emphasis
  const reading = current[profile.region][metric]
  // NEA publishes no forecast, so the strip shows now against today so far.
  const range = todayRange(history[metric], profile.region)
  const note = dashboardNote(personal, bandKeyFor(metric, reading))
  const outlook = [
    { label: 'Now', value: reading },
    { label: 'High today', value: range?.high ?? reading },
    { label: 'Low today', value: range?.low ?? reading },
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
        <VerdictCard metric={metric} value={reading} />
      </div>

      {note && <p className={styles.note}>{note}</p>}

      {/* For someone planning around the air, the strip opens the trend. */}
      <ul className={styles.outlook}>
        {outlook.map((slot) => (
          <li key={slot.label} className={styles.outlookCard}>
            {planning ? (
              <button type="button" className={styles.outlookButton} onClick={onOpenTrend}>
                <span className={styles.outlookLabel}>{slot.label}</span>
                <span className={styles.outlookValue}>{slot.value}</span>
              </button>
            ) : (
              <>
                <span className={styles.outlookLabel}>{slot.label}</span>
                <span className={styles.outlookValue}>{slot.value}</span>
              </>
            )}
          </li>
        ))}
      </ul>
      {planning && (
        <button type="button" className={styles.trendLink} onClick={onOpenTrend}>
          See the last 36 hours
        </button>
      )}

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
