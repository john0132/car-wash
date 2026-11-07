# frozen_string_literal: true

# A booking as one row of a dashboard list (bookings, customer and employee profiles, the
# home page). Matches `BookingRow` in app/javascript/admin/features/bookings/types.ts.
# Preload `booking_address`, `booking_items`, `user` and `employee`.
module Admin::BookingProps
  extend ActiveSupport::Concern

  private

  def booking_props(booking)
    {
      id: booking.id,
      status: booking.status,
      payment_status: booking.payment_status,
      total_amount: booking.total_amount.to_f,
      items_count: booking.booking_items.sum(&:quantity),
      scheduled_at: booking.scheduled_at,
      created_at: booking.created_at,
      address: booking.booking_address&.then { |a| "#{a.name}, #{a.area_name}" },
      customer: booking.user && { id: booking.user.id, full_name: booking.user.full_name },
      employee: booking.employee && { id: booking.employee.id, full_name: booking.employee.full_name }
    }
  end
end
