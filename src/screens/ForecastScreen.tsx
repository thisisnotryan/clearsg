import { useState } from 'react'
import { useIcons } from '../assets/icons'
import { ScreenHeading } from '../components/ScreenHeading'
import { bandFor, METRIC_LABELS, type Metric } from '../data/airQuality'
import { REGIONS, getRegion } from '../data/regions'
import type { Profile } from '../lib/profile'
import { buildTrend } from '../lib/trend'
import { useAirQuality } from '../lib/airQualityContext'
import styles from './ForecastScreen.module.css'

const METRICS: Metric[] = ['psi24h', 'pm25_1h']
const MAX_BAR_HEIGHT = 123

type Props = {
  profile: Profile
  onBack: () => void
}

export function ForecastScreen({ profile, onBack }: Props) {
  const [metric, setMetric] = useState<Metric>('psi24h')
  const { current, history } = useAirQuality()
  const icons = useIcons()
  const region = getRegion(profile.region)
  // NEA publishes readings, not a forecast, so this is the recent past.
  const trend = buildTrend(history[metric], profile.region)
  const peak = Math.max(1, ...trend.map((point) => point.value ?? 0))

  return (
    <>
      <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
        <img src={icons.backArrow} alt="" width={30} height={30} />
      </button>

      <ScreenHeading title="Recent trend" subtitle={`${region.label}, Singapore`} />

      <div className={styles.toggle} role="tablist" aria-label="Reading type">
        {METRICS.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={metric === option}
            className={`${styles.toggleOption} ${metric === option ? styles.toggleSelected : ''}`}
            onClick={() => setMetric(option)}
          >
            {METRIC_LABELS[option]}
          </button>
        ))}
      </div>

      <ul className={styles.chart}>
        {trend.map((point) => (
          <li key={point.label} className={styles.column}>
            {/* Fixed-height area so every bar sits on the same baseline,
                whatever the label below does. */}
            <span className={styles.barArea}>
              {point.value === null ? (
                <span className={styles.barMissing} title={`${point.label}: no reading`} />
              ) : (
                <span
                  className={styles.bar}
                  style={{
                    height: `${(point.value / peak) * MAX_BAR_HEIGHT}px`,
                    background: bandFor(metric, point.value).solid,
                  }}
                  title={`${point.label}: ${point.value}`}
                />
              )}
            </span>
            <span className={styles.columnLabel}>{point.label}</span>
          </li>
        ))}
      </ul>

      <h2 className={styles.sectionTitle}>By region</h2>
      <ul className={styles.regions}>
        {REGIONS.map((r) => {
          const value = current[r.id][metric]
          return (
            <li key={r.id} className={styles.regionRow}>
              <span className={styles.regionName}>{r.label}</span>
              <span className={styles.regionValue} style={{ color: bandFor(metric, value).color }}>
                {value}
              </span>
            </li>
          )
        })}
      </ul>
    </>
  )
}
