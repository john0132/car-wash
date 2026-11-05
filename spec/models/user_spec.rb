# frozen_string_literal: true

require "rails_helper"

RSpec.describe User, type: :model do
  it "is valid with valid attributes" do
    expect(User.new(name: "Jane", email: "jane@example.com", password: "a-very-long-password")).to be_valid
  end

  it "requires a name" do
    expect(User.new(email: "jane@example.com", password: "a-very-long-password")).not_to be_valid
  end

  it "defaults role to customer" do
    user = User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password")
    expect(user.role).to eq("customer")
  end

  it "defaults is_active to true" do
    user = User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password")
    expect(user.is_active).to be(true)
  end

  it "rejects roles outside admin, employee, and customer" do
    expect { User.new(role: "manager") }.to raise_error(ArgumentError)
  end
end
