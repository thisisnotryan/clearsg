import { useEffect, useState } from 'react'

/*
 * Installing ClearSG to the home screen. Chrome fires `beforeinstallprompt`,
 * which we hold on to so the app can offer its own button. Safari has no
 * equivalent, so iPhone users are told where the option lives instead.
 */

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function standalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS reports it here rather than through display-mode.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function useInstall() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(standalone)

  useEffect(() => {
    const onPrompt = (event: Event) => {
      // Keep the event so the button can trigger it later.
      event.preventDefault()
      setPromptEvent(event as InstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setPromptEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    // A dismissed prompt can't be reused; Chrome will offer it again later.
    setPromptEvent(null)
    if (outcome === 'accepted') setInstalled(true)
  }

  return {
    installed,
    canInstall: Boolean(promptEvent),
    /** iPhones install from the Share menu, so they need instructions. */
    needsIosInstructions: isIos() && !installed,
    install,
  }
}
