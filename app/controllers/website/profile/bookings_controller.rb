# frozen_string_literal: true

class Website::Profile::BookingsController < Website::BaseController
  def index
    bookings = Current.user.bookings.newest_first
      .includes(:booking_address, booking_items: :itemable)

    render inertia: { bookings: bookings.map { |booking| booking_props(booking) } }
  end

  private

  def booking_props(booking)
    address = booking.booking_address

    {
      id: booking.id,
      status: booking.status,
      payment_status: booking.payment_status,
      scheduled_at: booking.scheduled_at,
      created_at: booking.created_at,
      total_amount: booking.total_amount.to_f,
      address: address && "#{address.name} · #{address.area_name}, #{address.city_name}",
      items: booking.booking_items.map { |item| item_props(item) }
    }
  end

  def item_props(item)
    { id: item.id, name: item.itemable&.translated(:name), quantity: item.quantity }
  end
end
