import { useCallback, useEffect, useState } from 'react'
import { currentPushState, disablePush, enablePush, pushSupported, syncPushPreferences, type PushState } from './push'
import type { Profile } from './profile'
import type { Settings } from './settings'

/**
 * Keeps the phone's push subscription in step with the alert settings: on
 * when either alert is wanted, off when neither is, and re-registered
 * whenever the region or threshold changes.
 */
export function usePush(profile: Profile, settings: Settings) {
  const [state, setState] = useState<PushState>('off')
  const [busy, setBusy] = useState(false)

  const wanted = settings.unhealthyPsiAlert || settings.dailyDigest

  useEffect(() => {
    currentPushState().then(setState)
  }, [])

  // A live subscription needs to know the current region and threshold.
  useEffect(() => {
    if (state !== 'on') return
    syncPushPreferences(profile, settings).catch(() => {
      // The next change, or the next launch, tries again.
    })
  }, [state, profile, settings])

  /** Called after an alert toggle changes, to start or stop notifications. */
  const sync = useCallback(
    async (nextSettings: Settings) => {
      if (!pushSupported()) return
      const nextWanted = nextSettings.unhealthyPsiAlert || nextSettings.dailyDigest
      setBusy(true)
      try {
        if (nextWanted) {
          setState(await enablePush(profile, nextSettings))
        } else {
          await disablePush()
          setState('off')
        }
      } finally {
        setBusy(false)
      }
    },
    [profile],
  )

  return { state, busy, wanted, sync, supported: pushSupported() }
}
