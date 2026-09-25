import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useIcons } from '../assets/icons'
import {
  CUSTOM_THRESHOLD_MAX,
  CUSTOM_THRESHOLD_MIN,
  CUSTOM_THRESHOLD_STEP,
  THRESHOLD_OPTIONS,
  thresholdLabel,
} from '../lib/settings'
import styles from './PsiThresholdSelect.module.css'

type Props = {
  value: number
  onChange: (value: number) => void
}

const clamp = (value: number) => Math.min(CUSTOM_THRESHOLD_MAX, Math.max(CUSTOM_THRESHOLD_MIN, value))

/*
 * The panel must stay inside the scrolling area, not just the window: below
 * it sits the nav bar, which would cover the last option.
 */
function visibleBounds(element: HTMLElement) {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const overflowY = getComputedStyle(parent).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') {
      const rect = parent.getBoundingClientRect()
      return { top: rect.top, bottom: rect.bottom }
    }
  }
  return { top: 0, bottom: window.innerHeight }
}

/**
 * Alert level: the three points where NEA's bands change, plus a custom
 * level for anything in between. The open panel floats above the rest of
 * the screen rather than pushing it down.
 */
export function PsiThresholdSelect({ value, onChange }: Props) {
  const icons = useIcons()
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(false)
  // Held as text so a half-typed or empty value doesn't fight the user.
  const [draft, setDraft] = useState(String(value))
  const draftNumber = Number(draft)
  const draftValue = Number.isFinite(draftNumber) && draft.trim() !== '' ? draftNumber : value
  const [placement, setPlacement] = useState<'below' | 'above'>('below')
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const close = () => {
    setOpen(false)
    setCustom(false)
  }

  // Open upwards when the panel would run off the bottom of the screen.
  useLayoutEffect(() => {
    if (!open || !containerRef.current || !panelRef.current) return
    const trigger = containerRef.current.getBoundingClientRect()
    const panelHeight = panelRef.current.offsetHeight
    const bounds = visibleBounds(containerRef.current)
    const spaceBelow = bounds.bottom - trigger.bottom
    const spaceAbove = trigger.top - bounds.top
    setPlacement(spaceBelow < panelHeight + 16 && spaceAbove > panelHeight + 16 ? 'above' : 'below')
  }, [open, custom])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const selectBand = (option: number) => {
    onChange(option)
    close()
  }

  const saveCustom = () => {
    onChange(clamp(draftValue))
    close()
  }

  const stepBy = (amount: number) => setDraft(String(clamp(draftValue + amount)))

  return (
    <div ref={containerRef} className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Alert level: ${thresholdLabel(value)}`}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {thresholdLabel(value)}
        <img className={open ? styles.arrowOpen : styles.arrow} src={icons.dropdownArrow} alt="" width={20} height={20} />
      </button>

      {open && (
        <div ref={panelRef} className={`${styles.panel} ${placement === 'above' ? styles.panelAbove : ''}`}>
          {custom ? (
            <div className={styles.custom}>
              <p className={styles.customTitle}>Custom level</p>
              <div className={styles.stepper}>
                <button
                  type="button"
                  className={styles.step}
                  aria-label="Lower by 10"
                  disabled={draftValue <= CUSTOM_THRESHOLD_MIN}
                  onClick={() => stepBy(-CUSTOM_THRESHOLD_STEP)}
                >
                  −
                </button>
                <input
                  className={styles.customValue}
                  type="number"
                  inputMode="numeric"
                  aria-label="Custom PSI level"
                  min={CUSTOM_THRESHOLD_MIN}
                  max={CUSTOM_THRESHOLD_MAX}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onBlur={() => setDraft(String(clamp(draftValue)))}
                />
                <button
                  type="button"
                  className={styles.step}
                  aria-label="Raise by 10"
                  disabled={draftValue >= CUSTOM_THRESHOLD_MAX}
                  onClick={() => stepBy(CUSTOM_THRESHOLD_STEP)}
                >
                  +
                </button>
              </div>
              <p className={styles.customHint}>
                PSI {CUSTOM_THRESHOLD_MIN}–{CUSTOM_THRESHOLD_MAX}
              </p>
              <div className={styles.customActions}>
                <button type="button" className={styles.customAction} onClick={() => setCustom(false)}>
                  Back
                </button>
                <button type="button" className={styles.customAction} onClick={saveCustom}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <ul className={styles.list} role="listbox" aria-label="Alert level">
              {THRESHOLD_OPTIONS.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === option.value}
                    className={`${styles.option} ${value === option.value ? styles.optionSelected : ''}`}
                    onClick={() => selectBand(option.value)}
                  >
                    <span>{option.label}</span>
                    <span className={styles.optionValue}>{option.value}+</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className={styles.option}
                  onClick={() => {
                    setDraft(String(value))
                    setCustom(true)
                  }}
                >
                  <span>Custom…</span>
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
