/** OpenStreetMap tiles and defaults shared by every Leaflet map. */

/** Cairo, used when there is nothing to center the map on. */
export const DEFAULT_CENTER: [number, number] = [30.0444, 31.2357]
export const DEFAULT_ZOOM = 11

// OpenStreetMap's public tile servers are for light use only and make no availability
// promise, so production should point these at a tile provider with a plan (or your own
// tiles): set VITE_MAP_TILE_URL (with {z}/{x}/{y}) and VITE_MAP_TILE_ATTRIBUTION at build time.
const env = import.meta.env as Record<string, string | undefined>

export const TILE_URL =
  env.VITE_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
export const TILE_ATTRIBUTION =
  env.VITE_MAP_TILE_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
