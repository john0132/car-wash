# frozen_string_literal: true

require "rails_helper"

RSpec.describe Package, type: :model do
  it "is valid with valid attributes" do
    expect(Package.new(name: "Pro", price: 100)).to be_valid
  end

  it "requires a name" do
    expect(Package.new(price: 100)).not_to be_valid
  end

  it "requires a price" do
    expect(Package.new(name: "Pro")).not_to be_valid
  end

  it "defaults is_active to true" do
    expect(Package.create!(name: "Pro", price: 100).is_active).to be(true)
  end
end
