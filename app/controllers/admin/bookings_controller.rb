# frozen_string_literal: true

# Bookings are placed by customers at checkout; the dashboard never creates or
# deletes them. Editing is limited to status, payment status, employee
# assignment and schedule — never the items/address/amounts the customer entered.
class Admin::BookingsController < Admin::BaseController
  include Admin::Pagination
  include Admin::BookingProps

  after_action :verify_authorized

  before_action :set_booking, only: %i[show edit update]

  def index
    authorize Booking

    scope = Booking.search(params[:q])
      .with_status(params[:booking_status])
      .with_payment_status(params[:payment_status])

    bookings, pagination = paginate(bookings_for_table(scope))

    render inertia: {
      bookings: bookings.map { |booking| booking_props(booking) },
      filters: {
        q: params[:q].presence,
        booking_status: params[:booking_status].presence,
        payment_status: params[:payment_status].presence
      },
      stats: Booking.count_by_status,
      pagination: pagination
    }
  end

  def show
    authorize @booking

    render inertia: { booking: booking_detail_props(@booking) }
  end

  def edit
    authorize @booking

    render inertia: { booking: booking_detail_props(@booking), employee_options: employee_options }
  end

  def update
    authorize @booking

    if @booking.update(booking_params)
      redirect_to admin_booking_path(@booking), notice: "Booking ##{@booking.id} was updated"
    else
      redirect_to edit_admin_booking_path(@booking), inertia: { errors: @booking.errors.to_hash }
    end
  end

  private

  def set_booking
    @booking = Booking.includes(:user, :employee, :package, :booking_address, booking_items: :itemable)
      .find(params[:id])
  end

  # Status, payment status, employee assignment and schedule — never what the
  # customer entered (items, address, amounts).
  def booking_params
    params.expect(booking: %i[status payment_status employee_id scheduled_at])
  end

  def employee_options
    User.employee.order(:name, :last_name).map { |employee| { id: employee.id, full_name: employee.full_name } }
  end

  # Everything booking_props reads, newest first.
  def bookings_for_table(scope)
    scope.includes(:booking_address, :booking_items, :user, :employee).newest_first
  end

  def booking_detail_props(booking)
    {
      id: booking.id,
      status: booking.status,
      payment_status: booking.payment_status,
      subtotal: booking.subtotal.to_f,
      extras_total: booking.extras_total.to_f,
      discounts: booking.discounts.to_f,
      total_amount: booking.total_amount.to_f,
      scheduled_at: booking.scheduled_at,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      customer: { id: booking.user.id, full_name: booking.user.full_name, email: booking.user.email,
                  phone: booking.user.phone },
      car: booking.car_description,
      employee: booking.employee && { id: booking.employee.id, full_name: booking.employee.full_name },
      package: booking.package && { id: booking.package.id, name: booking.package.name, price: booking.package.price.to_f },
      address: booking.booking_address&.then { |a|
        { name: a.name, area_name: a.area_name, city_name: a.city_name }
      },
      items: booking.booking_items.map { |item| booking_item_props(item) }
    }
  end

  def booking_item_props(item)
    itemable = item.itemable
    name = itemable.respond_to?(:translation) ? itemable.translation&.name : itemable&.name

    {
      id: item.id,
      name: name || item.itemable_type,
      type: item.itemable_type,
      quantity: item.quantity,
      price: item.price.to_f
    }
  end
end
