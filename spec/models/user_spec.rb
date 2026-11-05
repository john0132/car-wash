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
    let(:admin) { User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password", role: "admin") }

    it "denies an admin without roles every permission" do
      expect(admin.permission?("customers", "read")).to be(false)
    end

    it "grants an admin a permission only when one of their roles has it" do
      role = Role.create!(name: "support")
      role.permissions << Permission.find_or_create_by!(resource: "customers", action: "read")
      admin.roles << role

      expect(admin.permission?("customers", "read")).to be(true)
      expect(admin.permission?("customers", "update")).to be(false)
      expect(admin.permission_names).to eq([ "customers.read" ])
    end

    it "grants a super admin every catalog permission" do
      admin.roles << Role.super_admin!

      expect(admin.permission_names).to match_array(Permission::CATALOG.flat_map { |r, actions| actions.map { "#{r}.#{_1}" } })
    end

    it "denies customers and employees every permission" do
      customer = User.create!(name: "John", email: "john@example.com", password: "a-very-long-password")
      employee = User.create!(name: "Amy", email: "amy@example.com", password: "a-very-long-password", role: "employee")

      expect(customer.permission?("customers", "read")).to be(false)
      expect(employee.permission?("customers", "read")).to be(false)
      expect(employee.permission_names).to eq([])
    end
  end

  describe "deactivation" do
    it "signs the user out everywhere" do
      user = User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password")
      user.sessions.create!
      user.sessions.create!

      expect { user.update!(is_active: false) }.to change { user.sessions.count }.from(2).to(0)
    end
  end

  describe ".with_status" do
    it "filters active and disabled users, and returns everyone otherwise" do
      active = User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password")
      disabled = User.create!(name: "John", email: "john@example.com", password: "a-very-long-password", is_active: false)

      users = User.where(id: [ active, disabled ])

      expect(users.with_status("active")).to contain_exactly(active)
      expect(users.with_status("inactive")).to contain_exactly(disabled)
      expect(users.with_status(nil)).to contain_exactly(active, disabled)
    end
  end

  describe ".with_customer_totals" do
    it "adds lifetime value (paid bookings only) and booking count" do
      user = User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password")
      user.bookings.create!(total_amount: 100, payment_status: :paid)
      user.bookings.create!(total_amount: 50, payment_status: :paid)
      user.bookings.create!(total_amount: 70, payment_status: :unpaid)

      row = User.with_customer_totals.find(user.id)
      expect(row.lifetime_value).to eq(150)
      expect(row.bookings_count).to eq(3)
    end
  end

  describe ".with_assignment_counts" do
    it "adds assigned, completed and open counts" do
      customer = User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password")
      employee = User.create!(name: "Amy", email: "amy@example.com", password: "a-very-long-password", role: "employee")
      %i[completed pending in_progress cancelled].each { customer.bookings.create!(employee: employee, status: _1) }

      row = User.with_assignment_counts.find(employee.id)
      expect([ row.assigned_count, row.completed_count, row.open_count ]).to eq([ 4, 1, 2 ])
    end
  end

  describe ".search" do
    it "matches name, last name and email case-insensitively" do
      jane = User.create!(name: "Jane", last_name: "Doe", email: "jane@example.com", password: "a-very-long-password")
      User.create!(name: "John", email: "john@example.com", password: "a-very-long-password")

      expect(User.search("doe")).to contain_exactly(jane)
      expect(User.search("JANE@")).to contain_exactly(jane)
      expect(User.search("")).to include(jane)
    end
  end
end
