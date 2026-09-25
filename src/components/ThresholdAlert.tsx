import { useState, type CSSProperties } from 'react'
import highImportanceIcon from '../assets/figma/high-importance.png'
import { BANDS, psiBand } from '../data/airQuality'
import { getRegion } from '../data/regions'
import { useAirQuality } from '../lib/airQualityContext'
import type { Profile } from '../lib/profile'
import { useSettings } from '../lib/useSettings'
import styles from './ThresholdAlert.module.css'

type Props = {
  profile: Profile
  onOpenGuide: () => void
}

/**
 * In-app warning when the reading passes the alert threshold from Settings.
 * This fires only while the app is open; notifications when it is closed
 * would need a server to watch NEA and push them.
 */
export function ThresholdAlert({ profile, onOpenGuide }: Props) {
  const { current, isStale } = useAirQuality()
  const { settings } = useSettings(profile.persona)
  const [dismissed, setDismissed] = useState(false)

  const psi = current[profile.region].psi24h
  const above = psi >= settings.alertThreshold

  // Once the air clears, arm the alert again for the next time it rises.
  const [wasAbove, setWasAbove] = useState(above)
  if (wasAbove !== above) {
    setWasAbove(above)
    if (!above) setDismissed(false)
  }

  if (!settings.unhealthyPsiAlert || !above || dismissed || isStale) return null

  const band = BANDS[psiBand(psi)]
  const region = getRegion(profile.region)

  return (
    <div className={styles.alert} style={{ '--band-fill': band.background, color: band.color } as CSSProperties} role="alert">
      <img src={highImportanceIcon} alt="" width={24} height={24} />
      <div className={styles.body}>
        <p className={styles.title}>
          PSI in {region.label} is {psi}
        </p>
        <p className={styles.detail}>Above your alert level of {settings.alertThreshold}. {band.advice}.</p>
        <div className={styles.actions}>
          <button type="button" className={styles.action} onClick={onOpenGuide}>
            What to do
          </button>
          <button type="button" className={styles.action} onClick={() => setDismissed(true)}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
