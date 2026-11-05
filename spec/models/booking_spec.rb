# frozen_string_literal: true

require "rails_helper"

RSpec.describe Booking, type: :model do
  let(:user) { User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password") }
  let(:service_category) { ServiceCategory.create! }
  let(:service) { Service.create!(service_category: service_category, price: 100) }
  let(:extra) { Extra.create!(price: 20) }

  it "is valid with a user" do
    expect(Booking.new(user: user)).to be_valid
  end

  it "requires a user" do
    expect(Booking.new).not_to be_valid
  end

  it "rejects a negative subtotal" do
    expect(Booking.new(user: user, subtotal: -1)).not_to be_valid
  end

  it "defaults status to pending" do
    expect(Booking.create!(user: user).status).to eq("pending")
  end

  it "defaults payment_status to unpaid" do
    expect(Booking.create!(user: user).payment_status).to eq("unpaid")
  end

  describe "#extras" do
    it "returns extras attached to the booking via booking_items" do
      booking = Booking.create!(user: user)
      booking.booking_items.create!(itemable: service, quantity: 1, price: service.price)
      booking.booking_items.create!(itemable: extra, quantity: 1, price: extra.price)

      expect(booking.extras).to contain_exactly(extra)
    end
  end
end
