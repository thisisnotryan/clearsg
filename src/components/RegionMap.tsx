import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { getRegion, SINGAPORE_CENTER } from '../data/regions'
import type { RegionId } from '../lib/profile'
import styles from './RegionMap.module.css'

type Props = {
  region: RegionId | null
}

const OVERVIEW_ZOOM = 10
const REGION_ZOOM = 12

// Interactive stand-in for the static "Figmap" basemap in the design:
// shows all of Singapore, then zooms to whichever region is picked.
export function RegionMap({ region }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)

  useEffect(() => {
    const map = L.map(containerRef.current!, {
      center: SINGAPORE_CENTER,
      zoom: OVERVIEW_ZOOM,
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
      markerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markerRef.current?.remove()
    markerRef.current = null
    if (!region) return
    const { center } = getRegion(region)
    markerRef.current = L.circleMarker(center, {
      radius: 10,
      color: '#ffffff',
      weight: 3,
      fillColor: '#1f68c9',
      fillOpacity: 1,
    }).addTo(map)
    map.flyTo(center, REGION_ZOOM, { duration: 0.6 })
  }, [region])

  return <div ref={containerRef} className={styles.map} role="img" aria-label="Map of Singapore" />
}
