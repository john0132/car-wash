# frozen_string_literal: true

require "rails_helper"

RSpec.describe Service, type: :model do
  let(:service_category) { create_service_category }

  it "is valid with valid attributes" do
    expect(build_service(service_category: service_category)).to be_valid
  end

  it "requires a service category" do
    expect(build_service(service_category: nil)).not_to be_valid
  end

  it "requires a price" do
    expect(build_service(service_category: service_category, price: nil)).not_to be_valid
  end

  it "requires a name in the default language" do
    service = Service.new(service_category: service_category, price: 100)

    expect(service).not_to be_valid
    expect(service.errors[:translations]).to eq([ "must include a name in English" ])
  end

  it "defaults is_active to true" do
    expect(create_service(service_category: service_category).is_active).to be(true)
  end

  it "allows a sale price below the price" do
    expect(build_service(service_category: service_category, price: 100, sale_price: 80)).to be_valid
  end

  it "rejects a sale price greater than or equal to the price" do
    expect(build_service(service_category: service_category, price: 100, sale_price: 100)).not_to be_valid
  end

  it "can't be deleted once it was booked" do
    service = create_service(service_category: service_category)
    user = User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password")
    Booking.create!(user: user).booking_items.create!(itemable: service, quantity: 1, price: 100)

    expect(service.destroy).to be(false)
    expect(Service.exists?(service.id)).to be(true)
  end
end
