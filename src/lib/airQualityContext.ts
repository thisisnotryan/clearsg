import { createContext, useContext } from 'react'
import type { CurrentReadings } from '../data/airQuality'
import type { Histories } from './nea'

export type AirQuality = {
  /** Latest reading per region. */
  current: CurrentReadings
  /** Hourly readings for the last day or so, newest first. */
  history: Histories
  /** When the readings are for. */
  updatedAt: Date
  /** 'live' from NEA, 'fallback' when the request failed. */
  source: 'live' | 'fallback'
  /** True when the readings are too old to present as current. */
  isStale: boolean
  loading: boolean
  refresh: () => void
}

/*
 * NEA publishes hourly, and a new hour lands a few minutes past the hour.
 * Older than this and the app stops calling a reading current.
 */
export const STALE_AFTER_MS = 90 * 60 * 1000

export const AirQualityContext = createContext<AirQuality | null>(null)

export function useAirQuality() {
  const value = useContext(AirQualityContext)
  if (!value) throw new Error('useAirQuality must be used inside AirQualityProvider')
  return value
}
