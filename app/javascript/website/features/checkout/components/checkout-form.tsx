import { router, usePage } from "@inertiajs/react"
import type { FormEvent } from "react"
import { useState } from "react"

import { websiteCheckouts } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { Spinner } from "@/shared/components/ui/spinner"
import { CarStep } from "@/website/features/checkout/components/car-step"
import { LocationStep } from "@/website/features/checkout/components/location-step"
import { OrderSummary } from "@/website/features/checkout/components/order-summary"
import { PhoneStep } from "@/website/features/checkout/components/phone-step"
import { ScheduleStep } from "@/website/features/checkout/components/schedule-step"
import type {
  CheckoutFormData,
  CheckoutProps,
} from "@/website/features/checkout/types"
import { selectedExtrasKey } from "@/website/features/service-detail/utils"
import {
  clearSessionState,
  useSessionState,
} from "@/website/hooks/use-session-state"
import { useI18n } from "@/website/lib/i18n"

/** Moves focus to the heading of the first checkout step that has an error. */
function focusFirstError(errors: Record<string, unknown>) {
  const stepFor = (field: string) =>
    document.querySelector<HTMLElement>(
      `[data-error-field="${field}"] [id^="checkout-step-"]`,
    )
  for (const field of ["phone", "car_id", "location", "scheduled_at"]) {
    if (!(field in errors)) continue
    const heading = stepFor(field)
    if (!heading) continue
    heading.scrollIntoView({ block: "center", behavior: "smooth" })
    heading.focus({ preventScroll: true })
    return
  }
}

const EMPTY_DRAFT: CheckoutFormData = {
  car_id: null,
  address_id: null,
  latitude: null,
  longitude: null,
  scheduled_at: "",
  phone: "",
}

/**
 * The checkout steps beside the order summary. What the customer fills in is
 * a draft kept in session storage, so a refresh, or the round trip of adding a
 * car, keeps it. The server re-checks everything on submit.
 */
export function CheckoutForm({
  summary,
  cars,
  addresses,
  slots,
  areas,
  needs_phone,
  coverage,
}: CheckoutProps) {
  const { t } = useI18n()

  const draftKey = `checkout:${summary.service.slug}`
  const [draft, setDraft] = useSessionState(draftKey, EMPTY_DRAFT)
  const update = (changes: Partial<CheckoutFormData>) =>
    setDraft({ ...draft, ...changes })
  const [processing, setProcessing] = useState(false)
  // Full messages from Checkout, keyed by field (plus location, service, base).
  const { errors } = usePage().props
  const errorFor = (key: string) => {
    const messages = errors[key]
    return Array.isArray(messages) ? messages[0] : messages
  }

  // The draft can outlive what it points at (a car deleted in another tab, a slot that has
  // passed, an address removed), so only values that still exist count.
  const chosenCar = cars.some((car) => car.id === draft.car_id)
    ? draft.car_id
    : null
  // With a single car there is nothing to choose.
  const carId = chosenCar ?? (cars.length === 1 ? cars[0].id : null)
  const scheduledAt = slots.some((day) =>
    day.slots.some((slot) => slot.value === draft.scheduled_at),
  )
    ? draft.scheduled_at
    : ""
  const addressId = addresses.some((address) => address.id === draft.address_id)
    ? draft.address_id
    : null
  const location =
    draft.latitude !== null && draft.longitude !== null
      ? {
          latitude: draft.latitude,
          longitude: draft.longitude,
          addressId,
        }
      : null
  const outOfReach = coverage?.covered === false
  const formError = errorFor("service") ?? errorFor("base")

  const submit = (event: FormEvent) => {
    event.preventDefault()
    router.post(
      websiteCheckouts.create().url,
      {
        ...draft,
        car_id: carId,
        address_id: addressId,
        scheduled_at: scheduledAt,
        service: summary.service.slug,
        extras: summary.extras.map((extra) => extra.id),
      },
      {
        // Stay put on validation errors; the booking page opens at the top.
        preserveScroll: "errors",
        // The summary and the button sit below the steps on a phone, so bring the
        // first step with a problem into view and focus it.
        onError: (errors) => focusFirstError(errors),
        onStart: () => setProcessing(true),
        onFinish: () => setProcessing(false),
        // Booked: start the next booking from scratch.
        onSuccess: (page) => {
          if (page.component !== "website/checkouts/show") {
            clearSessionState(draftKey)
            clearSessionState(selectedExtrasKey(summary.service.slug))
          }
        },
      },
    )
  }

  // Steps are numbered on screen; the phone step only shows when it's missing.
  const first = needs_phone ? 2 : 1

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid items-start gap-8 lg:grid-cols-[1fr_22rem] lg:gap-10"
    >
      <div className="flex min-w-0 flex-col gap-5">
        {needs_phone && (
          <PhoneStep
            step={1}
            value={draft.phone}
            onChange={(phone) => update({ phone })}
            error={errorFor("phone")}
          />
        )}
        <CarStep
          step={first}
          cars={cars}
          value={carId}
          onChange={(id) => update({ car_id: id })}
          error={errorFor("car_id")}
        />
        <LocationStep
          step={first + 1}
          addresses={addresses}
          areas={areas}
          value={location}
          coverage={coverage}
          onChange={(picked) =>
            update({
              latitude: picked.latitude,
              longitude: picked.longitude,
              address_id: picked.addressId,
            })
          }
          error={errorFor("location")}
        />
        <ScheduleStep
          step={first + 2}
          days={slots}
          value={scheduledAt}
          onChange={(slot) => update({ scheduled_at: slot })}
          error={errorFor("scheduled_at")}
        />
      </div>

      <div className="lg:sticky lg:top-28">
        <OrderSummary summary={summary}>
          {formError && (
            <p role="alert" className="text-danger mb-3 text-sm">
              {formError}
            </p>
          )}
          <Button
            type="submit"
            disabled={processing || outOfReach}
            className="bg-pine text-ivory hover:bg-pine-deep h-12 w-full rounded-full text-base"
          >
            {processing && <Spinner />}
            {t("Confirm booking")}
          </Button>
          {outOfReach && (
            <p className="text-sage mt-2 text-center text-sm">
              {t("Pick a location we serve to continue.")}
            </p>
          )}
        </OrderSummary>
      </div>
    </form>
  )
}
