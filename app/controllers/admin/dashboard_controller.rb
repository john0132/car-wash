# frozen_string_literal: true

# The admin area's landing page. Admins see the company-wide reports
# (DashboardStats) their roles let them read; employees have no dashboard
# permissions, so they see only their own assignments for today (EmployeeStats,
# same as Admin::EmployeesController#show).
class Admin::DashboardController < Admin::BaseController
  include Admin::BookingProps

  def index
    if Current.user.admin?
      render inertia: admin_dashboard_props
    else
      render inertia: employee_dashboard_props
    end
  end

  private

  # Each report is built only for admins allowed to read what it shows (the
  # same policies as the matching list pages); the rest are nil and the page
  # leaves them out. Revenue figures need the payments ledger, booking figures
  # the bookings list, and the new-customer count the customers list.
  def admin_dashboard_props
    stats = DashboardStats.new
    bookings = policy(Booking).index?
    revenue = policy(PaymentTransaction).index?
    customers = UserPolicy.new(Current.user, :customer).index?

    {
      view: "admin",
      kpis: {
        revenue_this_month: (stats.revenue_this_month if revenue),
        bookings_today: (stats.bookings_today if bookings),
        open_bookings: (stats.open_bookings if bookings),
        new_customers_this_month: (stats.new_customers_this_month if customers)
      },
      status_breakdown: (stats.status_breakdown if bookings),
      payment_status_breakdown: (stats.payment_status_breakdown if bookings),
      revenue_trend: (stats.revenue_trend if revenue),
      top_items: (stats.top_items if revenue),
      upcoming_bookings: (stats.upcoming_bookings.map { |booking| booking_props(booking) } if bookings)
    }
  end

  def employee_dashboard_props
    stats = EmployeeStats.new(Current.user)
    today = Current.user.assigned_bookings.where(scheduled_at: Date.current.all_day)
      .includes(:booking_address, :booking_items, :user, :employee)
      .reorder(scheduled_at: :asc)

    {
      view: "employee",
      stats: stats.to_h,
      today_bookings: today.map { |booking| booking_props(booking) }
    }
  end
end
