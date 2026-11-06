/** OpenStreetMap tiles and defaults shared by every Leaflet map. */

/** Cairo, used when there is nothing to center the map on. */
export const DEFAULT_CENTER: [number, number] = [30.0444, 31.2357]
export const DEFAULT_ZOOM = 11

export const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
