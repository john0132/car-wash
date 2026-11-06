# frozen_string_literal: true

# Checkout for one service plus optional extras, named in the query string
# (`?service=<slug>&extras[]=<id>`), so the selection survives a refresh and the
# sign-in redirect. All rules live in Checkout; this only maps params and props.
class Website::CheckoutsController < Website::BaseController
  def show
    checkout = build_checkout
    return redirect_to services_path, alert: "That service is not available to book" unless checkout.service

    render inertia: {
      summary: summary_props(checkout),
      cars: Current.user.cars.order(:created_at, :id).map { |car| car_props(car) },
      addresses: Current.user.addresses.order(:created_at, :id).map { |address| address_props(address) },
      slots: BookingSlots.grouped,
      needs_phone: checkout.needs_phone?,
      # Refreshed by a partial reload whenever the customer moves the pin.
      coverage: -> { checkout.coverage }
    }
  end

  def create
    checkout = build_checkout

    if checkout.save
      # `placed` turns the booking page into the thank-you page.
      redirect_to booking_path(checkout.booking, placed: 1)
    else
      redirect_back_or_to checkout_path(service: checkout.service_slug, extras: checkout.extra_ids),
        inertia: { errors: checkout.errors.to_hash(true) } # full messages: "Car must be chosen"
    end
  end

  private

  def build_checkout
    permitted = params.permit(:service, :car_id, :address_id, :latitude, :longitude, :scheduled_at, :phone, extras: [])

    Checkout.new(
      user: Current.user,
      service_slug: permitted[:service],
      extra_ids: permitted[:extras] || [],
      **permitted.slice(:car_id, :address_id, :latitude, :longitude, :scheduled_at, :phone).to_h.symbolize_keys
    )
  end

  def summary_props(checkout)
    service = checkout.service

    {
      service: { slug: service.slug, name: service.translated(:name), price: checkout.subtotal.to_f,
                 duration_minutes: service.duration_minutes },
      extras: checkout.extras.map { |extra| { id: extra.id, name: extra.translated(:name), price: extra.price.to_f } },
      subtotal: checkout.subtotal.to_f,
      extras_total: checkout.extras_total.to_f,
      total: checkout.total.to_f
    }
  end

  def car_props(car)
    { id: car.id, description: car.description }
  end

  def address_props(address)
    { id: address.id, name: address.name, latitude: address.latitude, longitude: address.longitude }
  end
end
