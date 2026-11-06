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

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "unpaid",
  "paid",
  "partially_refunded",
  "refunded",
  "failed",
]

/** Admin::UserManagement#booking_props / Admin::BookingsController#booking_props */
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

export interface BookingFilters {
  q: string | null
  booking_status: BookingStatus | null
  payment_status: PaymentStatus | null
}

export interface BookingItem {
  id: number
  name: string
  type: string
  quantity: number
  price: number
}

/** Admin::BookingsController#booking_detail_props */
export interface BookingDetail {
  id: number
  status: BookingStatus
  payment_status: PaymentStatus
  subtotal: number
  extras_total: number
  discounts: number
  total_amount: number
  scheduled_at: string | null
  created_at: string
  updated_at: string
  customer: {
    id: number
    full_name: string
    email: string
    phone: string | null
  }
  /** Snapshot taken at checkout, e.g. "Toyota Corolla · White · ABC 123". */
  car: string | null
  employee: { id: number; full_name: string } | null
  package: { id: number; name: string; price: number } | null
  address: { name: string; area_name: string; city_name: string } | null
  items: BookingItem[]
}

export interface EmployeeOption {
  id: number
  full_name: string
}
