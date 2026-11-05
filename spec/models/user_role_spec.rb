# frozen_string_literal: true

require "rails_helper"

RSpec.describe UserRole, type: :model do
  let(:employee) { User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password", role: "employee") }
  let(:customer) { User.create!(name: "John", email: "john@example.com", password: "a-very-long-password") }
  let(:role) { Role.create!(name: "cashier") }

  it "is valid for an employee" do
    expect(UserRole.new(user: employee, role: role)).to be_valid
  end

  it "rejects a customer" do
    expect(UserRole.new(user: customer, role: role)).not_to be_valid
  end

  it "rejects duplicate role assignments for the same user" do
    UserRole.create!(user: employee, role: role)
    expect(UserRole.new(user: employee, role: role)).not_to be_valid
  end
end
