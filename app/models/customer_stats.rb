# frozen_string_literal: true

# A customer's booking figures for the admin dashboard. Two queries in total:
# the status breakdown and one aggregate, both run lazily and memoized.
#
#   stats = CustomerStats.new(customer)
#   stats.lifetime_value # => 855.0
class CustomerStats
  def initialize(customer)
    @bookings = customer.bookings
  end

  def by_status
    @by_status ||= @bookings.count_by_status
  end

  def bookings_count(status = nil)
    status ? by_status.fetch(status) : by_status.values.sum
  end

  def lifetime_value
    totals[:lifetime_value]
  end

  def average_order_value
    paid_count = totals[:paid_count]
    paid_count.zero? ? 0 : (lifetime_value / paid_count).round(2)
  end

  def last_booking_at
    totals[:last_booking_at]
  end

  def to_h
    {
      lifetime_value: lifetime_value,
      average_order_value: average_order_value,
      bookings_count: bookings_count,
      by_status: by_status,
      last_booking_at: last_booking_at
    }
  end

  private

  def totals
    @totals ||= begin
      lifetime_value, paid_count, last_booking_at = @bookings.pick(
        Arel.sql(Booking.lifetime_value_sql), Arel.sql(Booking.paid_count_sql), Arel.sql("MAX(bookings.scheduled_at)")
      )
      { lifetime_value: lifetime_value.to_f, paid_count: paid_count, last_booking_at: last_booking_at }
    end
  end
end
