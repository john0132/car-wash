import "leaflet/dist/leaflet.css"

import L from "leaflet"
import { useEffect } from "react"
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet"

import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  TILE_ATTRIBUTION,
  TILE_URL,
} from "@/shared/lib/map"
import type { Coordinates } from "@/website/hooks/use-geolocation"

const PIN_ZOOM = 16

// A CSS pin, so no marker image has to be bundled.
const pinIcon = L.divIcon({
  className: "",
  html: '<span class="block size-6 rounded-full border-[3px] border-white bg-bronze shadow-[0_2px_8px_rgba(0,0,0,0.35)]"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

/**
 * Leaflet map with a draggable pin; tapping the map moves the pin there.
 * Browser-only: load it lazily and render it after hydration.
 */
export default function LocationMap({
  position,
  onChange,
}: {
  position: Coordinates | null
  onChange: (coords: Coordinates) => void
}) {
  return (
    <div className="border-pine/15 isolate z-0 h-72 overflow-hidden rounded-2xl border sm:h-80">
      <MapContainer
        center={
          position ? [position.latitude, position.longitude] : DEFAULT_CENTER
        }
        zoom={position ? PIN_ZOOM : DEFAULT_ZOOM}
        className="size-full"
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <PickOnClick onChange={onChange} />
        {position && (
          <>
            <Marker
              position={[position.latitude, position.longitude]}
              icon={pinIcon}
              draggable
              keyboard={false}
              eventHandlers={{
                dragend: (event) => {
                  const { lat, lng } = (event.target as L.Marker).getLatLng()
                  onChange({ latitude: lat, longitude: lng })
                },
              }}
            />
            <FollowPin position={position} />
          </>
        )}
      </MapContainer>
    </div>
  )
}

function PickOnClick({
  onChange,
}: {
  onChange: (coords: Coordinates) => void
}) {
  useMapEvents({
    click: ({ latlng }) =>
      onChange({ latitude: latlng.lat, longitude: latlng.lng }),
  })
  return null
}

/** Keeps the pin in view when it is set from outside (GPS, a saved address). */
function FollowPin({ position }: { position: Coordinates }) {
  const map = useMap()
  const { latitude, longitude } = position

  useEffect(() => {
    const target = L.latLng(latitude, longitude)
    // Taps and drags stay in view, so the map only moves for GPS or saved addresses.
    if (!map.getBounds().contains(target)) {
      map.setView(target, Math.max(map.getZoom(), PIN_ZOOM))
    }
  }, [map, latitude, longitude])

  return null
}
