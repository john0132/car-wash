# frozen_string_literal: true

require "rails_helper"

RSpec.describe Subscription, type: :model do
  it "is valid with valid attributes" do
    expect(Subscription.new(name: "Pro", discount_type: :percentage, discount_value: 10, price: 100)).to be_valid
  end

  it "requires a name" do
    expect(Subscription.new(discount_type: :percentage, discount_value: 10, price: 100)).not_to be_valid
  end

  it "requires a discount_type" do
    expect(Subscription.new(name: "Pro", discount_value: 10, price: 100)).not_to be_valid
  end

  it "defaults is_active to true" do
    subscription = Subscription.create!(name: "Pro", discount_type: :percentage, discount_value: 10, price: 100)
    expect(subscription.is_active).to be(true)
  end
end
