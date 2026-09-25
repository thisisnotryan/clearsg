/*
 * Builds the five NEA region shapes used by the Live Map.
 *
 * NEA reports PSI for North / South / East / West / Central but does not
 * publish region outlines, only one label coordinate per region. So each of
 * Singapore's 55 planning areas is assigned to the NEA region whose label
 * point is nearest, and the planning areas of a region are merged into one
 * shape. That keeps the boundaries on real administrative lines instead of
 * drawing arbitrary straight cuts across the island.
 *
 * Input:  Singapore planning-area boundaries as GeoJSON. Built from
 *         https://raw.githubusercontent.com/yinshanyang/singapore/master/maps/2-planning-area.geojson
 *         (URA Master Plan planning areas; the same data is on data.gov.sg).
 * Output: src/data/regionShapes.json — committed, so the app needs neither
 *         this script nor its dependencies at runtime.
 *
 * Run with: node scripts/build-region-shapes.mjs <path-to-planning-areas.geojson>
 *
 * A planning area lands in the region whose label point is nearest, which is
 * right for all but a few edge cases. Use OVERRIDES to force one by name.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import polygonClipping from 'polygon-clipping'

const REGION_POINTS = [
  { id: 'north', lng: 103.82, lat: 1.41803 },
  { id: 'south', lng: 103.82, lat: 1.29587 },
  { id: 'east', lng: 103.94, lat: 1.35735 },
  { id: 'west', lng: 103.7, lat: 1.35735 },
  { id: 'central', lng: 103.82, lat: 1.35735 },
]

/** Planning area name (as in the source data) -> region id. */
const OVERRIDES = {}

// Slivers smaller than this (square degrees) are dropped — specks at the zoom
// levels the app uses, and they would bloat the file.
const MIN_PART_AREA = 2e-5
// Douglas-Peucker tolerance in degrees (~11 m).
const SIMPLIFY_TOLERANCE = 1e-4

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Usage: node scripts/build-region-shapes.mjs <planning-areas.geojson>')
  process.exit(1)
}

function ringArea(ring) {
  let area = 0
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  }
  return Math.abs(area / 2)
}

/** Area-weighted centre of a feature's outer rings. */
function centroidOf(polygons) {
  let sumX = 0
  let sumY = 0
  let sumArea = 0
  for (const polygon of polygons) {
    const ring = polygon[0]
    const area = ringArea(ring)
    let x = 0
    let y = 0
    for (let i = 0; i < ring.length - 1; i++) {
      x += ring[i][0]
      y += ring[i][1]
    }
    const count = ring.length - 1
    sumX += (x / count) * area
    sumY += (y / count) * area
    sumArea += area
  }
  return [sumX / sumArea, sumY / sumArea]
}

function perpendicularDistance(point, start, end) {
  const [x, y] = point
  const [x1, y1] = start
  const [x2, y2] = end
  const dx = x2 - x1
  const dy = y2 - y1
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1)
  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)
  const clamped = Math.max(0, Math.min(1, t))
  return Math.hypot(x - (x1 + clamped * dx), y - (y1 + clamped * dy))
}

function simplify(points, tolerance) {
  if (points.length < 3) return points
  let maxDistance = 0
  let index = 0
  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], points[0], points[points.length - 1])
    if (distance > maxDistance) {
      maxDistance = distance
      index = i
    }
  }
  if (maxDistance <= tolerance) return [points[0], points[points.length - 1]]
  return [
    ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(index), tolerance),
  ]
}

function simplifyRing(ring) {
  const simplified = simplify(ring, SIMPLIFY_TOLERANCE)
  if (simplified.length < 4) return null
  const first = simplified[0]
  const last = simplified[simplified.length - 1]
  if (first[0] !== last[0] || first[1] !== last[1]) simplified.push(first)
  return simplified.map(([lng, lat]) => [Number(lng.toFixed(5)), Number(lat.toFixed(5))])
}

const source = JSON.parse(readFileSync(inputPath, 'utf8'))
const buckets = new Map(REGION_POINTS.map((r) => [r.id, []]))

for (const feature of source.features) {
  const { type, coordinates } = feature.geometry
  const polygons = type === 'MultiPolygon' ? coordinates : [coordinates]
  const [lng, lat] = centroidOf(polygons)
  // Longitude degrees are shorter than latitude ones; near the equator the
  // difference is under 0.1%, so plain distance is fine here.
  const nearest = REGION_POINTS.reduce((best, region) => {
    const distance = Math.hypot(region.lng - lng, region.lat - lat)
    return distance < best.distance ? { id: region.id, distance } : best
  }, { id: null, distance: Infinity })
  const regionId = OVERRIDES[feature.properties.name] ?? nearest.id
  buckets.get(regionId).push(...polygons.map((p) => [p[0]]))
}

const features = REGION_POINTS.map((region) => {
  const parts = buckets.get(region.id)
  const merged = parts.length ? polygonClipping.union(parts) : []

  const rings = []
  for (const polygon of merged) {
    // Outer ring only: holes are reservoirs and the like, not worth the bytes.
    const ring = polygon[0]
    if (ringArea(ring) < MIN_PART_AREA) continue
    const simplified = simplifyRing(ring)
    if (simplified) rings.push([simplified])
  }

  return {
    type: 'Feature',
    properties: { id: region.id },
    geometry: { type: 'MultiPolygon', coordinates: rings },
  }
})

const output = { type: 'FeatureCollection', features }
writeFileSync(new URL('../src/data/regionShapes.json', import.meta.url), JSON.stringify(output))

for (const feature of features) {
  const points = feature.geometry.coordinates.reduce((sum, p) => sum + p[0].length, 0)
  const area = feature.geometry.coordinates.reduce((sum, p) => sum + ringArea(p[0]), 0)
  console.log(`${feature.properties.id.padEnd(8)} parts=${feature.geometry.coordinates.length} points=${points} area=${area.toExponential(2)}`)
}
console.log('written:', JSON.stringify(output).length, 'bytes')
