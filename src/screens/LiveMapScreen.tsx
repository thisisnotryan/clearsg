import { useMemo } from 'react'
import { useIcons } from '../assets/icons'
import { LiveMap } from '../components/LiveMap'
import { ScreenHeading } from '../components/ScreenHeading'
import { bandFor, compareToNational, formatUpdatedAt } from '../data/airQuality'
import { getRegion } from '../data/regions'
import type { Profile } from '../lib/profile'
import { useAirQuality } from '../lib/airQualityContext'
import { coveredRegions } from '../lib/personal'
import { usePersonal } from '../lib/usePersonal'
import styles from './LiveMapScreen.module.css'

type Props = {
  profile: Profile
  onBack: () => void
  onOpenSafetyGuide: () => void
}

/** Live 1-hour PM2.5, for in-the-moment decisions. */
export function LiveMapScreen({ profile, onBack, onOpenSafetyGuide }: Props) {
  const { current, updatedAt, source, refresh } = useAirQuality()
  const icons = useIcons()
  // Someone who told us the areas they cover sees them pinned here. Held
  // steady so the map isn't torn down and rebuilt on every render.
  const personal = usePersonal()
  const covered = useMemo(() => coveredRegions(personal), [personal])
  const legend = [
    { icon: icons.legendGood, label: 'Good' },
    { icon: icons.legendModerate, label: 'Moderate' },
    { icon: icons.legendUnhealthy, label: 'Unhealthy' },
  ]
  const region = getRegion(profile.region)
  const value = current[profile.region].pm25_1h
  const band = bandFor('pm25_1h', value)
  const comparison = compareToNational(current, 'pm25_1h', value)
  const updated = formatUpdatedAt(updatedAt)

  return (
    <>
      <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
        <img src={icons.backArrow} alt="" width={30} height={30} />
      </button>

      <ScreenHeading title="Live now" subtitle={updated} />

      <div className={styles.map}>
        <LiveMap readings={current} metric="pm25_1h" region={profile.region} pinned={covered} />
      </div>

      <ul className={styles.legend}>
        {legend.map((item) => (
          <li key={item.label} className={styles.legendItem}>
            <img src={item.icon} alt="" width={18} height={18} />
            {item.label}
          </li>
        ))}
      </ul>

      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <img src={icons.pinSmall} alt="" width={25} height={25} />
          <h2 className={styles.cardTitle}>You’re in {region.label}</h2>
          <span className={styles.livePill}>
            <img src={icons.liveDot} alt="" width={7} height={7} />
            Live
          </span>
        </header>

        <p className={styles.reading}>
          <span className={styles.readingValue}>{value}</span>
          <span className={styles.readingUnit}>
            µg/m³ PM2.5
            <br />
            {band.label.charAt(0).toUpperCase() + band.label.slice(1)}
          </span>
        </p>

        <p className={styles.comparison}>
          <img src={comparison.percent < 0 ? icons.trendDown : icons.trendUp} alt="" width={20} height={20} />
          {comparison.text}
        </p>

        <footer className={styles.cardFooter}>
          <button type="button" className={styles.refresh} onClick={refresh} aria-label="Refresh readings">
            <img src={icons.refresh} alt="" width={20} height={20} />
          </button>
          <span className={styles.updated}>
            {source === 'live' ? updated : 'Last known reading — not live'}
          </span>
          <button type="button" className={styles.safetyGuide} onClick={onOpenSafetyGuide}>
            Safety guide
            <img src={icons.forwardSmall} alt="" width={20} height={20} />
          </button>
        </footer>
      </section>
    </>
  )
}
