# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Website booking page", type: :request do
  fixtures :users

  let(:user) { users(:one) }
  let(:booking) do
    Booking.create!(user: user, car_description: "Toyota Corolla · White · ABC 123", subtotal: 100, total_amount: 100).tap do |b|
      b.booking_items.create!(itemable: create_service("Exterior Wash", price: 100), price: 100)
    end
  end

  it "requires sign-in" do
    get booking_path(booking)
    expect(response).to redirect_to(sign_in_path)
  end

  it "shows the customer's own booking" do
    sign_in user

    get booking_path(booking)

    expect_inertia.to render_component("website/bookings/show")
    expect(inertia.props[:booking]).to include(id: booking.id, car: "Toyota Corolla · White · ABC 123", total_amount: 100.0)
    expect(inertia.props[:booking][:items]).to contain_exactly(include(kind: "service", name: "Exterior Wash", price: 100.0))
  end

  it "hides other customers' bookings" do
    sign_in users(:two)

    get booking_path(booking)

    expect(response).to have_http_status(:not_found)
  end
end
