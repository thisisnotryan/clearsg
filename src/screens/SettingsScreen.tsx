import { useIcons } from '../assets/icons'
import { ProfileCards } from '../components/ProfileCard'
import { PsiThresholdSelect } from '../components/PsiThresholdSelect'
import { Toggle } from '../components/Toggle'
import type { Profile } from '../lib/profile'
import { useInstall } from '../lib/useInstall'
import { savePersonal, type PersonalProfile } from '../lib/personal'
import { syncPushPreferences } from '../lib/push'
import { usePersonal } from '../lib/usePersonal'
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
  const installer = useInstall()
  const personal = usePersonal()

  /*
   * Adding or removing a person can change who an alert is about, so the
   * server's copy of the audience label is refreshed too.
   */
  const updatePersonal = (next: PersonalProfile) => {
    savePersonal(next)
    void syncPushPreferences(profile, settings)
  }

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

      <ProfileCards profile={profile} personal={personal} onEdit={onEditProfile} onChange={updatePersonal} />

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
        <span className={styles.rowText}>
          <span className={styles.rowLabel}>Daily forecast digest</span>
          <span className={styles.rowCaption}>Sent every morning at 7am (SGT)</span>
        </span>
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

      {/* Installing puts ClearSG on the home screen, with notifications. */}
      {installer.canInstall && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>Install ClearSG</span>
          <button type="button" className={styles.install} onClick={() => void installer.install()}>
            Install
          </button>
        </div>
      )}
      {!installer.canInstall && installer.needsIosInstructions && (
        <p className={styles.pushNote}>
          To install ClearSG, tap Share in Safari, then “Add to Home Screen”. Notifications work once it is
          installed.
        </p>
      )}

      {/* One switch for the theme: left is dark, right is light. */}
      <div className={styles.row}>
        <span className={styles.rowLabel}>Dark/Light mode</span>
        <Toggle checked={settings.lightMode} label="Light mode" onChange={(checked) => update({ lightMode: checked })} />
      </div>

      <button type="button" className={styles.signOut} onClick={onSignOut}>
        <img src={icons.logout} alt="" width={30} height={30} />
        Sign out
      </button>

      {/* data.gov.sg asks that its data be credited where it is used. */}
      <p className={styles.credit}>
        Air quality data from NEA via{' '}
        <a className={styles.creditLink} href="https://data.gov.sg" target="_blank" rel="noreferrer">
          data.gov.sg
        </a>
      </p>
    </>
  )
}
