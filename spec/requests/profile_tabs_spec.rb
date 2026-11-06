# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Profile tabs", type: :request do
  fixtures :users

  let(:user) { users(:one) }

  def create_area
    city = City.new
    city.city_translations.build(language: Language.find_or_create_by!(code: "en") { |l| l.name = "English" }, name: "Cairo")
    city.save!
    area = Area.new(city: city, rate: 10)
    area.area_translations.build(language: Language.find_by!(code: "en"), name: "Maadi")
    area.geofence_geojson = { type: "Polygon", coordinates: [ [ [ 31, 29 ], [ 32, 29 ], [ 32, 30 ], [ 31, 29 ] ] ] }
    area.save!
    area
  end

  it "sends signed-out visitors to sign in" do
    %i[profile_bookings_path profile_addresses_path profile_cars_path].each do |helper|
      get public_send(helper)
      expect(response).to redirect_to(sign_in_path)
    end
  end

  context "when signed in" do
    before { sign_in user }

    it "renders bookings and cars" do
      get profile_bookings_path
      expect(response).to have_http_status(:success)
      get profile_cars_path
      expect(response).to have_http_status(:success)
    end

    it "paginates bookings" do
      12.times do
        Booking.create!(user: user, car_description: "Toyota Corolla", subtotal: 100, total_amount: 100)
      end

      get profile_bookings_path
      expect(inertia.props[:bookings].size).to eq(10)
      expect(inertia.props[:pagination]).to include(page: 1, pages: 2, total: 12)

      get profile_bookings_path(page: 2)
      expect(inertia.props[:bookings].size).to eq(2)
    end

    it "manages addresses" do
      area = create_area
      get profile_addresses_path
      expect(response).to have_http_status(:success)

      expect {
        post profile_addresses_path, params: { name: "Home", area_id: area.id, latitude: "29.9", longitude: "31.2" }
      }.to change { user.addresses.count }.by(1)

      address = user.addresses.last
      patch profile_address_path(address), params: { name: "Work", area_id: area.id, latitude: "29.8", longitude: "31.3" }
      expect(address.reload.name).to eq("Work")

      expect { delete profile_address_path(address) }.to change { user.addresses.count }.by(-1)
    end

    it "manages the customer's own cars" do
      other = users(:two).cars.create!(make: "BMW", model: "X5", license_plate: "XYZ 999", color: "Black")

      expect {
        post profile_cars_path, params: { make: "Toyota", model: "Corolla", license_plate: "abc 123", color: "White" }
      }.to change { user.cars.count }.by(1)

      get profile_cars_path
      expect(inertia.props[:cars].pluck(:license_plate)).to eq([ "ABC 123" ])

      car = user.cars.last
      patch profile_car_path(car), params: { make: "Honda", model: "Civic", license_plate: "abc 123", color: "Red" }
      expect(car.reload.make).to eq("Honda")

      expect { delete profile_car_path(car) }.to change { user.cars.count }.by(-1)
      delete profile_car_path(other)
      expect(response).to have_http_status(:not_found)
    end

    it "returns to the page that added a car, such as checkout" do
      post profile_cars_path, params: { make: "Toyota", model: "Corolla", license_plate: "abc 123", color: "White" },
                              headers: { "Referer" => "http://www.example.com/checkout?service=wash" }
      expect(response).to redirect_to("http://www.example.com/checkout?service=wash")
    end

    it "rejects an incomplete car" do
      expect { post profile_cars_path, params: { make: "Toyota" } }.not_to change(Car, :count)
      expect(session[:inertia_errors]).to include(:model, :license_plate, :color)
    end

    it "rejects bad coordinates" do
      area = create_area
      expect {
        post profile_addresses_path, params: { name: "Home", area_id: area.id, latitude: "abc", longitude: "31" }
      }.not_to change(Address, :count)
      expect(session[:inertia_errors]).to include(:latitude)
    end

    it "cannot touch someone else's address" do
      area = create_area
      other = users(:two).addresses.create!(name: "X", area: area, location: Area::GEO_FACTORY.point(31, 29))
      delete profile_address_path(other)
      expect(response).to have_http_status(:not_found)
    end
  end
end
