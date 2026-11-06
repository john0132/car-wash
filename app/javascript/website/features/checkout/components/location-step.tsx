import { router, usePage } from "@inertiajs/react"
import { CircleAlert, CircleCheck, LocateFixed, MapPin } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Spinner } from "@/shared/components/ui/spinner"
import { brandSelect } from "@/website/components/brand"
import type { AreaOption } from "@/website/features/addresses/types"
import { StepCard } from "@/website/features/checkout/components/step-card"
import type {
  CheckoutAddress,
  Coverage,
} from "@/website/features/checkout/types"
import { LocationPicker } from "@/website/features/locations/components/location-picker"
import { useGeolocation } from "@/website/hooks/use-geolocation"
import type { Coordinates } from "@/website/hooks/use-geolocation"
import { useI18n } from "@/website/lib/i18n"

export interface PickedLocation extends Coordinates {
  /** Set when a saved address was picked; cleared once the pin moves. */
  addressId: number | null
}

/**
 * Where the customer wants us: their current position, a saved address, an
 * area, or a pin on the map (placed with a pointer or the keyboard). Every
 * change asks the server, via a partial reload of the `coverage` prop, whether
 * we serve that spot.
 */
export function LocationStep({
  step,
  addresses,
  areas,
  value,
  coverage,
  onChange,
  error,
}: {
  step: number
  addresses: CheckoutAddress[]
  areas: AreaOption[]
  value: PickedLocation | null
  coverage: Coverage | null
  onChange: (location: PickedLocation) => void
  error?: string
}) {
  const { t } = useI18n()
  const { url } = usePage()
  const [checking, setChecking] = useState(false)
  // The spot last sent to the server, so each one is checked once.
  const checked = useRef<string | null>(null)

  // GET data merges into the current query (service, extras), so the pin
  // also lives in the URL and the check survives a refresh.
  const check = (location: Coordinates) => {
    checked.current = `${location.latitude},${location.longitude}`
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

  const pick = (location: PickedLocation) => {
    onChange(location)
    check(location)
  }

  // A pin restored from the saved draft (coming back to checkout) has no coverage answer
  // yet, since the URL starts without coordinates. The draft loads just after hydration,
  // so this watches for the pin rather than only running on mount.
  const latitude = value?.latitude
  const longitude = value?.longitude
  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return
    if (coverage !== null || checked.current !== null) return
    check({ latitude, longitude })
    // `check` only reads the router and refs; the pin and the coverage are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, coverage])

  const gps = useGeolocation((coords) => pick({ ...coords, addressId: null }))

  const placedAreas = areas.filter(
    (area) => area.latitude !== null && area.longitude !== null,
  )

  return (
    <StepCard
      field="location"
      step={step}
      title={t("Location")}
      description={t(
        "Where is the car parked? Use your location, pick your area, or drop a pin on the map.",
      )}
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
          {t("Use my current location")}
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
          {gps.error} {t("Drop a pin on the map instead.")}
        </p>
      )}

      {placedAreas.length > 0 && (
        <div className="mt-4">
          <label
            id="checkout-area-label"
            className="text-sage mb-1.5 block text-sm"
          >
            {t("Or choose your area")}
          </label>
          <Select
            // Picking an area drops the pin inside it, ready to adjust.
            onValueChange={(id) => {
              const area = placedAreas.find((a) => String(a.id) === id)
              if (area?.latitude != null && area.longitude != null)
                pick({
                  latitude: area.latitude,
                  longitude: area.longitude,
                  addressId: null,
                })
            }}
          >
            <SelectTrigger
              aria-labelledby="checkout-area-label"
              className={brandSelect}
            >
              <SelectValue placeholder={t("Choose an area")} />
            </SelectTrigger>
            <SelectContent>
              {placedAreas.map((area) => (
                <SelectItem key={area.id} value={String(area.id)}>
                  {area.city ? `${area.city} — ` : ""}
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mt-4">
        <LocationPicker
          position={value}
          onChange={(coords) => pick({ ...coords, addressId: null })}
        />
      </div>

      <div aria-live="polite" className="mt-4 min-h-6 text-[15px]">
        {checking ? (
          <span className="text-sage flex items-center gap-2">
            <Spinner /> {t("Checking we serve this spot…")}
          </span>
        ) : coverage?.covered ? (
          <span className="flex items-center gap-2 text-emerald-800">
            <CircleCheck className="size-4" aria-hidden />
            {t("We serve {place}.", {
              place: [coverage.area, coverage.city].filter(Boolean).join(", "),
            })}
          </span>
        ) : coverage ? (
          <span className="text-danger flex items-center gap-2">
            <CircleAlert className="size-4" aria-hidden />
            {t("Sorry, this location is outside our service reach.")}
          </span>
        ) : null}
      </div>
    </StepCard>
  )
}
