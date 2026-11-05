# frozen_string_literal: true

require "rails_helper"

RSpec.describe Role, type: :model do
  it "is valid with a unique name" do
    expect(Role.new(name: "cashier")).to be_valid
  end

  it "requires a name" do
    expect(Role.new).not_to be_valid
  end

  it "requires a unique name" do
    Role.create!(name: "cashier")
    expect(Role.new(name: "cashier")).not_to be_valid
  end
end
