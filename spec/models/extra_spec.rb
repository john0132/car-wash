# frozen_string_literal: true

require "rails_helper"

RSpec.describe Extra, type: :model do
  it "is valid with a price" do
    expect(Extra.new(price: 20)).to be_valid
  end

  it "requires a price" do
    expect(Extra.new).not_to be_valid
  end

  it "defaults is_active to true" do
    expect(Extra.create!(price: 20).is_active).to be(true)
  end
end
