import "leaflet/dist/leaflet.css"

import L from "leaflet"
import { useEffect, useRef } from "react"
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
/** Arrow keys move the pin by this many screen pixels (Shift: three times as far). */
const NUDGE_PX = 32

// A CSS pin, so no marker image has to be bundled.
const pinIcon = L.divIcon({
  className: "",
  html: '<span class="block size-6 rounded-full border-[3px] border-white bg-bronze shadow-[0_2px_8px_rgba(0,0,0,0.35)]"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

/**
 * Leaflet map with a draggable pin; tapping the map moves the pin there. It is
 * also operable from the keyboard: focus the map, then Enter places the pin in
 * the middle, and the arrow keys move it. Browser-only: load it lazily and
 * render it after hydration.
 */
export default function LocationMap({
  position,
  onChange,
  label,
}: {
  position: Coordinates | null
  onChange: (coords: Coordinates) => void
  /** Accessible name of the map (it is a focusable control). */
  label: string
}) {
  return (
    <div className="border-pine/15 isolate z-0 h-72 overflow-hidden rounded-2xl border sm:h-80">
      <MapContainer
        center={
          position ? [position.latitude, position.longitude] : DEFAULT_CENTER
        }
        zoom={position ? PIN_ZOOM : DEFAULT_ZOOM}
        // Arrow keys move the pin instead of panning (see KeyboardPin).
        keyboard={false}
        className="size-full"
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <PickOnClick onChange={onChange} />
        <KeyboardPin position={position} onChange={onChange} label={label} />
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

/** Makes the map a keyboard control: Enter/Space place the pin, arrows move it. */
function KeyboardPin({
  position,
  onChange,
  label,
}: {
  position: Coordinates | null
  onChange: (coords: Coordinates) => void
  label: string
}) {
  const map = useMap()

  useEffect(() => {
    const el = map.getContainer()
    el.tabIndex = 0
    el.setAttribute("role", "application")
    el.setAttribute("aria-label", label)

    const onKeyDown = (event: KeyboardEvent) => {
      const arrows: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      }
      const arrow = arrows[event.key]
      const isPlace = event.key === "Enter" || event.key === " "
      if (!arrow && !isPlace) return
      event.preventDefault()

      if (!position) {
        // No pin yet: drop it in the middle of the view.
        const center = map.getCenter()
        onChange({ latitude: center.lat, longitude: center.lng })
        return
      }
      if (isPlace) return

      const step = event.shiftKey ? NUDGE_PX * 3 : NUDGE_PX
      const point = map.latLngToContainerPoint([
        position.latitude,
        position.longitude,
      ])
      const moved = map.containerPointToLatLng(
        L.point(point.x + arrow[0] * step, point.y + arrow[1] * step),
      )
      onChange({ latitude: moved.lat, longitude: moved.lng })
    }

    el.addEventListener("keydown", onKeyDown)
    return () => el.removeEventListener("keydown", onKeyDown)
  }, [map, position, onChange, label])

  return null
}

/**
 * Brings the pin into view: zooming in when it first appears (so a key press moves it a
 * few metres, not kilometres), and afterwards only moving the map when the pin leaves it
 * (set from outside: GPS, a saved address, an area).
 */
function FollowPin({ position }: { position: Coordinates }) {
  const map = useMap()
  const { latitude, longitude } = position
  const first = useRef(true)

  useEffect(() => {
    const target = L.latLng(latitude, longitude)
    if (first.current) {
      first.current = false
      map.setView(target, Math.max(map.getZoom(), PIN_ZOOM))
    } else if (!map.getBounds().pad(-0.1).contains(target)) {
      // Taps and drags stay in view, so the map only moves for outside changes.
      map.setView(target, Math.max(map.getZoom(), PIN_ZOOM))
    }
  }, [map, latitude, longitude])

  return null
}
