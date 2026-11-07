import type { PaymentStatus } from "@/admin/features/bookings/types"

export type PaymentStatusCounts = Record<PaymentStatus, number>

/**
 * Admin::DashboardController#admin_dashboard_props. A figure is null when the
 * admin's roles don't allow reading what it's built from.
 */
export interface DashboardKpis {
  revenue_this_month: number | null
  bookings_today: number | null
  open_bookings: number | null
  new_customers_this_month: number | null
}

export interface RevenueTrendPoint {
  date: string
  amount: number
}

export interface TopItem {
  name: string
  type: string
  revenue: number
  quantity: number
}
