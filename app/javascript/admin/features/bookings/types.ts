export type BookingStatus =
  "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"

export type PaymentStatus =
  "unpaid" | "paid" | "partially_refunded" | "refunded" | "failed"

export const BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
]

/** Admin::UserManagement#booking_props */
export interface BookingRow {
  id: number
  status: BookingStatus
  payment_status: PaymentStatus
  total_amount: number
  items_count: number
  scheduled_at: string | null
  created_at: string
  address: string | null
  customer: { id: number; full_name: string } | null
  employee: { id: number; full_name: string } | null
}

export type BookingStatusCounts = Record<BookingStatus, number>
