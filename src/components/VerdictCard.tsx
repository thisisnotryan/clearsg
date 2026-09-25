import type { CSSProperties } from 'react'
import { bandFor, type Metric } from '../data/airQuality'
import styles from './VerdictCard.module.css'

type Props = {
  metric: Metric
  value: number
}

/** The colour-coded verdict, reused wherever a headline reading is shown. */
export function VerdictCard({ metric, value }: Props) {
  const band = bandFor(metric, value)
  const unit = metric === 'psi24h' ? 'PSI' : 'PM2.5'

  return (
    <section className={styles.card} style={{ '--band-fill': band.background, color: band.color } as CSSProperties}>
      <p className={styles.label}>
        {unit}, {band.label}
      </p>
      <p className={styles.value}>{value}</p>
      <p className={styles.advice}>{band.advice}</p>
    </section>
  )
}
