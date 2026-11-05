import L from "leaflet"

import type { GeoJsonPolygon } from "@/admin/features/areas/types"

/** Cairo, used when there is nothing to fit the map to. */
export const DEFAULT_CENTER: L.LatLngTuple = [30.0444, 31.2357]
export const DEFAULT_ZOOM = 11

export const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

/** Outer ring as Leaflet [lat, lng] tuples, without the closing position. */
export function polygonToLatLngs(polygon: GeoJsonPolygon): L.LatLngTuple[] {
  const ring = polygon.coordinates[0] ?? []
  const open =
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
      ? ring.slice(0, -1)
      : ring
  return open.map(([lng, lat]) => [lat, lng])
}

/** Bounds covering every polygon given, or null when there are none. */
export function boundsOf(
  polygons: (GeoJsonPolygon | null | undefined)[],
): L.LatLngBounds | null {
  const points = polygons.flatMap((polygon) =>
    polygon ? polygonToLatLngs(polygon) : [],
  )
  return points.length > 0 ? L.latLngBounds(points) : null
}
