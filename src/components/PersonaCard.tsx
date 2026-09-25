import type { Persona } from '../data/personas'
import styles from './PersonaCard.module.css'

type Props = {
  persona: Persona
  selected: boolean
  onSelect: () => void
}

export function PersonaCard({ persona, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      <span className={styles.icon}>
        <img
          src={selected ? persona.iconSelected : persona.icon}
          alt=""
          width={persona.iconSize.width}
          height={persona.iconSize.height}
        />
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{persona.title}</span>
        <span className={styles.description}>{persona.description}</span>
      </span>
    </button>
  )
}
