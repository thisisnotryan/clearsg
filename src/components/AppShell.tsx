import type { ReactNode } from 'react'
import { useAirQuality } from '../lib/airQualityContext'
import { BottomNav, type Tab } from './BottomNav'
import { StaleNotice } from './StaleNotice'
import styles from './AppShell.module.css'

type Props = {
  tab: Tab
  onTabChange: (tab: Tab) => void
  /** Notices shown above the screen, never muted. */
  banner?: ReactNode
  children: ReactNode
}

/** Screen frame shared by every tab: scrolling content above a fixed nav bar. */
export function AppShell({ tab, onTabChange, banner, children }: Props) {
  const { isStale } = useAirQuality()

  return (
    <div className={styles.shell}>
      <div className={styles.content}>
        {banner}
        <StaleNotice />
        {/* Old readings are dimmed so they don't read as current. */}
        <div className={isStale ? styles.muted : undefined}>{children}</div>
      </div>
      <div className={styles.navWrap}>
        <BottomNav active={tab} onChange={onTabChange} />
      </div>
    </div>
  )
}
