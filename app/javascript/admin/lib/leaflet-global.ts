import L from "leaflet"

// leaflet-geoman's bundle extends the global `L`, so expose Leaflet before it loads.
declare global {
  interface Window {
    L: typeof L
  }
}

window.L = L
