# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin customers", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }
  let(:customer) { users(:one) }
  let(:employee) { users(:employee) }

  describe "GET /admin/customers" do
    it "lists customers with their lifetime value and booking count" do
      grant(admin, "customers.read")
      customer.bookings.create!(total_amount: 120, payment_status: :paid)
      customer.bookings.create!(total_amount: 80, payment_status: :unpaid)
      sign_in admin

      get admin_customers_path

      expect_inertia.to render_component("admin/customers/index")
      row = inertia.props[:customers].find { _1[:id] == customer.id }
      expect(row).to include(lifetime_value: 120.0, bookings_count: 2)
      expect(inertia.props[:customers].pluck(:id)).not_to include(admin.id, employee.id)
    end

    it "filters by search term and status" do
      grant(admin, "customers.read")
      users(:two).update!(is_active: false)
      sign_in admin

      get admin_customers_path, params: { q: "another" }
      expect(inertia.props[:customers].pluck(:id)).to eq([ users(:two).id ])

      get admin_customers_path, params: { status: "active" }
      expect(inertia.props[:customers].pluck(:id)).to eq([ customer.id ])
    end

    it "is forbidden without customers.read" do
      sign_in admin
      get admin_customers_path

      expect(response).to redirect_to(admin_root_path)
      expect(flash[:alert]).to eq("You are not authorized to perform this action")
    end
  end

  describe "GET /admin/customers/:id" do
    it "shows the customer with bookings, addresses and stats" do
      grant(admin, "customers.read")
      booking = customer.bookings.create!(total_amount: 200, payment_status: :paid, status: :completed, employee: employee)
      sign_in admin

      get admin_customer_path(customer)

      expect_inertia.to render_component("admin/customers/show")
      expect(inertia.props[:customer]).to include(id: customer.id, full_name: customer.full_name)
      expect(inertia.props[:stats]).to include(lifetime_value: 200.0, bookings_count: 1)
      expect(inertia.props[:bookings].first).to include(id: booking.id, employee: { id: employee.id, full_name: employee.full_name })
    end

    it "does not show staff as customers" do
      grant(admin, "customers.read")
      sign_in admin

      get admin_customer_path(employee)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "PATCH /admin/customers/:id/activation" do
    it "disables and re-enables a customer" do
      grant(admin, "customers.update")
      sign_in admin

      patch activation_admin_customer_path(customer), params: { is_active: false }, headers: { "HTTP_REFERER" => admin_customers_url }
      expect(response).to redirect_to(admin_customers_url)
      expect(customer.reload.is_active).to be(false)

      patch activation_admin_customer_path(customer), params: { is_active: true }
      expect(customer.reload.is_active).to be(true)
    end

    it "is forbidden with read-only access" do
      grant(admin, "customers.read")
      sign_in admin

      patch activation_admin_customer_path(customer), params: { is_active: false }
      expect(customer.reload.is_active).to be(true)
    end
  end

  it "has no routes to create or delete customers" do
    recognize = ->(path, method) { Rails.application.routes.recognize_path(path, method: method) }

    expect { recognize.("/admin/customers", :post) }.to raise_error(ActionController::RoutingError)
    expect { recognize.("/admin/customers/1", :delete) }.to raise_error(ActionController::RoutingError)
  end
end
