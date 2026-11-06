# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Website checkout", type: :request do
  fixtures :users

  let(:user) { users(:one) }
  let!(:area) { create_area("Maadi", city: create_city("Cairo")) }
  let(:service) { create_service("Exterior Wash", price: 100) }
  let(:extra) { create_extra("Wax", price: 30) }
  let(:car) { user.cars.create!(make: "Toyota", model: "Corolla", license_plate: "ABC 123", color: "White") }
  let(:query) { { service: service.slug, extras: [ extra.id ] } }

  before { create_payment_method("cash") }

  it "sends a guest to sign in, then back to the same checkout" do
    get checkout_path(query)
    expect(response).to redirect_to(sign_in_path)

    post sign_in_path, params: { email: user.email, password: "Secret1*3*5*" }
    expect(response).to redirect_to(checkout_path(query))
  end

  context "when signed in" do
    before { sign_in user }

    it "offers the areas we serve, each with a point inside it to start the map from" do
      get checkout_path(query)

      expect(inertia.props[:areas]).to contain_exactly(
        include(id: area.id, name: "Maadi", city: "Cairo", latitude: be_within(0.011).of(30.0444), longitude: be_within(0.011).of(31.2357))
      )
      point = Area::GEO_FACTORY.point(inertia.props[:areas].first[:longitude], inertia.props[:areas].first[:latitude])
      expect(Area.covering(point)).to include(area)
    end

    it "renders the summary priced by the server" do
      car

      get checkout_path(query)

      expect_inertia.to render_component("website/checkouts/show")
      expect(inertia.props[:summary]).to include(subtotal: 100.0, extras_total: 30.0, total: 130.0)
      expect(inertia.props[:summary][:extras].pluck(:name)).to eq([ "Wax" ])
      expect(inertia.props[:cars].pluck(:description)).to eq([ "Toyota Corolla · White · ABC 123" ])
      expect(inertia.props[:needs_phone]).to be(true)
      expect(inertia.props[:slots]).to be_present
      expect(inertia.props[:coverage]).to be_nil
    end

    it "checks coverage for the pinned location on a partial reload" do
      get checkout_path(query.merge(latitude: "30.0444", longitude: "31.2357")),
        headers: { "X-Inertia" => "true", "X-Inertia-Partial-Component" => "website/checkouts/show",
                   "X-Inertia-Partial-Data" => "coverage" }

      # A partial reload: only `coverage` (plus the always-sent errors), keyed by string.
      expect(inertia.props.keys).to contain_exactly("errors", "coverage")
      expect(inertia.props["coverage"]).to eq("covered" => true, "area" => "Maadi", "city" => "Cairo")
    end

    it "sends an unknown service back to the services list" do
      get checkout_path(service: "nope")
      expect(response).to redirect_to(services_path)
    end

    it "places the booking and lands on its page" do
      params = query.merge(car_id: car.id, latitude: "30.0444", longitude: "31.2357",
                           scheduled_at: BookingSlots.upcoming.first.iso8601, phone: "01001234567")

      expect { post checkout_path, params: params }.to change(user.bookings, :count).by(1)
      expect(response).to redirect_to(booking_path(user.bookings.last, placed: 1))
    end

    it "returns to the checkout with errors when something is missing" do
      checkout_url = checkout_path(query)

      expect { post checkout_path, params: query, headers: { "Referer" => checkout_url } }
        .not_to change(Booking, :count)
      expect(response).to redirect_to(checkout_url)
      expect(session[:inertia_errors]).to include(:car_id, :location, :scheduled_at, :phone)
    end
  end
end
