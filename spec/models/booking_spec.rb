# frozen_string_literal: true

require "rails_helper"

RSpec.describe Booking, type: :model do
  let(:user) { User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password") }
  let(:service_category) { create_service_category }
  let(:service) { create_service(service_category: service_category) }
  let(:extra) { create_extra }

  it "is valid with a user" do
    expect(Booking.new(user: user)).to be_valid
  end

  it "requires a user" do
    expect(Booking.new).not_to be_valid
  end

  it "rejects a negative subtotal" do
    expect(Booking.new(user: user, subtotal: -1)).not_to be_valid
  end

  it "defaults status to pending" do
    expect(Booking.create!(user: user).status).to eq("pending")
  end

  it "defaults payment_status to unpaid" do
    expect(Booking.create!(user: user).payment_status).to eq("unpaid")
  end

  it "accepts an employee as the assignee" do
    employee = User.create!(name: "Amy", email: "amy@example.com", password: "a-very-long-password", role: "employee")
    expect(Booking.new(user: user, employee: employee)).to be_valid
  end

  it "rejects a non-employee as the assignee" do
    expect(Booking.new(user: user, employee: user)).not_to be_valid
  end

  describe "scopes" do
    it ".open is everything not yet completed or cancelled" do
      open = %i[pending confirmed in_progress].map { Booking.create!(user: user, status: _1) }
      %i[completed cancelled].each { Booking.create!(user: user, status: _1) }

      expect(Booking.open).to match_array(open)
    end

    it ".upcoming is scheduled from now on" do
      future = Booking.create!(user: user, scheduled_at: 1.hour.from_now)
      Booking.create!(user: user, scheduled_at: 1.hour.ago)
      Booking.create!(user: user)

      expect(Booking.upcoming).to eq([ future ])
    end

    it ".newest_first sorts by schedule, unscheduled last" do
      older = Booking.create!(user: user, scheduled_at: 2.days.ago)
      unscheduled = Booking.create!(user: user)
      newer = Booking.create!(user: user, scheduled_at: 1.day.ago)

      expect(Booking.newest_first).to eq([ newer, older, unscheduled ])
    end
  end

  describe ".count_by_status" do
    it "counts every status, including empty ones" do
      Booking.create!(user: user, status: :completed)
      Booking.create!(user: user, status: :completed)
      Booking.create!(user: user, status: :pending)

      expect(Booking.count_by_status).to eq(
        "pending" => 1, "confirmed" => 0, "in_progress" => 0, "completed" => 2, "cancelled" => 0
      )
    end
  end

  describe "#extras" do
    it "returns extras attached to the booking via booking_items" do
      booking = Booking.create!(user: user)
      booking.booking_items.create!(itemable: service, quantity: 1, price: service.price)
      booking.booking_items.create!(itemable: extra, quantity: 1, price: extra.price)

      expect(booking.extras).to contain_exactly(extra)
    end
  end

  describe "payment status and the payments ledger" do
    let(:cash) { create_payment_method("cash") }
    let(:booking) { Booking.create!(user: user, total_amount: 130) }
    let!(:transaction) { booking.payment_transactions.create!(user: user, payment_method: cash, amount: 130) }

    it "completes the pending transaction when the booking is marked paid" do
      booking.update!(payment_status: :paid)
      expect(transaction.reload.status).to eq("completed")
    end

    it "follows a refund, and a return to unpaid" do
      booking.update!(payment_status: :paid)
      booking.update!(payment_status: :refunded)
      expect(transaction.reload.status).to eq("refunded")

      booking.update!(payment_status: :unpaid)
      expect(transaction.reload.status).to eq("pending")
    end

    it "leaves the ledger alone for a partial refund, which it can't represent" do
      booking.update!(payment_status: :paid)
      booking.update!(payment_status: :partially_refunded)
      expect(transaction.reload.status).to eq("completed")
    end

    it "leaves the ledger alone when something else about the booking changes" do
      booking.update!(status: :confirmed)
      expect(transaction.reload.status).to eq("pending")
    end
  end
end
