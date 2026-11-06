# frozen_string_literal: true

# One of the customer's bookings: where checkout lands (the thank-you page) and
# where "My bookings" links to. Scoped to the signed-in customer, so anyone
# else's booking is a 404.
class Website::BookingsController < Website::BaseController
  def show
    booking = Current.user.bookings
      .includes(:booking_address, booking_items: :itemable, payment_transactions: { payment_method: :payment_method_translations })
      .find(params[:id])

    render inertia: { booking: booking_props(booking), just_placed: params[:placed].present? }
  end

  private

  def booking_props(booking)
    address = booking.booking_address
    payment = booking.payment_transactions.max_by(&:created_at)

    {
      id: booking.id,
      status: booking.status,
      payment_status: booking.payment_status,
      scheduled_at: booking.scheduled_at,
      created_at: booking.created_at,
      items: booking.booking_items.map { |item| item_props(item) },
      subtotal: booking.subtotal.to_f,
      extras_total: booking.extras_total.to_f,
      total_amount: booking.total_amount.to_f,
      car: booking.car_description,
      address: address && { name: address.name, area: address.area_name, city: address.city_name },
      payment_method: payment&.payment_method&.translated(:name)
    }
  end

  def item_props(item)
    itemable = item.itemable

    {
      id: item.id,
      kind: item.itemable_type,
      name: itemable.respond_to?(:translated) ? itemable.translated(:name) : itemable&.name,
      quantity: item.quantity,
      price: item.price.to_f
    }
  end
end
