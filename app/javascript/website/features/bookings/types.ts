export interface BookingItem {
  id: number
  name: string | null
  quantity: number
}

export interface CustomerBooking {
  id: number
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
  payment_status:
    "unpaid" | "paid" | "partially_refunded" | "refunded" | "failed"
  scheduled_at: string | null
  created_at: string
  total_amount: number
  address: string | null
  items: BookingItem[]
}

/** Website::BookingsController#booking_props: one booking, in full. */
export interface BookingDetail {
  id: number
  status: CustomerBooking["status"]
  payment_status: CustomerBooking["payment_status"]
  scheduled_at: string | null
  created_at: string
  items: (BookingItem & { kind: string; price: number })[]
  subtotal: number
  extras_total: number
  total_amount: number
  car: string | null
  address: { name: string; area: string; city: string } | null
  payment_method: string | null
}
