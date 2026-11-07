# frozen_string_literal: true

# The admin area's landing page. Admins see company-wide reports
# (DashboardStats); employees have no dashboard permissions, so they see only
# their own assignments for today (EmployeeStats, same as Admin::EmployeesController#show).
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

  def admin_dashboard_props
    stats = DashboardStats.new

    {
      view: "admin",
      kpis: stats.kpis,
      status_breakdown: stats.status_breakdown,
      payment_status_breakdown: stats.payment_status_breakdown,
      revenue_trend: stats.revenue_trend,
      top_items: stats.top_items,
      upcoming_bookings: stats.upcoming_bookings.map { |booking| booking_props(booking) }
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
