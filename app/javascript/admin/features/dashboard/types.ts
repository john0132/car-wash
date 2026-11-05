import type { PaymentStatus } from "@/admin/features/bookings/types"

export type PaymentStatusCounts = Record<PaymentStatus, number>

/** Admin::DashboardController#admin_dashboard_props */
export interface DashboardKpis {
  revenue_this_month: number
  bookings_today: number
  open_bookings: number
  new_customers_this_month: number
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
