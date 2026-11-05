# frozen_string_literal: true

require "rails_helper"

RSpec.describe Address, type: :model do
  let(:user) { User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password") }
  let(:area) { create_area }
  let(:location) { RGeo::Geographic.spherical_factory(srid: 4326).point(31.2357, 30.0444) }

  it "is valid with a user, area, name, and location" do
    expect(Address.new(user: user, area: area, name: "Home", location: location)).to be_valid
  end

  it "requires a name" do
    expect(Address.new(user: user, area: area, location: location)).not_to be_valid
  end

  it "requires a location" do
    expect(Address.new(user: user, area: area, name: "Home")).not_to be_valid
  end

  it "requires a user" do
    expect(Address.new(area: area, name: "Home", location: location)).not_to be_valid
  end

  it "requires an area" do
    expect(Address.new(user: user, name: "Home", location: location)).not_to be_valid
  end
end
