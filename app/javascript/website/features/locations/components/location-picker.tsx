import { Suspense, lazy } from "react"

import type { Coordinates } from "@/website/hooks/use-geolocation"
import { useIsClient } from "@/website/hooks/use-is-client"
import { useI18n } from "@/website/lib/i18n"

// Leaflet needs `window`, so the map is split out and only loaded in the browser.
const LocationMap = lazy(
  () => import("@/website/features/locations/components/location-map"),
)

/**
 * A map to pin a place on, with the instructions and a live readout of where
 * the pin is, so it works with a pointer, a keyboard or a screen reader.
 */
export function LocationPicker({
  position,
  onChange,
}: {
  position: Coordinates | null
  onChange: (coords: Coordinates) => void
}) {
  const { t } = useI18n()
  const isClient = useIsClient()

  return (
    <div>
      {isClient ? (
        <Suspense fallback={<MapPlaceholder />}>
          <LocationMap
            position={position}
            onChange={onChange}
            label={t(
              "Map. Press Enter to place the pin, then the arrow keys to move it.",
            )}
          />
        </Suspense>
      ) : (
        <MapPlaceholder />
      )}
      <p aria-live="polite" className="text-sage mt-2 text-sm tabular-nums">
        {position
          ? t("Pin at {latitude}, {longitude}", {
              latitude: position.latitude.toFixed(5),
              longitude: position.longitude.toFixed(5),
            })
          : t("Tap the map to drop a pin, or use your location or area above.")}
      </p>
    </div>
  )
}

function MapPlaceholder() {
  return (
    <div className="border-pine/15 bg-sand h-72 animate-pulse rounded-2xl border sm:h-80" />
  )
}
