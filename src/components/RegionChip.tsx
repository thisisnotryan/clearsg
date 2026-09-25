import styles from './RegionChip.module.css'

type Props = {
  label: string
  selected: boolean
  onSelect: () => void
}

export function RegionChip({ label, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`${styles.chip} ${selected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      {label}
    </button>
  )
}
