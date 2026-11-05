# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin employees", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }
  let(:employee) { users(:employee) }
  let(:customer) { users(:one) }

  before { sign_in admin }

  def assign(status, total: 100)
    customer.bookings.create!(employee: employee, status: status, total_amount: total, scheduled_at: 1.day.from_now)
  end

  describe "GET /admin/employees" do
    it "lists employees with booking counts" do
      grant(admin, "employees.read")
      assign(:completed)
      assign(:pending)
      assign(:cancelled)

      get admin_employees_path

      expect_inertia.to render_component("admin/employees/index")
      row = inertia.props[:employees].find { _1[:id] == employee.id }
      expect(row).to include(assigned_count: 3, completed_count: 1, open_count: 1)
    end
  end

  describe "GET /admin/employees/:id" do
    before do
      grant(admin, "employees.read")
      assign(:completed, total: 150)
      assign(:completed, total: 50)
      assign(:cancelled)
      assign(:confirmed)
    end

    it "shows stats and assigned bookings" do
      get admin_employee_path(employee)

      expect_inertia.to render_component("admin/employees/show")
      expect(inertia.props[:stats]).to include(
        assigned_count: 4, completed_count: 2, open_count: 1, completion_rate: 67, completed_revenue: 200.0
      )
      expect(inertia.props[:stats][:by_status]).to include(completed: 2, cancelled: 1, confirmed: 1, pending: 0)
      expect(inertia.props[:bookings].size).to eq(4)
    end

    it "filters assigned bookings by status" do
      get admin_employee_path(employee), params: { booking_status: "completed" }

      expect(inertia.props[:bookings].pluck(:status).uniq).to eq([ "completed" ])
      expect(inertia.props[:booking_status]).to eq("completed")
    end
  end

  describe "create, update and delete" do
    before { grant(admin, "employees.create", "employees.update", "employees.delete") }

    it "creates an employee" do
      post admin_employees_path, params: { user: { name: "Karim", email: "karim@example.com",
                                                   password: "a-very-long-password", is_active: true } }

      expect(User.find_by!(email: "karim@example.com")).to be_employee
    end

    it "ignores role_ids for employees" do
      role = Role.create!(name: "Support")
      patch admin_employee_path(employee), params: { user: { name: "Emp", role_ids: [ role.id ] } }

      expect(employee.reload.name).to eq("Emp")
      expect(employee.roles).to be_empty
    end

    it "disables an employee" do
      patch activation_admin_employee_path(employee), params: { is_active: false }
      expect(employee.reload.is_active).to be(false)
    end

    it "deletes an employee and unassigns their bookings" do
      booking = assign(:confirmed)

      expect { delete admin_employee_path(employee) }.to change(User, :count).by(-1)
      expect(booking.reload.employee).to be_nil
    end
  end
end
