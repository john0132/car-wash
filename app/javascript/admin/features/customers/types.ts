import type { BookingStatusCounts } from "@/admin/features/bookings/types"
import type { ManagedUser } from "@/admin/features/users/types"

export interface MembershipTier {
  id: number
  name: string | null
  background_color: string
  text_color: string
  egp_to_points: number
  points_to_egp: number
}

/** Admin::CustomersController#index row */
export interface CustomerRow extends ManagedUser {
  wallet: number
  points: number
  lifetime_value: number
  bookings_count: number
  membership: MembershipTier | null
}

/** Admin::CustomersController#show */
export interface CustomerDetail extends ManagedUser {
  wallet: number
  points: number
  lifetime_points: number
  membership: MembershipTier | null
  package: { id: number; name: string; price: number } | null
}

export interface CustomerStats {
  lifetime_value: number
  average_order_value: number
  bookings_count: number
  by_status: BookingStatusCounts
  last_booking_at: string | null
}

export interface CustomerAddress {
  id: number
  name: string
  area: string | null
  city: string | null
  latitude: number
  longitude: number
}

export interface CustomerCar {
  id: number
  make: string
  model: string
  license_plate: string
  color: string
}

export interface CustomerTransaction {
  id: number
  amount: number
  status: "pending" | "completed" | "failed" | "refunded"
  reference: string | null
  payment_method: string
  booking_id: number | null
  created_at: string
}
