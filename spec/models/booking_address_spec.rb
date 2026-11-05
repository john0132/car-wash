# frozen_string_literal: true

require "rails_helper"

RSpec.describe BookingAddress, type: :model do
  let(:user) { User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password") }
  let(:booking) { Booking.create!(user: user) }
  let(:location) { RGeo::Geographic.spherical_factory(srid: 4326).point(31.2357, 30.0444) }

  it "is valid with a booking, name, area_name, city_name, and location" do
    expect(
      BookingAddress.new(booking: booking, name: "Home", area_name: "Nasr City", city_name: "Cairo",
        location: location)
    ).to be_valid
  end

  it "requires a name" do
    expect(BookingAddress.new(booking: booking, area_name: "Nasr City", city_name: "Cairo", location: location))
      .not_to be_valid
  end

  it "requires a location" do
    expect(BookingAddress.new(booking: booking, name: "Home", area_name: "Nasr City", city_name: "Cairo"))
      .not_to be_valid
  end

  it "does not require an address" do
    expect(
      BookingAddress.new(booking: booking, name: "Home", area_name: "Nasr City", city_name: "Cairo",
        location: location).address
    ).to be_nil
  end
end
