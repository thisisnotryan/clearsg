import { keyFor, subscribers, type RegionId, type Subscriber } from './_shared'

const REGIONS: RegionId[] = ['north', 'south', 'east', 'west', 'central']

/** Stores (or updates) one phone's subscription and its alert preferences. */
export default async function handler(request: Request) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  let body: Partial<Subscriber> & { subscription?: { endpoint?: string } }
  try {
    body = await request.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const endpoint = body.subscription?.endpoint
  if (!endpoint || !body.subscription) return new Response('Missing subscription', { status: 400 })
  if (!body.region || !REGIONS.includes(body.region)) return new Response('Missing region', { status: 400 })

  const key = await keyFor(endpoint)
  const store = subscribers()
  const existing = (await store.get(key, { type: 'json' })) as Subscriber | null

  const record: Subscriber = {
    subscription: body.subscription as Subscriber['subscription'],
    region: body.region,
    persona: body.persona ?? 'myself',
    alertThreshold: Number(body.alertThreshold) || 51,
    unhealthyPsiAlert: body.unhealthyPsiAlert !== false,
    dailyDigest: Boolean(body.dailyDigest),
    audience: typeof body.audience === 'string' ? body.audience.slice(0, 40) : null,
    /*
     * Keep the episode state so a settings change doesn't re-alert — unless
     * the level itself moved, in which case the old state means nothing and
     * would fire a bogus "air has cleared".
     */
    aboveThreshold:
      existing && existing.alertThreshold === (Number(body.alertThreshold) || 51)
        ? (existing.aboveThreshold ?? false)
        : false,
    updatedAt: new Date().toISOString(),
  }

  await store.setJSON(key, record)
  return Response.json({ ok: true })
}

