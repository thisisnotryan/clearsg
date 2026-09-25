import type { RegionId } from './profile'

/*
 * NEA's air quality readings, published through data.gov.sg.
 *
 * Two endpoints, matching the two readings the app keeps separate:
 *   psi  — 24-hour PSI, for planning ahead
 *   pm25 — 1-hour PM2.5, for right-now decisions
 *
 * Both report the same five regions the app uses, with the same names.
 * Docs: https://data.gov.sg/datasets?formats=API&topics=environment
 */
const PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi'
const PM25_URL = 'https://api-open.data.gov.sg/v2/real-time/api/pm25'
const REQUEST_TIMEOUT_MS = 10_000
const RETRY_DELAY_MS = 900

export type RegionValues = Record<RegionId, number>

type ApiItem = {
  timestamp: string
  readings: Record<string, Record<string, number>>
}

type ApiResponse = {
  code: number
  errorMsg?: string
  data?: { items?: ApiItem[] }
}

async function getJson(url: string, signal?: AbortSignal): Promise<ApiResponse> {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`NEA request failed: ${response.status}`)
  const body = (await response.json()) as ApiResponse
  if (body.code !== 0) throw new Error(`NEA error: ${body.errorMsg ?? body.code}`)
  return body
}

const REGIONS: RegionId[] = ['north', 'south', 'east', 'west', 'central']

/** Pulls one reading block into our shape, failing loudly if a region is absent. */
function toRegionValues(block: Record<string, number> | undefined, what: string): RegionValues {
  if (!block) throw new Error(`NEA response has no ${what}`)
  const values = {} as RegionValues
  for (const region of REGIONS) {
    const value = block[region]
    if (typeof value !== 'number') throw new Error(`NEA response has no ${what} for ${region}`)
    values[region] = Math.round(value)
  }
  return values
}

export type HistoryPoint = { timestamp: Date; values: RegionValues }

export type Histories = { psi24h: HistoryPoint[]; pm25_1h: HistoryPoint[] }

type Day = string

/*
 * Past days never change, so they are fetched once per session. Today's
 * readings are always re-fetched.
 */
const pastDayCache = new Map<string, HistoryPoint[]>()

function singaporeDate(date: Date): Day {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore' }).format(date)
}

const READING_KEYS: Record<Metric, string> = {
  psi24h: 'psi_twenty_four_hourly',
  pm25_1h: 'pm25_one_hourly',
}

export type Metric = 'psi24h' | 'pm25_1h'

/** One day of hourly readings for one metric. */
async function fetchDay(metric: Metric, date: Day, signal?: AbortSignal): Promise<HistoryPoint[]> {
  const url = metric === 'psi24h' ? PSI_URL : PM25_URL
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout
  let response
  try {
    response = await getJson(`${url}?date=${date}`, combined)
  } catch {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
    response = await getJson(`${url}?date=${date}`, combined)
  }

  const points: HistoryPoint[] = []
  for (const item of response.data?.items ?? []) {
    try {
      points.push({
        timestamp: new Date(item.timestamp),
        values: toRegionValues(item.readings[READING_KEYS[metric]], metric),
      })
    } catch {
      // Skip incomplete hours rather than dropping the whole day.
    }
  }
  return points
}

/**
 * Hourly readings for the last day or so, newest first, for both metrics.
 * The newest point is the current reading, so this one call covers the
 * dashboard, the map and the trend chart.
 *
 * Requests go one at a time: data.gov.sg rate-limits bursts, and four
 * parallel requests were enough to be refused.
 */
export async function fetchHistories(signal?: AbortSignal): Promise<Histories> {
  const today = singaporeDate(new Date())
  const yesterday = singaporeDate(new Date(Date.now() - 86_400_000))
  const result = {} as Histories

  for (const metric of ['psi24h', 'pm25_1h'] as Metric[]) {
    const cacheKey = `${metric}:${yesterday}`
    const points = await fetchDay(metric, today, signal)
    let earlier = pastDayCache.get(cacheKey)
    if (!earlier) {
      earlier = await fetchDay(metric, yesterday, signal)
      if (earlier.length) pastDayCache.set(cacheKey, earlier)
    }
    result[metric] = [...points, ...earlier].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  if (!result.psi24h.length || !result.pm25_1h.length) throw new Error('NEA returned no readings')
  return result
}
