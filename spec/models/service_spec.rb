# frozen_string_literal: true

require "rails_helper"

RSpec.describe Service, type: :model do
  let(:service_category) { ServiceCategory.create! }

  it "is valid with valid attributes" do
    expect(Service.new(service_category: service_category, price: 100)).to be_valid
  end

  it "requires a service category" do
    expect(Service.new(price: 100)).not_to be_valid
  end

  it "requires a price" do
    expect(Service.new(service_category: service_category)).not_to be_valid
  end

  it "defaults is_active to true" do
    expect(Service.create!(service_category: service_category, price: 100).is_active).to be(true)
  end

  it "allows a sale price below the price" do
    expect(Service.new(service_category: service_category, price: 100, sale_price: 80)).to be_valid
  end

  it "rejects a sale price greater than or equal to the price" do
    expect(Service.new(service_category: service_category, price: 100, sale_price: 100)).not_to be_valid
  end
end
