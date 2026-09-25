import { useEffect } from 'react'
import appLogo from '../assets/figma/app-logo.svg'
import styles from './SplashScreen.module.css'

const SPLASH_DURATION_MS = 1400

type Props = {
  onDone: () => void
}

export function SplashScreen({ onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, SPLASH_DURATION_MS)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className={styles.screen}>
      <img className={styles.logo} src={appLogo} alt="" width={328} height={328} />
      <h1 className={styles.name}>ClearSG</h1>
    </div>
  )
}
