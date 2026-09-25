import appLogo from '../assets/figma/app-logo.svg'
import { OnboardingLayout } from '../components/OnboardingLayout'
import styles from './WelcomeScreen.module.css'

type Props = {
  onNext: () => void
}

export function WelcomeScreen({ onNext }: Props) {
  return (
    <OnboardingLayout step={1} actionLabel="Get started" onAction={onNext}>
      <img className={styles.logo} src={appLogo} alt="ClearSG" width={328} height={328} />
      <h1 className={styles.headline}>
        Know your air,
        <br />
        breathe easier
      </h1>
      <p className={styles.tagline}>Real-time haze tracking and tips made for Singapore.</p>
    </OnboardingLayout>
  )
}
