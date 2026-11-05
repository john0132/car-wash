# frozen_string_literal: true

# An employee's assigned-booking figures for the admin dashboard. Each figure is
# computed lazily and memoized; `to_h` costs three queries.
#
#   stats = EmployeeStats.new(employee)
#   stats.completion_rate # => 69
class EmployeeStats
  def initialize(employee)
    @bookings = employee.assigned_bookings
  end

  def by_status
    @by_status ||= @bookings.count_by_status
  end

  def bookings_count(status = nil)
    status ? by_status.fetch(status) : by_status.values.sum
  end

  def completed_count
    by_status["completed"]
  end

  def open_count
    by_status.values_at(*Booking::OPEN_STATUSES).sum
  end

  # Completed ÷ (completed + cancelled), as a whole percentage; nil until something has finished.
  def completion_rate
    finished = completed_count + by_status["cancelled"]
    finished.zero? ? nil : (completed_count * 100.0 / finished).round
  end

  def completed_revenue
    @completed_revenue ||= @bookings.completed.sum(:total_amount).to_f
  end

  def next_booking_at
    return @next_booking_at if defined?(@next_booking_at)

    @next_booking_at = @bookings.open.upcoming.minimum(:scheduled_at)
  end

  def to_h
    {
      assigned_count: bookings_count,
      completed_count: completed_count,
      open_count: open_count,
      completion_rate: completion_rate,
      completed_revenue: completed_revenue,
      next_booking_at: next_booking_at,
      by_status: by_status
    }
  end
end
