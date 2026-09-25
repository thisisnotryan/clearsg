import { useIcons, type IconSet } from '../assets/icons'
import { GuideLayout } from '../components/GuideLayout'
import type { CSSProperties } from 'react'
import { BANDS, psiBand, type Band } from '../data/airQuality'
import { MASK_GUIDANCE, MASK_NOTE, MASK_TIPS } from '../data/guidance'
import { maskTip } from '../data/tailored'
import type { Profile } from '../lib/profile'
import { useAirQuality } from '../lib/airQualityContext'
import { usePersonal } from '../lib/usePersonal'
import styles from './MaskGuideScreen.module.css'

/*
 * One icon per tip, in the order drawn in the design. A tip tailored to the
 * person goes first and carries the shield, so the pairing still holds.
 */
const TIP_ICONS: (keyof IconSet)[] = ['slider', 'refresh30', 'highImportance']
/** The refresh glyph is mirrored in the design. */
const FLIPPED_ICON: keyof IconSet = 'refresh30'

// The shield comes in three colourways; the two worst bands reuse the red one.
const SHIELD_ICONS: Record<Band, keyof IconSet> = {
  good: 'protectGood',
  moderate: 'protectModerate',
  unhealthy: 'protectUnhealthy',
  veryUnhealthy: 'protectUnhealthy',
  hazardous: 'protectUnhealthy',
}

type Props = {
  profile: Profile
  onBack: () => void
  onOpenSafetyGuide: () => void
}

export function MaskGuideScreen({ profile, onBack, onOpenSafetyGuide }: Props) {
  const { current } = useAirQuality()
  const icons = useIcons()
  const personal = usePersonal()
  // Their own circumstances first, then the general advice.
  const tailored = maskTip(personal)
  const tips = [
    ...(tailored ? [{ text: tailored, icon: 'protectModerate' as keyof IconSet }] : []),
    ...MASK_TIPS.map((text, index) => ({ text, icon: TIP_ICONS[index] })),
  ]
  const psi = current[profile.region].psi24h
  const bandKey = psiBand(psi)
  const band = BANDS[bandKey]
  const guidance = MASK_GUIDANCE[bandKey]

  return (
    <GuideLayout title="Mask guide" onBack={onBack}>
      <p className={styles.psiPill} style={{ '--band-solid': band.solid } as CSSProperties}>
        <img src={icons.radar} alt="" width={30} height={30} />
        Today’s PSI: {psi}, {band.label}
      </p>

      <section
        className={styles.recommendation}
        style={{ '--band-fill': band.background, color: band.color } as CSSProperties}
      >
        <img src={icons[SHIELD_ICONS[bandKey]] as string} alt="" width={40} height={40} />
        <h2 className={styles.recommendationTitle}>{guidance.title}</h2>
        <p className={styles.recommendationDetail}>{guidance.detail}</p>
      </section>

      <p className={styles.note}>{MASK_NOTE}</p>

      <ul className={styles.tips}>
        {tips.map((tip) => (
          <li key={tip.text} className={styles.tip}>
            <img
              className={tip.icon === FLIPPED_ICON ? styles.tipIconFlipped : styles.tipIcon}
              src={icons[tip.icon] as string}
              alt=""
              width={30}
              height={30}
            />
            {tip.text}
          </li>
        ))}
      </ul>

      <button type="button" className={styles.fullGuide} onClick={onOpenSafetyGuide}>
        View full safety guide
      </button>
    </GuideLayout>
  )
}
