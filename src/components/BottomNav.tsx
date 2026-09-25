import { useIcons, type IconSet } from '../assets/icons'
import styles from './BottomNav.module.css'

export type Tab = 'home' | 'forecast' | 'map' | 'settings'

const TABS: { id: Tab; label: string; icon: keyof IconSet; iconActive: keyof IconSet }[] = [
  { id: 'home', label: 'Home', icon: 'navHome', iconActive: 'navHomeActive' },
  { id: 'forecast', label: 'Forecast', icon: 'navStats', iconActive: 'navStatsActive' },
  { id: 'map', label: 'Live map', icon: 'navLocation', iconActive: 'navLocationActive' },
  { id: 'settings', label: 'Settings', icon: 'navSettings', iconActive: 'navSettingsActive' },
]

type Props = {
  active: Tab
  onChange: (tab: Tab) => void
}

export function BottomNav({ active, onChange }: Props) {
  const icons = useIcons()

  return (
    <nav className={styles.nav} aria-label="Main">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={styles.tab}
          aria-label={tab.label}
          aria-current={active === tab.id ? 'page' : undefined}
          onClick={() => onChange(tab.id)}
        >
          <img src={icons[active === tab.id ? tab.iconActive : tab.icon] as string} alt="" width={40} height={40} />
        </button>
      ))}
    </nav>
  )
}
