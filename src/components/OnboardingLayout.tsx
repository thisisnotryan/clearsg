import type { ReactNode } from 'react'
import { useIcons } from '../assets/icons'
import styles from './OnboardingLayout.module.css'

type Props = {
  step: 1 | 2 | 3
  actionLabel: string
  onAction: () => void
  actionDisabled?: boolean
  onBack?: () => void
  children: ReactNode
}

export function OnboardingLayout({ step, actionLabel, onAction, actionDisabled, onBack, children }: Props) {
  const icons = useIcons()

  return (
    <div className={styles.screen}>
      {onBack && (
        <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
          <img src={icons.backArrow} alt="" width={30} height={30} />
        </button>
      )}

      <main className={styles.content}>{children}</main>

      <footer className={styles.footer}>
        <button type="button" className={styles.action} onClick={onAction} disabled={actionDisabled}>
          {actionLabel}
        </button>
        <img
          className={styles.dots}
          src={icons.dots[step - 1]}
          width={54}
          height={12}
          alt={`Step ${step} of ${icons.dots.length}`}
        />
      </footer>
    </div>
  )
}
