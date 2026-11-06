# frozen_string_literal: true

require "rails_helper"

RSpec.describe Checkout, type: :model do
  fixtures :users

  let(:user) { users(:one) }
  let!(:area) { create_area("Maadi", city: create_city("Cairo")) }
  let!(:cash) { PaymentMethod.create!(code: "cash") }
  let(:service) { create_service("Exterior Wash", price: 100, sale_price: 80) }
  let(:wax) { create_extra("Wax", price: 30) }
  let(:freshener) { create_extra("Air Freshener", price: 20) }
  let(:car) { user.cars.create!(make: "Toyota", model: "Corolla", license_plate: "ABC 123", color: "White") }
  let(:slot) { BookingSlots.upcoming.first }

  # Inside the default square around (30.0444, 31.2357).
  def checkout(**attrs)
    described_class.new(user: user, service_slug: service.slug, extra_ids: [ wax.id, freshener.id ], car_id: car.id,
                        latitude: "30.0444", longitude: "31.2357", scheduled_at: slot.iso8601, phone: "+20 100 123 4567",
                        **attrs)
  end

  it "prices from the database: the sale price plus the extras" do
    expect(checkout).to have_attributes(subtotal: 80, extras_total: 50, total: 130)
  end

  it "books the service, extras, car, address and a pending cash payment" do
    form = checkout
    expect(form.save).to be(true)

    booking = form.booking
    expect(booking).to have_attributes(user: user, car: car, car_description: "Toyota Corolla · White · ABC 123",
                                       scheduled_at: slot, subtotal: 80, extras_total: 50, total_amount: 130,
                                       status: "pending", payment_status: "unpaid")
    expect(booking.booking_items.map { [ _1.itemable, _1.price ] })
      .to contain_exactly([ service, 80 ], [ wax, 30 ], [ freshener, 20 ])
    expect(booking.service).to eq(service)
    expect(booking.booking_address).to have_attributes(name: "Pinned location", area_name: "Maadi", city_name: "Cairo")
    expect(booking.payment_transactions.sole).to have_attributes(payment_method: cash, amount: 130, status: "pending")
  end

  it "saves the phone when the customer has none" do
    checkout.save
    expect(user.reload.phone).to eq("+20 100 123 4567")
  end

  it "keeps an existing phone" do
    user.update!(phone: "0100 000 0000")
    checkout(phone: nil).save
    expect(user.reload.phone).to eq("0100 000 0000")
  end

  it "uses a saved address's own location and name" do
    address = user.addresses.create!(name: "Home", area: area, location: Area::GEO_FACTORY.point(31.2357, 30.0444))
    form = checkout(address_id: address.id, latitude: nil, longitude: nil)

    expect(form.save).to be(true)
    expect(form.booking.booking_address).to have_attributes(address: address, name: "Home")
  end

  it "drops disabled extras" do
    wax.update!(is_active: false)
    expect(checkout.extras).to eq([ freshener ])
  end

  describe "validation" do
    def errors_for(**attrs)
      form = checkout(**attrs)
      expect(form.save).to be(false)
      expect { form.save }.not_to change(Booking, :count)
      form.errors
    end

    it "rejects a disabled service" do
      service.update!(is_active: false)
      expect(errors_for[:service]).to be_present
    end

    it "requires the customer's own car" do
      other = users(:two).cars.create!(make: "BMW", model: "X5", license_plate: "XYZ 999", color: "Black")

      expect(errors_for(car_id: nil)[:car_id]).to be_present
      expect(errors_for(car_id: other.id)[:car_id]).to be_present
    end

    it "requires a location inside an active area of an active city" do
      expect(errors_for(latitude: nil, longitude: nil)[:location]).to include("must be chosen")
      expect(errors_for(latitude: "31.5", longitude: "31.2357")[:location]).to include("is outside our service area")

      area.update!(is_active: false)
      expect(errors_for[:location]).to include("is outside our service area")

      area.update!(is_active: true)
      area.city.update!(is_active: false)
      expect(errors_for[:location]).to include("is outside our service area")
    end

    it "requires one of the available slots" do
      expect(errors_for(scheduled_at: (slot + 30.minutes).iso8601)[:scheduled_at]).to be_present
      expect(errors_for(scheduled_at: 1.day.ago.iso8601)[:scheduled_at]).to be_present
    end

    it "requires a valid phone when the customer has none" do
      expect(errors_for(phone: "")[:phone]).to include("is required to book")
      expect(errors_for(phone: "call me")[:phone]).to include("must be a valid phone number")
    end

    it "needs the cash payment method" do
      cash.update!(is_active: false)
      expect(errors_for[:base]).to be_present
    end
  end

  describe "#coverage" do
    it "is nil until a location is picked" do
      expect(checkout(latitude: nil, longitude: nil).coverage).to be_nil
    end

    it "names the covering area" do
      expect(checkout.coverage).to eq(covered: true, area: "Maadi", city: "Cairo")
    end

    it "reports an uncovered point" do
      expect(checkout(latitude: "31.5").coverage).to eq(covered: false, area: nil, city: nil)
    end
  end
end
