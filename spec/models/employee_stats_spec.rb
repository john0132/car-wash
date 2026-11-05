# frozen_string_literal: true

require "rails_helper"

RSpec.describe EmployeeStats do
  let(:customer) { User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password") }
  let(:employee) { User.create!(name: "Amy", email: "amy@example.com", password: "a-very-long-password", role: "employee") }
  let(:stats) { described_class.new(employee) }

  def assign(status, total: 100, scheduled_at: nil)
    customer.bookings.create!(employee: employee, status: status, total_amount: total, scheduled_at: scheduled_at)
  end

  it "has no completion rate until a booking has finished" do
    assign(:pending)

    expect(stats.completion_rate).to be_nil
    expect(stats.to_h).to include(assigned_count: 1, completed_count: 0, open_count: 1, completed_revenue: 0.0)
  end

  context "with finished and open bookings" do
    let(:soon) { 2.hours.from_now.change(usec: 0) }

    before do
      assign(:completed, total: 150)
      assign(:completed, total: 50)
      assign(:cancelled)
      assign(:confirmed, scheduled_at: 3.days.from_now)
      assign(:pending, scheduled_at: soon)
      assign(:pending, scheduled_at: 1.day.ago) # overdue: not "next"
    end

    it "summarises the assigned bookings" do
      expect(stats.to_h).to include(
        assigned_count: 6, completed_count: 2, open_count: 3, completion_rate: 67, completed_revenue: 200.0
      )
      expect(stats.bookings_count("pending")).to eq(2)
    end

    it "picks the next upcoming open booking" do
      expect(stats.next_booking_at).to eq(soon)
    end
  end

  it "ignores bookings assigned to someone else" do
    other = User.create!(name: "Bob", email: "bob@example.com", password: "a-very-long-password", role: "employee")
    customer.bookings.create!(employee: other, status: :completed)

    expect(stats.bookings_count).to eq(0)
  end
end
