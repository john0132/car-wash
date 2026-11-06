/** Website::CheckoutsController#summary_props: priced by the server. */
export interface CheckoutSummary {
  service: {
    slug: string
    name: string | null
    price: number
    duration_minutes: number | null
  }
  extras: { id: number; name: string | null; price: number }[]
  subtotal: number
  extras_total: number
  total: number
}

export interface CheckoutCar {
  id: number
  description: string
}

export interface CheckoutAddress {
  id: number
  name: string
  latitude: number
  longitude: number
}

/** BookingSlots.grouped */
export interface SlotDay {
  date: string
  label: string
  slots: { value: string; label: string }[]
}

/** Checkout#coverage: null until a location is picked. */
export interface Coverage {
  covered: boolean
  area: string | null
  city: string | null
}

export interface CheckoutProps {
  summary: CheckoutSummary
  cars: CheckoutCar[]
  addresses: CheckoutAddress[]
  slots: SlotDay[]
  needs_phone: boolean
  coverage: Coverage | null
}

/** What the customer fills in; kept in session storage across a refresh. */
export interface CheckoutFormData {
  car_id: number | null
  address_id: number | null
  latitude: number | null
  longitude: number | null
  scheduled_at: string
  phone: string
}
