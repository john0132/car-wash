# frozen_string_literal: true

# Company-wide figures for the admin dashboard home page. Each figure is
# computed lazily and memoized, so a request only pays for what it renders.
#
# `status_breakdown`, `payment_status_breakdown` and `top_items` look at the
# last WINDOW_DAYS; `revenue_trend` buckets the last TREND_DAYS by day.
#
#   stats = DashboardStats.new
#   stats.kpis # => { revenue_this_month: 4820.0, bookings_today: 3, … }
class DashboardStats
  WINDOW_DAYS = 30
  TREND_DAYS = 14
  TOP_ITEMS_LIMIT = 5

  def kpis
    @kpis ||= {
      revenue_this_month: Booking.paid.where(created_at: Time.current.beginning_of_month..).sum(:total_amount).to_f,
      bookings_today: Booking.where(scheduled_at: Date.current.all_day).count,
      open_bookings: Booking.open.count,
      new_customers_this_month: User.customer.where(created_at: Time.current.beginning_of_month..).count
    }
  end

  def status_breakdown
    @status_breakdown ||= recent_bookings.count_by_status
  end

  def payment_status_breakdown
    @payment_status_breakdown ||= begin
      counts = recent_bookings.group(:payment_status).count
      Booking.payment_statuses.keys.index_with { |status| counts.fetch(status, 0) }
    end
  end

  # [{ date: "2026-10-23", amount: 0.0 }, …], oldest first, one entry per day
  # even when nothing was paid that day.
  def revenue_trend
    @revenue_trend ||= begin
      totals = Booking.paid.where(created_at: (TREND_DAYS - 1).days.ago.beginning_of_day..)
        .group(Arel.sql("DATE(bookings.created_at)")).sum(:total_amount)

      (TREND_DAYS - 1).downto(0).map do |days_ago|
        date = days_ago.days.ago.to_date
        { date: date.iso8601, amount: totals.fetch(date, 0).to_f }
      end
    end
  end

  # Packages/services/extras ranked by revenue over the window, highest first.
  def top_items
    @top_items ||= BookingItem.joins(:booking).merge(recent_bookings)
      .group(:itemable_type, :itemable_id)
      .order(Arel.sql("SUM(booking_items.price * booking_items.quantity) DESC"))
      .limit(TOP_ITEMS_LIMIT)
      .pluck(
        :itemable_type, :itemable_id,
        Arel.sql("SUM(booking_items.price * booking_items.quantity)"),
        Arel.sql("SUM(booking_items.quantity)")
      )
      .map { |type, id, revenue, quantity| item_row(type, id, revenue, quantity) }
  end

  def upcoming_bookings
    @upcoming_bookings ||= Booking.open.upcoming
      .includes(:booking_address, :booking_items, :user, :employee)
      .reorder(scheduled_at: :asc).limit(8)
  end

  private

  def recent_bookings
    @recent_bookings ||= Booking.where(created_at: WINDOW_DAYS.days.ago.beginning_of_day..)
  end

  def item_row(type, id, revenue, quantity)
    record = PolymorphicTypeCode.class_for(type)&.find_by(id: id)
    name = record && (record.respond_to?(:translation) ? record.translation&.name : record.name)

    { name: name || type, type: type, revenue: revenue.to_f, quantity: quantity }
  end
end
