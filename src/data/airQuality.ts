import type { RegionId } from '../lib/profile'

// The two readings the app keeps separate, as in the brief:
// 24-hour PSI for planning ahead, 1-hour PM2.5 for right-now decisions.
export type Metric = 'psi24h' | 'pm25_1h'

export type Band = 'good' | 'moderate' | 'unhealthy' | 'veryUnhealthy' | 'hazardous'

export type BandStyle = {
  /** Number and label colour. */
  color: string
  /** Card fill behind that colour (dark mode only; light cards are white). */
  background: string
  /** Filled bars and pills, in both themes. */
  solid: string
  label: string
  advice: string
}

/*
 * Each band points at CSS variables so the same styles work in both themes;
 * the values live in src/index.css. The two most severe bands are not
 * designed yet and are extrapolated from the others.
 */
export const BANDS: Record<Band, BandStyle> = {
  good: {
    color: 'var(--band-good-text)',
    background: 'var(--band-good-fill)',
    solid: 'var(--band-good-solid)',
    label: 'good',
    advice: 'Air is clear — normal outdoor activities are fine',
  },
  moderate: {
    color: 'var(--band-moderate-text)',
    background: 'var(--band-moderate-fill)',
    solid: 'var(--band-moderate-solid)',
    label: 'moderate',
    advice: 'Sensitive groups should limit outdoor time',
  },
  unhealthy: {
    color: 'var(--band-unhealthy-text)',
    background: 'var(--band-unhealthy-fill)',
    solid: 'var(--band-unhealthy-solid)',
    label: 'unhealthy',
    advice: 'Cut down outdoor activity and wear a mask outside',
  },
  veryUnhealthy: {
    color: 'var(--band-veryUnhealthy-text)',
    background: 'var(--band-veryUnhealthy-fill)',
    solid: 'var(--band-veryUnhealthy-solid)',
    label: 'very unhealthy',
    advice: 'Stay indoors and keep windows closed',
  },
  hazardous: {
    color: 'var(--band-hazardous-text)',
    background: 'var(--band-hazardous-fill)',
    solid: 'var(--band-hazardous-solid)',
    label: 'hazardous',
    advice: 'Stay indoors — avoid all outdoor activity',
  },
}

export const METRIC_LABELS: Record<Metric, string> = {
  psi24h: '24h PSI',
  pm25_1h: '1h PM2.5',
}

/** NEA's PSI bands. */
export function psiBand(value: number): Band {
  if (value <= 50) return 'good'
  if (value <= 100) return 'moderate'
  if (value <= 200) return 'unhealthy'
  if (value <= 300) return 'veryUnhealthy'
  return 'hazardous'
}

/** NEA's 1-hour PM2.5 bands (µg/m³). */
export function pm25Band(value: number): Band {
  if (value <= 55) return 'good'
  if (value <= 150) return 'moderate'
  if (value <= 250) return 'unhealthy'
  if (value <= 350) return 'veryUnhealthy'
  return 'hazardous'
}

/** Which band a reading falls in, for code that needs the name. */
export function bandKeyFor(metric: Metric, value: number): Band {
  return metric === 'psi24h' ? psiBand(value) : pm25Band(value)
}

export function bandFor(metric: Metric, value: number) {
  return BANDS[bandKeyFor(metric, value)]
}

export type RegionReading = {
  current: Record<Metric, number>
  /** Now, +6h, +12h, +24h, +36h. */
  trend: Record<Metric, number[]>
  /** The three-card strip on the dashboard. */
  outlook: { label: string; psi24h: number }[]
}

export const TREND_LABELS = ['Now', '+6h', '+12h', '+24h', '+36h']

export function formatUpdatedAt(from: Date, now = new Date()) {
  const minutes = Math.max(0, Math.round((now.getTime() - from.getTime()) / 60000))
  if (minutes < 1) return 'Updated just now'
  if (minutes === 1) return 'Updated 1 min ago'
  if (minutes < 60) return `Updated ${minutes} min ago`
  const hours = Math.round(minutes / 60)
  return `Updated ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
}

/*
 * Stand-in readings, used until NEA's live data arrives and whenever a
 * request fails. Live values come from src/lib/nea.ts.
 */
export const FALLBACK_READINGS: Record<RegionId, RegionReading> = {
  north: {
    current: { psi24h: 58, pm25_1h: 22 },
    trend: { psi24h: [58, 64, 52, 44, 38], pm25_1h: [22, 26, 20, 16, 14] },
    outlook: [
      { label: 'Today', psi24h: 58 },
      { label: 'Tonight', psi24h: 66 },
      { label: 'Tomorrow', psi24h: 47 },
    ],
  },
  south: {
    current: { psi24h: 76, pm25_1h: 31 },
    trend: { psi24h: [76, 88, 71, 55, 42], pm25_1h: [31, 37, 29, 22, 18] },
    outlook: [
      { label: 'Today', psi24h: 76 },
      { label: 'Tonight', psi24h: 89 },
      { label: 'Tomorrow', psi24h: 64 },
    ],
  },
  east: {
    current: { psi24h: 102, pm25_1h: 58 },
    trend: { psi24h: [102, 118, 96, 74, 60], pm25_1h: [58, 67, 54, 41, 33] },
    outlook: [
      { label: 'Today', psi24h: 102 },
      { label: 'Tonight', psi24h: 121 },
      { label: 'Tomorrow', psi24h: 88 },
    ],
  },
  west: {
    current: { psi24h: 55, pm25_1h: 20 },
    trend: { psi24h: [55, 61, 49, 41, 35], pm25_1h: [20, 24, 19, 15, 13] },
    outlook: [
      { label: 'Today', psi24h: 55 },
      { label: 'Tonight', psi24h: 63 },
      { label: 'Tomorrow', psi24h: 44 },
    ],
  },
  central: {
    current: { psi24h: 82, pm25_1h: 38 },
    trend: { psi24h: [82, 95, 76, 58, 45], pm25_1h: [38, 45, 35, 26, 21] },
    outlook: [
      { label: 'Today', psi24h: 82 },
      { label: 'Tonight', psi24h: 95 },
      { label: 'Tomorrow', psi24h: 70 },
    ],
  },
}

export type CurrentReadings = Record<RegionId, Record<Metric, number>>

/** Average of the five regions' current readings for a metric. */
export function nationalAverage(current: CurrentReadings, metric: Metric) {
  const values = Object.values(current).map((reading) => reading[metric])
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

/** How a region compares with the national average, for the map's summary line. */
export function compareToNational(current: CurrentReadings, metric: Metric, value: number) {
  const average = nationalAverage(current, metric)
  const percent = Math.round(((value - average) / average) * 100)
  if (percent > 0) return { percent, text: `${percent}% higher than the national average right now` }
  if (percent < 0) return { percent, text: `${Math.abs(percent)}% lower than the national average right now` }
  return { percent, text: 'In line with the national average right now' }
}
