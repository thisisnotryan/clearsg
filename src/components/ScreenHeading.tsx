import styles from './ScreenHeading.module.css'

type Props = {
  title: string
  subtitle: string
}

export function ScreenHeading({ title, subtitle }: Props) {
  return (
    <header className={styles.heading}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </header>
  )
}
