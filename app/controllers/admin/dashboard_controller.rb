# frozen_string_literal: true

# The admin area's landing page. Admins see company-wide reports
# (DashboardStats); employees have no dashboard permissions, so they see only
# their own assignments for today (EmployeeStats, same as Admin::EmployeesController#show).
class Admin::DashboardController < Admin::BaseController
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

  # Same shape as Admin::UserManagement#booking_props / Admin::BookingsController#booking_props.
  def booking_props(booking)
    {
      id: booking.id,
      status: booking.status,
      payment_status: booking.payment_status,
      total_amount: booking.total_amount.to_f,
      items_count: booking.booking_items.sum(&:quantity),
      scheduled_at: booking.scheduled_at,
      created_at: booking.created_at,
      address: booking.booking_address&.then { |a| "#{a.name}, #{a.area_name}" },
      customer: booking.user && { id: booking.user.id, full_name: booking.user.full_name },
      employee: booking.employee && { id: booking.employee.id, full_name: booking.employee.full_name }
    }
  end
end
