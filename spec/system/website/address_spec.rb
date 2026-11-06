# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Adding an address", type: :system do
  fixtures :users

  let!(:area) { create_area("Maadi", city: create_city("Cairo")) }
  let(:user) { users(:one) }

  before { sign_in user }

  it "pins the place on a map that works from the keyboard, with no coordinates to type" do
    visit profile_addresses_path
    click_on "Add address", match: :first

    fill_in "Label", with: "Home"
    # Picking the area puts the pin inside it.
    pick_option("#address_area", "Cairo — Maadi")
    expect(page).to have_text("Pin at 30.04440, 31.23570")

    # Focus the map and nudge the pin east with the arrow key.
    find(".leaflet-container").send_keys(:arrow_right, :arrow_right)
    expect(page).to have_no_text("31.23570")
    expect(page).to have_text(/Pin at 30\.044\d+, 31\.23[6-9]\d*/)

    within("[role=dialog]") { click_on "Add address" }

    expect(page).to have_text("Address added")
    address = user.addresses.last
    expect(address).to have_attributes(name: "Home", area_id: area.id)
    expect(address.longitude).to be > 31.2357
    expect(address.latitude).to be_within(0.0001).of(30.0444)
  end
end
