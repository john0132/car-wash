# frozen_string_literal: true

require "rails_helper"

RSpec.describe BookingItem, type: :model do
  let(:user) { User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password") }
  let(:booking) { Booking.create!(user: user) }
  let(:service) { create_service }
  let(:extra) { Extra.create!(price: 20) }
  let(:package) { Package.create!(name: "Pro", price: 200) }

  it "is valid with a booking, itemable, quantity, and price" do
    expect(BookingItem.new(booking: booking, itemable: service, quantity: 1, price: 100)).to be_valid
  end

  it "requires a quantity greater than 0" do
    expect(BookingItem.new(booking: booking, itemable: service, quantity: 0, price: 100)).not_to be_valid
  end

  it "requires a price" do
    expect(BookingItem.new(booking: booking, itemable: service, quantity: 1)).not_to be_valid
  end

  it "stores the short, storage-stable type code for each itemable type" do
    service_item = BookingItem.create!(booking: booking, itemable: service, quantity: 1, price: 100)
    extra_item = BookingItem.create!(booking: booking, itemable: extra, quantity: 1, price: 20)
    package_item = BookingItem.create!(booking: booking, itemable: package, quantity: 1, price: 200)

    expect(service_item.itemable_type).to eq("service")
    expect(extra_item.itemable_type).to eq("extra")
    expect(package_item.itemable_type).to eq("package")
  end

  it "resolves itemable back to the correct class after reload" do
    item = BookingItem.create!(booking: booking, itemable: extra, quantity: 1, price: 20)

    expect(item.reload.itemable).to eq(extra)
  end
end
