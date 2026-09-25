import type { HistoryPoint } from './nea'
import type { RegionId } from './profile'

/** How far back the trend chart looks, oldest first. */
export const TREND_HOURS_AGO = [36, 24, 12, 6, 0]

export function trendLabel(hoursAgo: number) {
  return hoursAgo === 0 ? 'Now' : `${hoursAgo}h ago`
}

const HOUR_MS = 60 * 60 * 1000
/** NEA publishes hourly, so anything further off than this is a gap. */
const MATCH_TOLERANCE_MS = 90 * 60 * 1000

/** The reading nearest to a given number of hours ago, or null if there is none. */
export function readingAt(points: HistoryPoint[], region: RegionId, hoursAgo: number, now = Date.now()) {
  const target = now - hoursAgo * HOUR_MS
  let best: { value: number; distance: number } | null = null
  for (const point of points) {
    const distance = Math.abs(point.timestamp.getTime() - target)
    if (distance > MATCH_TOLERANCE_MS) continue
    if (!best || distance < best.distance) best = { value: point.values[region], distance }
  }
  return best?.value ?? null
}

export type TrendPoint = { label: string; value: number | null }

export function buildTrend(points: HistoryPoint[], region: RegionId, now = Date.now()): TrendPoint[] {
  return TREND_HOURS_AGO.map((hoursAgo) => ({
    label: trendLabel(hoursAgo),
    value: readingAt(points, region, hoursAgo, now),
  }))
}

/** Highest and lowest readings so far today, in Singapore time. */
export function todayRange(points: HistoryPoint[], region: RegionId, now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore' })
  const today = formatter.format(now)
  const values = points.filter((point) => formatter.format(point.timestamp) === today).map((point) => point.values[region])
  if (!values.length) return null
  return { high: Math.max(...values), low: Math.min(...values) }
}
