import { getStore } from '@netlify/blobs'
import webpush from 'web-push'

/*
 * Shared bits for the push functions: where subscriptions are kept, how a
 * push is sent, and how NEA's readings are fetched server-side.
 */

export type RegionId = 'north' | 'south' | 'east' | 'west' | 'central'

export type Subscriber = {
  subscription: webpush.PushSubscription
  region: RegionId
  persona: string
  alertThreshold: number
  unhealthyPsiAlert: boolean
  dailyDigest: boolean
  /** "your child", "your relative" — who the alert concerns, if anyone. */
  audience?: string | null
  /** Regions someone moves through, beyond the one they signed up in. */
  areas?: RegionId[]
  /** True while the reading is above the threshold, so one episode alerts once. */
  aboveThreshold?: boolean
  updatedAt: string
}

const STORE_NAME = 'push-subscribers'

export function subscribers() {
  return getStore({ name: STORE_NAME, consistency: 'strong' })
}

/** Endpoints are long URLs, so they are keyed by a hash of themselves. */
export async function keyFor(endpoint: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const contact = process.env.VAPID_CONTACT_EMAIL ?? 'example@example.com'
  if (!publicKey || !privateKey) throw new Error('VAPID keys are not configured')
  webpush.setVapidDetails(`mailto:${contact}`, publicKey, privateKey)
}

export type PushPayload = { title: string; body: string; url?: string; tag?: string }

/**
 * Sends one push. A 404 or 410 means the phone has unsubscribed, so the
 * record is dropped rather than retried forever.
 */
export async function sendPush(key: string, subscriber: Subscriber, payload: PushPayload) {
  try {
    await webpush.sendNotification(subscriber.subscription, JSON.stringify(payload))
    return true
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode
    if (status === 404 || status === 410) await subscribers().delete(key)
    else console.error('push failed', status, (error as Error).message)
    return false
  }
}

const PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi'

export type Readings = { psi: Record<RegionId, number>; timestamp: string }

/** Latest 24-hour PSI per region, straight from NEA. */
export async function fetchPsi(): Promise<Readings> {
  const response = await fetch(PSI_URL)
  if (!response.ok) throw new Error(`NEA request failed: ${response.status}`)
  const body = (await response.json()) as {
    code: number
    errorMsg?: string
    data?: { items?: { timestamp: string; readings: Record<string, Record<string, number>> }[] }
  }
  if (body.code !== 0) throw new Error(`NEA error: ${body.errorMsg ?? body.code}`)

  const item = body.data?.items?.[0]
  const block = item?.readings?.psi_twenty_four_hourly
  if (!item || !block) throw new Error('NEA response has no 24-hour PSI')

  const psi = {} as Record<RegionId, number>
  for (const region of ['north', 'south', 'east', 'west', 'central'] as RegionId[]) {
    if (typeof block[region] !== 'number') throw new Error(`NEA response has no PSI for ${region}`)
    psi[region] = Math.round(block[region])
  }
  return { psi, timestamp: item.timestamp }
}

/**
 * The region an alert should speak about: the worst of everywhere someone
 * told us they spend time, falling back to the region they signed up in.
 */
export function worstRegion(subscriber: Subscriber, psi: Record<RegionId, number>): RegionId {
  const watched = [subscriber.region, ...(subscriber.areas ?? [])]
  return watched.reduce((worst, region) => (psi[region] > psi[worst] ? region : worst), subscriber.region)
}

export function bandLabel(psi: number) {
  if (psi <= 50) return 'good'
  if (psi <= 100) return 'moderate'
  if (psi <= 200) return 'unhealthy'
  if (psi <= 300) return 'very unhealthy'
  return 'hazardous'
}

export const REGION_LABELS: Record<RegionId, string> = {
  north: 'the North',
  south: 'the South',
  east: 'the East',
  west: 'the West',
  central: 'Central',
}

/** Every stored subscriber, with its key. */
export async function allSubscribers(): Promise<{ key: string; value: Subscriber }[]> {
  const store = subscribers()
  const { blobs } = await store.list()
  const entries = await Promise.all(
    blobs.map(async ({ key }) => {
      const value = (await store.get(key, { type: 'json' })) as Subscriber | null
      return value ? { key, value } : null
    }),
  )
  return entries.filter((entry): entry is { key: string; value: Subscriber } => entry !== null)
}
