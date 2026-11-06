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
