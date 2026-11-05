import type { BookingStatusCounts } from "@/admin/features/bookings/types"
import type { ManagedUser } from "@/admin/features/users/types"

/** Admin::EmployeesController#index row */
export interface EmployeeRow extends ManagedUser {
  assigned_count: number
  completed_count: number
  open_count: number
}

export interface EmployeeStats {
  assigned_count: number
  completed_count: number
  open_count: number
  /** Completed ÷ (completed + cancelled), %; null until something finished. */
  completion_rate: number | null
  completed_revenue: number
  next_booking_at: string | null
  by_status: BookingStatusCounts
}
