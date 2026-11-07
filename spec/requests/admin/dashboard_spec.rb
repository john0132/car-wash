# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin dashboard", type: :request do
  fixtures :users

  describe "GET /admin" do
    it "redirects signed-out visitors to the admin sign in" do
      get admin_root_path
      expect(response).to redirect_to(admin_sign_in_path)
    end

    it "keeps customers out of the admin area" do
      sign_in users(:one)
      get admin_root_path
      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("You are not authorized to access the admin area")
    end

    %i[admin employee].each do |role|
      it "renders the admin dashboard for #{role}s with the admin layout" do
        sign_in users(role)
        get admin_root_path

        expect(response).to have_http_status(:success)
        expect_inertia.to render_component("admin/dashboard/index")
        expect_inertia.to have_props(admin: { permissions: [], is_super_admin: false })
        expect(response.body).to match(%r{assets/admin-[\w-]+\.js})
        expect(response.body).not_to match(%r{assets/website-[\w-]+\.js})
      end
    end

    it "shares the permissions granted by the admin's roles" do
      users(:admin).roles << Role.super_admin!
      sign_in users(:admin)
      get admin_root_path

      expect_inertia.to have_props(admin: { permissions: users(:admin).permission_names, is_super_admin: true })
      expect(users(:admin).permission_names).to include("customers.read", "admins.delete")
    end

    it "forces a full reload when a website client visits an admin page" do
      sign_in users(:admin)
      get admin_root_path, headers: { "X-Inertia" => "true", "X-Inertia-Version" => InertiaRails.configuration.version.to_s }

      expect(response).to have_http_status(:conflict)
    end

    it "gives admins the company-wide reports their roles can read" do
      customer = User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password")
      customer.bookings.create!(total_amount: 100, payment_status: :paid, status: :completed)
      # Other fixture users ("one", "two") count toward this too — compare against the same query.
      new_customers = User.customer.where(created_at: Time.current.beginning_of_month..).count
      grant(users(:admin), "bookings.read", "payment_transactions.read", "customers.read")

      sign_in users(:admin)
      get admin_root_path

      expect_inertia.to have_props(
        view: "admin",
        kpis: {
          revenue_this_month: 100.0, bookings_today: 0, open_bookings: 0, new_customers_this_month: new_customers
        }
      )
      expect(inertia.props).to include(:revenue_trend, :top_items, :status_breakdown, :upcoming_bookings)
      expect(inertia.props[:revenue_trend]).to be_present
    end

    it "gives an admin without matching permissions no revenue, booking or customer data" do
      Booking.create!(user: users(:one), total_amount: 100, payment_status: :paid, status: :completed)

      sign_in users(:admin)
      get admin_root_path

      expect(inertia.props[:kpis].values).to all(be_nil)
      expect(inertia.props.values_at(:status_breakdown, :payment_status_breakdown, :revenue_trend,
        :top_items, :upcoming_bookings)).to all(be_nil)
    end

    it "shows booking reports without revenue to an admin who reads bookings but not payments" do
      grant(users(:admin), "bookings.read")

      sign_in users(:admin)
      get admin_root_path

      expect(inertia.props[:kpis]).to include(revenue_this_month: nil, bookings_today: 0, new_customers_this_month: nil)
      expect(inertia.props[:revenue_trend]).to be_nil
      expect(inertia.props[:top_items]).to be_nil
      expect(inertia.props[:upcoming_bookings]).to eq([])
    end

    it "gives employees their own bookings for today instead of company-wide reports" do
      customer = User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password")
      booking = customer.bookings.create!(employee: users(:employee), scheduled_at: Time.current, status: :confirmed)
      customer.bookings.create!(employee: users(:employee), scheduled_at: 1.day.from_now, status: :confirmed)

      sign_in users(:employee)
      get admin_root_path

      expect_inertia.to have_props(view: "employee")
      expect(inertia.props[:today_bookings].pluck(:id)).to eq([ booking.id ])
    end
  end
end
