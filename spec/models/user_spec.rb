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

  describe "#permission?" do
    it "grants admins every permission" do
      admin = User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password", role: "admin")
      expect(admin.permission?("booking", "destroy")).to be(true)
    end

    it "denies customers every permission" do
      customer = User.create!(name: "John", email: "john@example.com", password: "a-very-long-password")
      expect(customer.permission?("booking", "create")).to be(false)
    end

    it "grants an employee a permission only when their role has it" do
      employee = User.create!(name: "Amy", email: "amy@example.com", password: "a-very-long-password", role: "employee")
      role = Role.create!(name: "cashier")
      permission = Permission.create!(resource: "booking", action: "create")
      role.permissions << permission
      employee.roles << role

      expect(employee.permission?("booking", "create")).to be(true)
      expect(employee.permission?("booking", "destroy")).to be(false)
    end
  end
end
