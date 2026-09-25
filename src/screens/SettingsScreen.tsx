import { useIcons } from '../assets/icons'
import { PsiThresholdSelect } from '../components/PsiThresholdSelect'
import { Toggle } from '../components/Toggle'
import { getPersona } from '../data/personas'
import { getRegion } from '../data/regions'
import type { Profile } from '../lib/profile'
import { usePush } from '../lib/usePush'
import type { Settings } from '../lib/settings'
import { useSettings } from '../lib/useSettings'
import styles from './SettingsScreen.module.css'

/** Why notifications aren't arriving, in plain language. */
const PUSH_NOTES: Record<string, string> = {
  unsupported:
    'This browser can’t send notifications. On iPhone, add ClearSG to your home screen first; alerts still show while the app is open.',
  blocked: 'Notifications are blocked for ClearSG in your browser settings. Allow them there to get alerts.',
  off: 'Allow notifications when asked, and alerts will arrive even when ClearSG is closed.',
}

type Props = {
  profile: Profile
  onBack: () => void
  onEditProfile: () => void
  onSignOut: () => void
}

export function SettingsScreen({ profile, onBack, onEditProfile, onSignOut }: Props) {
  const { settings, update } = useSettings(profile.persona)
  const icons = useIcons()
  const push = usePush(profile, settings)
  const persona = getPersona(profile.persona)
  const region = getRegion(profile.region)

  /* Alert switches drive the phone's push subscription as well as the setting. */
  const updateAlerts = (changes: Partial<Settings>) => {
    const next = { ...settings, ...changes }
    update(changes)
    void push.sync(next)
  }

  return (
    <>
      <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
        <img src={icons.backArrow} alt="" width={30} height={30} />
      </button>

      <h1 className={styles.title}>Settings</h1>

      <section className={styles.profile}>
        <span className={styles.avatar}>
          <img
            src={persona.iconSelected}
            alt=""
            width={persona.iconSize.width * 0.9}
            height={persona.iconSize.height * 0.9}
          />
        </span>
        <span className={styles.profileText}>
          <span className={styles.profileName}>{persona.title}</span>
          <span className={styles.profileRegion}>{region.label}, Singapore</span>
        </span>
        <button type="button" className={styles.edit} onClick={onEditProfile}>
          Edit
        </button>
      </section>

      <h2 className={styles.sectionLabel}>Alerts</h2>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Unhealthy PSI alert</span>
        <Toggle
          checked={settings.unhealthyPsiAlert}
          label="Unhealthy PSI alert"
          onChange={(checked) => updateAlerts({ unhealthyPsiAlert: checked })}
        />
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Daily forecast digest</span>
        <Toggle
          checked={settings.dailyDigest}
          label="Daily forecast digest"
          onChange={(checked) => updateAlerts({ dailyDigest: checked })}
        />
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>Alert threshold</span>
        <PsiThresholdSelect value={settings.alertThreshold} onChange={(value) => update({ alertThreshold: value })} />
      </div>

      {push.wanted && push.state !== 'on' && (
        <p className={styles.pushNote}>{PUSH_NOTES[push.supported ? push.state : 'unsupported']}</p>
      )}

      <hr className={styles.divider} />

      <h2 className={styles.sectionLabel}>Preferences</h2>

      {/* One switch for the theme: left is dark, right is light. */}
      <div className={styles.row}>
        <span className={styles.rowLabel}>Dark/Light mode</span>
        <Toggle checked={settings.lightMode} label="Light mode" onChange={(checked) => update({ lightMode: checked })} />
      </div>

      <button type="button" className={styles.signOut} onClick={onSignOut}>
        <img src={icons.logout} alt="" width={30} height={30} />
        Sign out
      </button>
    </>
  )
}
