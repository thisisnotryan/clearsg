import { useIcons } from '../assets/icons'
import styles from './Toggle.module.css'

type Props = {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}

export function Toggle({ checked, label, onChange }: Props) {
  const icons = useIcons()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={styles.toggle}
      onClick={() => onChange(!checked)}
    >
      <img src={checked ? icons.toggleOn : icons.toggleOff} alt="" width={70} height={35} />
    </button>
  )
}
