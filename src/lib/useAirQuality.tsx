import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { FALLBACK_READINGS, type CurrentReadings, type Metric } from '../data/airQuality'
import { AirQualityContext, STALE_AFTER_MS, type AirQuality } from './airQualityContext'
import { fetchHistories } from './nea'
import type { RegionId } from './profile'

// NEA publishes hourly; check a little more often so a new hour shows up soon.
const POLL_INTERVAL_MS = 5 * 60 * 1000

const fallbackCurrent = Object.fromEntries(
  Object.entries(FALLBACK_READINGS).map(([region, reading]) => [region, reading.current]),
) as CurrentReadings

export function AirQualityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<AirQuality, 'refresh' | 'isStale'>>({
    current: fallbackCurrent,
    history: { psi24h: [], pm25_1h: [] },
    updatedAt: new Date(),
    source: 'fallback',
    loading: true,
  })
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = useCallback(() => {
    setState((previous) => ({ ...previous, loading: true }))
    setReloadKey((key) => key + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    fetchHistories(controller.signal)
      .then((history) => {
        if (!active) return
        // The newest hour is the current reading.
        const latestPsi = history.psi24h[0]
        const latestPm25 = history.pm25_1h[0]
        const current = {} as CurrentReadings
        for (const region of Object.keys(latestPsi.values) as RegionId[]) {
          current[region] = {
            psi24h: latestPsi.values[region],
            pm25_1h: latestPm25.values[region],
          } satisfies Record<Metric, number>
        }
        setState({ current, history, updatedAt: latestPsi.timestamp, source: 'live', loading: false })
      })
      .catch((error: unknown) => {
        // Keep whatever is on screen — the last live readings, or the
        // stand-in data on a first failure — and mark it as not live.
        if (!active) return
        console.warn('Could not load NEA readings', error)
        setState((previous) => ({ ...previous, source: 'fallback', loading: false }))
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [reloadKey])

  // Re-renders on a timer so readings turn stale on screen without a refresh.
  const [now, setNow] = useState(() => Date.now())

  // Poll, and catch up whenever the app comes back to the foreground.
  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 60 * 1000)
    const timer = setInterval(refresh, POLL_INTERVAL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(clock)
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  const value = useMemo(() => {
    const isStale = state.source === 'fallback' || now - state.updatedAt.getTime() > STALE_AFTER_MS
    return { ...state, isStale, refresh }
  }, [state, now, refresh])
  return <AirQualityContext.Provider value={value}>{children}</AirQualityContext.Provider>
}
