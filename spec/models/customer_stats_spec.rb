# frozen_string_literal: true

require "rails_helper"

RSpec.describe CustomerStats do
  let(:customer) { User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password") }
  let(:stats) { described_class.new(customer) }

  it "has zeroed figures without bookings" do
    expect(stats.to_h).to include(
      lifetime_value: 0.0, average_order_value: 0, bookings_count: 0, last_booking_at: nil
    )
  end

  context "with bookings" do
    let(:latest) { 3.days.from_now.change(usec: 0) }

    before do
      customer.bookings.create!(total_amount: 100, payment_status: :paid, status: :completed, scheduled_at: 2.days.ago)
      customer.bookings.create!(total_amount: 50, payment_status: :paid, status: :completed, scheduled_at: 1.day.ago)
      customer.bookings.create!(total_amount: 70, payment_status: :unpaid, status: :pending, scheduled_at: latest)
      customer.bookings.create!(total_amount: 40, payment_status: :refunded, status: :cancelled)
    end

    it "counts only fully paid bookings toward lifetime value and average order" do
      expect(stats.lifetime_value).to eq(150.0)
      expect(stats.average_order_value).to eq(75.0)
    end

    it "counts bookings overall and by status" do
      expect(stats.bookings_count).to eq(4)
      expect(stats.bookings_count("completed")).to eq(2)
      expect(stats.by_status).to include("completed" => 2, "pending" => 1, "cancelled" => 1, "confirmed" => 0)
    end

    it "reports the latest scheduled booking" do
      expect(stats.last_booking_at).to eq(latest)
    end

    it "agrees with User.with_customer_totals" do
      expect(User.with_customer_totals.find(customer.id).lifetime_value).to eq(stats.lifetime_value)
    end

    it "runs two queries for everything" do
      queries = 0
      counter = ->(*, payload) { queries += 1 unless payload[:name].in?(%w[SCHEMA TRANSACTION]) }
      ActiveSupport::Notifications.subscribed(counter, "sql.active_record") { stats.to_h }

      expect(queries).to eq(2)
    end
  end
end
