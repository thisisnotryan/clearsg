import { useEffect, useRef } from 'react'
import L from 'leaflet'
import mapPin from '../assets/figma/map-pin.png'
import { bandKeyFor, type CurrentReadings, type Metric } from '../data/airQuality'
import regionShapes from '../data/regionShapes.json'
import { getRegion, SINGAPORE_CENTER } from '../data/regions'
import type { RegionId } from '../lib/profile'
import { themeColor, useTheme } from '../lib/theme'
import styles from './LiveMap.module.css'

type Props = {
  readings: CurrentReadings
  metric: Metric
  /** Region to drop the "you are here" pin on. */
  region: RegionId
  /** Other areas someone covers, marked with a smaller pin. */
  pinned?: RegionId[]
}

const FILL_OPACITY = 0.45
/*
 * Framing: the main island fills the square at this zoom. Fitting to the
 * shapes instead would zoom out to include Tuas and Pulau Tekong, leaving
 * Singapore small in the middle of a lot of sea.
 */
const ZOOM = 10.4
const MIN_ZOOM = 10
/** How far past Singapore the map may be panned. */
const PAN_MARGIN = 0.4

const pinIcon = L.icon({
  iconUrl: mapPin,
  iconSize: [50, 50],
  iconAnchor: [25, 46],
})

// Areas someone covers are marked too, smaller so the home pin still leads.
const coveredIcon = L.icon({
  iconUrl: mapPin,
  iconSize: [34, 34],
  iconAnchor: [17, 31],
  className: styles.coveredPin,
})

/** Singapore with each NEA region shaded by its current reading. */
export function LiveMap({ readings, metric, region, pinned = [] }: Props) {
  // Leaflet needs real colours, so the band tokens are resolved here and
  // re-resolved whenever the theme changes.
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const shapesRef = useRef<L.GeoJSON | null>(null)
  const pinRef = useRef<L.Marker | null>(null)
  const coveredRef = useRef<L.Marker[]>([])

  useEffect(() => {
    const map = L.map(containerRef.current!, {
      center: SINGAPORE_CENTER,
      zoom: ZOOM,
      minZoom: MIN_ZOOM,
      zoomControl: false,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      shapesRef.current = null
      pinRef.current = null
      coveredRef.current = []
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    shapesRef.current?.remove()
    shapesRef.current = L.geoJSON(regionShapes as GeoJSON.GeoJsonObject, {
      style: (feature) => {
        const id = feature?.properties?.id as RegionId
        const colour = themeColor(`--band-${bandKeyFor(metric, readings[id][metric])}-solid`)
        return { color: colour, weight: 1.5, fillColor: colour, fillOpacity: FILL_OPACITY }
      },
    })
      .bindTooltip(
        (layer) => {
          const feature = (layer as L.Layer & { feature?: GeoJSON.Feature }).feature
          const id = feature?.properties?.id as RegionId
          return `${getRegion(id).label} ${readings[id][metric]}`
        },
        { direction: 'center', className: styles.tooltip },
      )
      .addTo(map)

    // Keep panning near Singapore instead of drifting off into the sea.
    map.setMaxBounds(shapesRef.current.getBounds().pad(PAN_MARGIN))

    coveredRef.current.forEach((marker) => marker.remove())
    coveredRef.current = pinned
      .filter((id) => id !== region)
      .map((id) =>
        L.marker(getRegion(id).center, { icon: coveredIcon, keyboard: false, interactive: false }).addTo(map),
      )

    // Added last so "you are here" sits above the areas around it.
    pinRef.current?.remove()
    pinRef.current = L.marker(getRegion(region).center, { icon: pinIcon, keyboard: false, interactive: false }).addTo(map)
  }, [readings, metric, region, pinned, theme])

  return <div ref={containerRef} className={styles.map} role="img" aria-label="Map of Singapore shaded by air quality" />
}
