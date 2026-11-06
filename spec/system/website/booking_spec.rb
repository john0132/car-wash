# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Booking a service", type: :system do
  fixtures :users

  let(:user) { users(:one) }
  let!(:area) { create_area("Maadi", city: create_city("Cairo")) }
  let!(:service) { create_service("Exterior Wash", price: 100) }
  let!(:car) { user.cars.create!(make: "Toyota", model: "Corolla", license_plate: "ABC 123", color: "White") }

  before { create_payment_method("cash") }

  it "goes from the service page through sign-in to a placed booking" do
    visit service_path(service.slug)
    click_on "Book now"

    # A guest is sent to sign in, then back to the same checkout.
    expect(page).to have_current_path(sign_in_path)
    fill_in "Email address", with: user.email
    fill_in "Password", with: "Secret1*3*5*"
    click_on "Log in"
    expect(page).to have_css("h1", text: "Book Exterior Wash")

    fill_in "Phone number", with: "+20 100 123 4567"
    # One car: nothing to pick. The location comes from the area list (no map needed).
    pick_option("[aria-labelledby=checkout-area-label]", "Cairo — Maadi")
    expect(page).to have_text("We serve Maadi, Cairo.")
    find("[aria-label^='Times on'] label", match: :first).click

    click_on "Confirm booking"

    expect(page).to have_css("h1", text: "Thank you!")
    expect(page).to have_text("EGP 100.00")
    expect(Booking.last).to have_attributes(user_id: user.id, total_amount: 100)
  end

  describe "checkout" do
    before do
      sign_in user
      user.cars.create!(make: "Honda", model: "Civic", license_plate: "XYZ 987", color: "Black")
    end

    it "moves focus to the first step with a problem after a failed submit" do
      visit checkout_path(service: service.slug)
      click_on "Confirm booking"

      expect(page).to have_text("Phone is required to book")
      expect(focused_id).to eq("checkout-step-1")
    end

    it "ignores a stale draft instead of submitting it, and re-checks a restored pin" do
      set_checkout_draft(service, car_id: 0, address_id: 0, latitude: 30.0444, longitude: 31.2357,
                                  scheduled_at: "2000-01-01T10:00:00+02:00", phone: "+20 100 123 4567")

      visit checkout_path(service: service.slug)

      # The pin from the draft is checked on arrival, without touching the map.
      expect(page).to have_text("We serve Maadi, Cairo.")
      # The deleted car and the past slot are not silently submitted.
      expect(page).to have_no_css("input[type=radio]:checked", visible: :all)
      click_on "Confirm booking"
      expect(page).to have_text("Car must be chosen")
      expect(page).to have_text("Scheduled at must be one of the available times")
    end
  end
end
