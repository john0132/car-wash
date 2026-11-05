# frozen_string_literal: true

# Field staff who carry out bookings (Booking#employee).
class Admin::EmployeesController < Admin::StaffController
  def index
    authorize_kind :employee, :index?

    employees, pagination = paginate(filtered_users(:employee).order(:name))
    employees = employees.with_assignment_counts

    render inertia: {
      employees: employees.map { |employee|
        user_props(employee).merge(
          assigned_count: employee.assigned_count,
          completed_count: employee.completed_count,
          open_count: employee.open_count
        )
      },
      filters: list_filters,
      pagination: pagination
    }
  end

  def show
    authorize @user

    stats = EmployeeStats.new(@user)
    status_filter = params[:booking_status].presence_in(Booking.statuses.keys)
    assigned = status_filter ? @user.assigned_bookings.where(status: status_filter) : @user.assigned_bookings
    bookings, pagination = paginate(bookings_for_table(assigned), total: stats.bookings_count(status_filter))

    render inertia: {
      employee: user_props(@user).merge(last_seen_at: @user.last_seen_at),
      stats: stats.to_h,
      bookings: bookings.map { |booking| booking_props(booking) },
      bookings_pagination: pagination,
      booking_status: status_filter
    }
  end

  private

  def staff_kind = :employee
  def collection_path = admin_employees_path
  def member_path(user) = admin_employee_path(user)
  def new_member_path = new_admin_employee_path
  def edit_member_path(user) = edit_admin_employee_path(user)
end
