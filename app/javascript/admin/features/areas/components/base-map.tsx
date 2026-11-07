import "leaflet/dist/leaflet.css"

import type L from "leaflet"
import { type ReactNode, useEffect, useEffectEvent } from "react"
import { MapContainer, TileLayer, useMap } from "react-leaflet"

import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  TILE_ATTRIBUTION,
  TILE_REFERRER_POLICY,
  TILE_URL,
} from "@/shared/lib/map"
import { cn } from "@/shared/lib/utils"

/**
 * OpenStreetMap-backed Leaflet map, framed for the dashboard. `isolate` keeps
 * Leaflet's own z-indexes from covering dropdowns and dialogs.
 */
export function BaseMap({
  bounds,
  className,
  children,
}: {
  /** Fitted on mount and whenever the box changes. */
  bounds: L.LatLngBounds | null
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        "isolate z-0 overflow-hidden rounded-lg border",
        "h-[28rem]",
        className,
      )}
    >
      <MapContainer
        center={bounds ? bounds.getCenter() : DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="size-full"
      >
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTRIBUTION}
          referrerPolicy={TILE_REFERRER_POLICY}
        />
        {bounds && <FitBounds bounds={bounds} />}
        {children}
      </MapContainer>
    </div>
  )
}

/** Fits the map to `bounds` whenever they change. */
function FitBounds({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap()
  const fit = useEffectEvent(() =>
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 }),
  )
  // Refit only when the box itself changes, not on every new bounds object.
  const key = bounds.toBBoxString()

  useEffect(() => {
    fit()
  }, [map, key])

  return null
}
