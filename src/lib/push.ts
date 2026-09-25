import { audienceLabel, loadPersonal } from './personal'
import type { Profile } from './profile'
import type { Settings } from './settings'

/*
 * Web push: the browser gives us a subscription (an endpoint plus keys), we
 * hand it to the server, and the server pushes messages to it even when the
 * app is closed. The server is the Netlify functions in netlify/functions.
 */

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
const SUBSCRIBE_URL = '/.netlify/functions/subscribe'
const UNSUBSCRIBE_URL = '/.netlify/functions/unsubscribe'

export type PushState = 'unsupported' | 'blocked' | 'off' | 'on'

/** Push needs a service worker, the Push API, and a key to authorise pushes. */
export function pushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    Boolean(VAPID_PUBLIC_KEY)
  )
}

/** VAPID keys travel as base64url; the browser wants raw bytes. */
function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded)
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)))
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  return navigator.serviceWorker.register('/sw.js', { scope: '/' })
}

export async function currentPushState(): Promise<PushState> {
  if (!pushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'blocked'
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  return subscription ? 'on' : 'off'
}

/**
 * What the server needs to decide whether a given phone should be alerted,
 * and how to word it. Only a short audience label goes over the wire — never
 * the health answers themselves.
 */
function preferences(profile: Profile, settings: Settings) {
  return {
    region: profile.region,
    persona: profile.persona,
    alertThreshold: settings.alertThreshold,
    unhealthyPsiAlert: settings.unhealthyPsiAlert,
    dailyDigest: settings.dailyDigest,
    audience: audienceLabel(loadPersonal()),
  }
}

/**
 * Asks permission, subscribes, and registers with the server. Returns the new
 * state so the caller can explain a refusal.
 */
export async function enablePush(profile: Profile, settings: Settings): Promise<PushState> {
  if (!pushSupported()) return 'unsupported'

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission === 'denied' ? 'blocked' : 'off'

  const registration = (await navigator.serviceWorker.getRegistration()) ?? (await registerServiceWorker())
  if (!registration) return 'unsupported'
  await navigator.serviceWorker.ready

  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
    }))

  await fetch(SUBSCRIBE_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ subscription, ...preferences(profile, settings) }),
  })

  return 'on'
}

/** Keeps the server's copy of the region and thresholds current. */
export async function syncPushPreferences(profile: Profile, settings: Settings) {
  if (!pushSupported()) return
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  if (!subscription) return

  await fetch(SUBSCRIBE_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ subscription, ...preferences(profile, settings) }),
  })
}

export async function disablePush() {
  if (!pushSupported()) return
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  if (!subscription) return

  await fetch(UNSUBSCRIBE_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  }).catch(() => {
    // Unsubscribing locally still stops the notifications reaching this phone.
  })
  await subscription.unsubscribe()
}
