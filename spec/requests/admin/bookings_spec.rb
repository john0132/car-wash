# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin bookings", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }
  let(:customer) { users(:one) }
  let(:employee) { users(:employee) }

  let(:booking) do
    customer.bookings.create!(status: :pending, payment_status: :unpaid, total_amount: 100, subtotal: 100,
      scheduled_at: 1.day.from_now)
  end

  before { sign_in admin }

  describe "GET /admin/bookings" do
    it "lists bookings with status counts" do
      grant(admin, "bookings.read")
      customer.bookings.create!(status: :completed, total_amount: 50)
      booking

      get admin_bookings_path

      expect_inertia.to render_component("admin/bookings/index")
      expect(inertia.props[:bookings].size).to eq(2)
      expect(inertia.props[:stats]).to include(pending: 1, completed: 1)
    end

    it "filters by search term, booking status and payment status" do
      grant(admin, "bookings.read")
      booking
      customer.bookings.create!(status: :completed, payment_status: :paid, total_amount: 50)

      get admin_bookings_path, params: { booking_status: "completed" }
      expect(inertia.props[:bookings].pluck(:status)).to eq([ "completed" ])

      get admin_bookings_path, params: { payment_status: "paid" }
      expect(inertia.props[:bookings].pluck(:payment_status)).to eq([ "paid" ])

      get admin_bookings_path, params: { q: customer.email }
      expect(inertia.props[:bookings].size).to eq(2)
    end

    it "is forbidden without bookings.read" do
      get admin_bookings_path

      expect(response).to redirect_to(admin_root_path)
      expect(flash[:alert]).to eq("You are not authorized to perform this action")
    end
  end

  describe "GET /admin/bookings/:id" do
    it "shows the booking with customer, address and items" do
      grant(admin, "bookings.read")
      service = create_service("Exterior wash", price: 50)
      booking.booking_items.create!(itemable: service, quantity: 2, price: 50)
      customer.update!(phone: "01001234567")
      booking.update!(car_description: "Toyota Corolla · White · ABC 123")

      get admin_booking_path(booking)

      expect_inertia.to render_component("admin/bookings/show")
      expect(inertia.props[:booking]).to include(
        id: booking.id, car: "Toyota Corolla · White · ABC 123",
        customer: { id: customer.id, full_name: customer.full_name, email: customer.email, phone: "01001234567" }
      )
      expect(inertia.props[:booking][:items].first).to include(name: "Exterior wash", quantity: 2, price: 50.0)
    end
  end

  describe "PATCH /admin/bookings/:id" do
    before { grant(admin, "bookings.update") }

    it "updates status, payment status, employee and schedule" do
      time = 2.days.from_now.change(usec: 0)

      patch admin_booking_path(booking), params: {
        booking: { status: "confirmed", payment_status: "paid", employee_id: employee.id, scheduled_at: time }
      }

      booking.reload
      expect(booking.status).to eq("confirmed")
      expect(booking.payment_status).to eq("paid")
      expect(booking.employee).to eq(employee)
      expect(booking.scheduled_at).to eq(time)
      expect(response).to redirect_to(admin_booking_path(booking))
    end

    it "records the payment in the ledger when the booking is marked paid" do
      grant(admin, "payment_transactions.read")
      transaction = booking.payment_transactions.create!(user: customer, payment_method: create_payment_method("cash"), amount: 100)

      patch admin_booking_path(booking), params: { booking: { payment_status: "paid" } }
      expect(transaction.reload.status).to eq("completed")

      get admin_payment_transactions_path
      expect(inertia.props[:stats]).to include(collected: 100.0, pending_count: 0)
    end

    it "unassigns the employee when employee_id is blank" do
      booking.update!(employee: employee)

      patch admin_booking_path(booking), params: { booking: { status: "confirmed", employee_id: "" } }

      expect(booking.reload.employee).to be_nil
    end

    it "ignores attributes the customer entered" do
      patch admin_booking_path(booking), params: {
        booking: { status: "confirmed", total_amount: 999, subtotal: 999, user_id: employee.id }
      }

      booking.reload
      expect(booking.total_amount).to eq(100)
      expect(booking.subtotal).to eq(100)
      expect(booking.user).to eq(customer)
    end
  end

  it "is forbidden to update without bookings.update" do
    patch admin_booking_path(booking), params: { booking: { status: "confirmed" } }

    expect(response).to redirect_to(admin_root_path)
    expect(booking.reload.status).to eq("pending")
  end

  it "has no routes to create or delete a booking" do
    post admin_bookings_path, params: { booking: { status: "pending" } }
    expect(response).to have_http_status(:not_found)

    delete admin_booking_path(booking)
    expect(response).to have_http_status(:not_found)
  end
end
