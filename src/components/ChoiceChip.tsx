import styles from './ChoiceChip.module.css'

type Props = {
  label: string
  selected: boolean
  /** Multi-select chips behave as checkboxes, single-select as radios. */
  multi?: boolean
  onSelect: () => void
}

/** Pill that sizes to its label, for the "tell us more" questions. */
export function ChoiceChip({ label, selected, multi, onSelect }: Props) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      className={`${styles.chip} ${selected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      {label}
    </button>
  )
}
