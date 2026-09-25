import type { ReactNode } from 'react'
import { useIcons } from '../assets/icons'
import { useAirQuality } from '../lib/airQualityContext'
import { StaleNotice } from './StaleNotice'
import styles from './GuideLayout.module.css'

type Props = {
  title: string
  onBack: () => void
  children: ReactNode
}

/**
 * Full-screen guide with no nav bar, as designed. The body scrolls on its own
 * and keeps clear space at the bottom so the last item never sits on the edge.
 */
export function GuideLayout({ title, onBack, children }: Props) {
  const { isStale } = useAirQuality()
  const icons = useIcons()

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
          <img src={icons.backArrow} alt="" width={30} height={30} />
        </button>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.notice}>
          <StaleNotice />
        </div>
        {/* Advice based on old readings is dimmed, like the readings themselves. */}
        <div className={isStale ? styles.muted : undefined}>{children}</div>
      </div>
    </div>
  )
}
