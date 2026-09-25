import type { RegionId } from '../lib/profile'

export type Region = {
  id: RegionId
  label: string
  // Label coordinates NEA uses for each PSI reporting region.
  center: [lat: number, lng: number]
}

// Order matches the chip layout in Figma (North, South, East / West, Central).
export const REGIONS: Region[] = [
  { id: 'north', label: 'North', center: [1.41803, 103.82] },
  { id: 'south', label: 'South', center: [1.29587, 103.82] },
  { id: 'east', label: 'East', center: [1.35735, 103.94] },
  { id: 'west', label: 'West', center: [1.35735, 103.7] },
  { id: 'central', label: 'Central', center: [1.35735, 103.82] },
]

export const SINGAPORE_CENTER: [number, number] = [1.3521, 103.8198]

export function getRegion(id: RegionId) {
  return REGIONS.find((r) => r.id === id)!
}
