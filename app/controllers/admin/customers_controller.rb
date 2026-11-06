# frozen_string_literal: true

# Customers sign themselves up and own bookings, so the dashboard can view them
# and enable/disable them, but never create or delete them.
class Admin::CustomersController < Admin::BaseController
  include Admin::UserManagement

  RECENT_TRANSACTIONS = 10

  def index
    authorize_kind :customer, :index?

    customers, pagination = paginate(filtered_users(:customer).order(created_at: :desc))
    customers = customers.with_customer_totals.includes(membership: :membership_translations)

    render inertia: {
      customers: customers.map { |customer| customer_row_props(customer) },
      filters: list_filters,
      pagination: pagination
    }
  end

  def show
    customer = User.customer
      .includes(:package, membership: :membership_translations,
        addresses: { area: [ :area_translations, { city: :city_translations } ] })
      .find(params[:id])
    authorize customer

    stats = CustomerStats.new(customer)
    bookings, pagination = paginate(bookings_for_table(customer.bookings), total: stats.bookings_count)
    transactions = customer.payment_transactions
      .includes(payment_method: :payment_method_translations)
      .order(created_at: :desc).limit(RECENT_TRANSACTIONS)

    render inertia: {
      customer: customer_props(customer),
      stats: stats.to_h,
      addresses: customer.addresses.map { |address| address_props(address) },
      cars: customer.cars.order(:created_at, :id).map { |car| car_props(car) },
      bookings: bookings.map { |booking| booking_props(booking) },
      bookings_pagination: pagination,
      transactions: transactions.map { |transaction| transaction_props(transaction) }
    }
  end

  def activation
    customer = User.customer.find(params[:id])
    authorize customer, :update?

    update_activation(customer, fallback: admin_customer_path(customer))
  end

  private

  # `customer` comes from User.with_customer_totals.
  def customer_row_props(customer)
    user_props(customer).merge(
      wallet: customer.wallet,
      points: customer.points,
      lifetime_value: customer.lifetime_value.to_f,
      bookings_count: customer.bookings_count,
      membership: membership_props(customer.membership)
    )
  end

  def customer_props(customer)
    user_props(customer).merge(
      wallet: customer.wallet,
      points: customer.points,
      lifetime_points: customer.lifetime_points,
      membership: membership_props(customer.membership),
      package: customer.package&.then { |p| { id: p.id, name: p.name, price: p.price.to_f } }
    )
  end

  def membership_props(membership)
    return unless membership

    {
      id: membership.id,
      name: membership.translation&.name,
      background_color: membership.background_color,
      text_color: membership.text_color,
      egp_to_points: membership.egp_to_points.to_f,
      points_to_egp: membership.points_to_egp.to_f
    }
  end

  def address_props(address)
    {
      id: address.id,
      name: address.name,
      area: address.area.translation&.name,
      city: address.area.city.translation&.name,
      latitude: address.location.y,
      longitude: address.location.x
    }
  end

  def car_props(car)
    { id: car.id, make: car.make, model: car.model, license_plate: car.license_plate, color: car.color }
  end

  def transaction_props(transaction)
    {
      id: transaction.id,
      amount: transaction.amount.to_f,
      status: transaction.status,
      reference: transaction.reference,
      payment_method: transaction.payment_method.translation&.name || transaction.payment_method.code,
      booking_id: transaction.booking_id,
      created_at: transaction.created_at
    }
  end
end
