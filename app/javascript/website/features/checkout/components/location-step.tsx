import { router, usePage } from "@inertiajs/react"
import { CircleAlert, CircleCheck, LocateFixed, MapPin } from "lucide-react"
import { Suspense, lazy, useState } from "react"

import { Button } from "@/shared/components/ui/button"
import { Spinner } from "@/shared/components/ui/spinner"
import { StepCard } from "@/website/features/checkout/components/step-card"
import type {
  CheckoutAddress,
  Coverage,
} from "@/website/features/checkout/types"
import { useGeolocation } from "@/website/hooks/use-geolocation"
import type { Coordinates } from "@/website/hooks/use-geolocation"
import { useIsClient } from "@/website/hooks/use-is-client"

// Leaflet needs `window`, so the map is split out and only loaded in the browser.
const LocationMap = lazy(
  () => import("@/website/features/checkout/components/location-map"),
)

export interface PickedLocation extends Coordinates {
  /** Set when a saved address was picked; cleared once the pin moves. */
  addressId: number | null
}

/**
 * Where the customer wants us: their current position, a saved address or a
 * pin on the map. Every change asks the server, via a partial reload of the
 * `coverage` prop, whether we serve that spot.
 */
export function LocationStep({
  step,
  addresses,
  value,
  coverage,
  onChange,
  error,
}: {
  step: number
  addresses: CheckoutAddress[]
  value: PickedLocation | null
  coverage: Coverage | null
  onChange: (location: PickedLocation) => void
  error?: string
}) {
  const { url } = usePage()
  const isClient = useIsClient()
  const [checking, setChecking] = useState(false)

  const pick = (location: PickedLocation) => {
    onChange(location)
    // GET data merges into the current query (service, extras), so the pin
    // also lives in the URL and the check survives a refresh.
    router.get(
      url,
      { latitude: location.latitude, longitude: location.longitude },
      {
        only: ["coverage"],
        preserveState: true,
        preserveScroll: true,
        replace: true,
        onStart: () => setChecking(true),
        onFinish: () => setChecking(false),
      },
    )
  }

  const gps = useGeolocation((coords) => pick({ ...coords, addressId: null }))

  return (
    <StepCard
      step={step}
      title="Location"
      description="Where is the car parked? Use your location or drop a pin on the map."
      error={error}
    >
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={gps.locate}
          disabled={gps.locating}
          className="bg-pine text-ivory hover:bg-pine-deep rounded-full"
        >
          {gps.locating ? <Spinner /> : <LocateFixed aria-hidden />}
          Use my current location
        </Button>
        {addresses.map((address) => (
          <Button
            key={address.id}
            type="button"
            variant="outline"
            aria-pressed={value?.addressId === address.id}
            onClick={() =>
              pick({
                latitude: address.latitude,
                longitude: address.longitude,
                addressId: address.id,
              })
            }
            className={`border-pine/25 text-pine hover:text-pine rounded-full hover:bg-white ${
              value?.addressId === address.id
                ? "border-pine bg-white"
                : "bg-transparent"
            }`}
          >
            <MapPin aria-hidden />
            {address.name}
          </Button>
        ))}
      </div>
      {gps.error && (
        <p role="alert" className="text-danger mt-2 text-sm">
          {gps.error} Drop a pin on the map instead.
        </p>
      )}

      <div className="mt-4">
        {isClient ? (
          <Suspense fallback={<MapPlaceholder />}>
            <LocationMap
              position={value}
              onChange={(coords) => pick({ ...coords, addressId: null })}
            />
          </Suspense>
        ) : (
          <MapPlaceholder />
        )}
      </div>

      <div aria-live="polite" className="mt-4 min-h-6 text-[15px]">
        {checking ? (
          <span className="text-sage flex items-center gap-2">
            <Spinner /> Checking we serve this spot…
          </span>
        ) : coverage?.covered ? (
          <span className="flex items-center gap-2 text-emerald-800">
            <CircleCheck className="size-4" aria-hidden />
            We serve {[coverage.area, coverage.city].filter(Boolean).join(", ")}
            .
          </span>
        ) : coverage ? (
          <span className="text-danger flex items-center gap-2">
            <CircleAlert className="size-4" aria-hidden />
            Sorry, this location is outside our service reach.
          </span>
        ) : null}
      </div>
    </StepCard>
  )
}

function MapPlaceholder() {
  return (
    <div className="border-pine/15 bg-sand h-72 animate-pulse rounded-2xl border sm:h-80" />
  )
}
