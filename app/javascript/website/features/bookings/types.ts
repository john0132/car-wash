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
