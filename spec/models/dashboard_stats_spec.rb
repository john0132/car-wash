# frozen_string_literal: true

require "rails_helper"

RSpec.describe DashboardStats do
  let(:customer) { User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password") }
  let(:stats) { described_class.new }

  describe "#kpis" do
    # Baselines (not raw 0) throughout: other specs' fixtures can leave users
    # in the test database for the life of the run, so these assert the delta
    # a new record makes rather than an absolute count.

    it "sums only paid bookings created this month for revenue" do
      baseline = described_class.new.kpis[:revenue_this_month]
      customer.bookings.create!(total_amount: 100, payment_status: :paid)
      customer.bookings.create!(total_amount: 40, payment_status: :unpaid)
      customer.bookings.create!(total_amount: 30, payment_status: :paid, created_at: 2.months.ago)

      expect(stats.kpis[:revenue_this_month]).to eq(baseline + 100.0)
    end

    it "counts bookings scheduled today" do
      baseline = described_class.new.kpis[:bookings_today]
      customer.bookings.create!(scheduled_at: Time.current)
      customer.bookings.create!(scheduled_at: 1.day.from_now)

      expect(stats.kpis[:bookings_today]).to eq(baseline + 1)
    end

    it "counts open bookings regardless of when they were created" do
      baseline = described_class.new.kpis[:open_bookings]
      customer.bookings.create!(status: :pending, created_at: 2.months.ago)
      customer.bookings.create!(status: :completed)

      expect(stats.kpis[:open_bookings]).to eq(baseline + 1)
    end

    it "counts customers created this month" do
      baseline = described_class.new.kpis[:new_customers_this_month]
      customer
      User.create!(name: "Old", email: "old@example.com", password: "a-very-long-password", created_at: 2.months.ago)

      expect(stats.kpis[:new_customers_this_month]).to eq(baseline + 1)
    end
  end

  describe "#status_breakdown" do
    it "counts every status for bookings from the last 30 days" do
      customer.bookings.create!(status: :completed)
      customer.bookings.create!(status: :completed, created_at: 40.days.ago)
      customer.bookings.create!(status: :pending)

      expect(stats.status_breakdown).to eq(
        "pending" => 1, "confirmed" => 0, "in_progress" => 0, "completed" => 1, "cancelled" => 0
      )
    end
  end

  describe "#payment_status_breakdown" do
    it "counts every payment status for bookings from the last 30 days" do
      customer.bookings.create!(payment_status: :paid)
      customer.bookings.create!(payment_status: :unpaid, created_at: 40.days.ago)

      expect(stats.payment_status_breakdown).to eq(
        "unpaid" => 0, "paid" => 1, "partially_refunded" => 0, "refunded" => 0, "failed" => 0
      )
    end
  end

  describe "#revenue_trend" do
    it "buckets paid revenue by day over the last 14 days, oldest first" do
      customer.bookings.create!(total_amount: 50, payment_status: :paid)
      customer.bookings.create!(total_amount: 20, payment_status: :unpaid)

      trend = stats.revenue_trend

      expect(trend.length).to eq(14)
      expect(trend.last).to eq(date: Date.current.iso8601, amount: 50.0)
      expect(trend.first[:amount]).to eq(0.0)
    end
  end

  describe "#top_items" do
    it "ranks services and extras by revenue over the last 30 days" do
      service = create_service("Exterior Wash", price: 100)
      extra = create_extra("Air Freshener", price: 20)
      booking = customer.bookings.create!
      booking.booking_items.create!(itemable: service, quantity: 2, price: 100)
      booking.booking_items.create!(itemable: extra, quantity: 1, price: 20)

      old_booking = customer.bookings.create!(created_at: 40.days.ago)
      old_booking.booking_items.create!(itemable: extra, quantity: 5, price: 20)

      expect(stats.top_items).to eq(
        [
          { name: "Exterior Wash", type: "service", revenue: 200.0, quantity: 2 },
          { name: "Air Freshener", type: "extra", revenue: 20.0, quantity: 1 }
        ]
      )
    end
  end

  describe "#upcoming_bookings" do
    it "returns open, future bookings soonest first" do
      far = customer.bookings.create!(status: :pending, scheduled_at: 2.days.from_now)
      near = customer.bookings.create!(status: :confirmed, scheduled_at: 1.hour.from_now)
      customer.bookings.create!(status: :completed, scheduled_at: 1.hour.from_now)
      customer.bookings.create!(status: :pending, scheduled_at: 1.hour.ago)

      expect(stats.upcoming_bookings).to eq([ near, far ])
    end
  end
end
