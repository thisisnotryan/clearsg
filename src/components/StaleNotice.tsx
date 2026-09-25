import { useIcons } from '../assets/icons'
import { formatUpdatedAt } from '../data/airQuality'
import { useAirQuality } from '../lib/airQualityContext'
import styles from './StaleNotice.module.css'

/** Says the readings on screen are old, and offers to try NEA again. */
export function StaleNotice() {
  const { isStale, loading, updatedAt, source, refresh } = useAirQuality()
  const icons = useIcons()
  if (!isStale) return null

  return (
    <div className={styles.notice} role="status">
      <span className={styles.text}>
        {source === 'fallback' && !loading
          ? 'Can’t reach NEA — showing the last known reading'
          : `Last known reading · ${formatUpdatedAt(updatedAt).replace('Updated ', '')}`}
      </span>
      <button type="button" className={styles.retry} onClick={refresh} disabled={loading}>
        <img src={icons.refresh} alt="" width={16} height={16} />
        {loading ? 'Checking…' : 'Retry'}
      </button>
    </div>
  )
}
