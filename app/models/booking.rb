# frozen_string_literal: true

class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :employee, class_name: "User", optional: true, inverse_of: :assigned_bookings
  belongs_to :package, optional: true
  has_one :booking_address, dependent: :destroy
  has_many :booking_items, dependent: :destroy
  has_many :payment_transactions, dependent: :restrict_with_error

  enum :status, { pending: 0, confirmed: 1, in_progress: 2, completed: 3, cancelled: 4 }
  enum :payment_status, { unpaid: 0, paid: 1, partially_refunded: 2, refunded: 3, failed: 4 }

  # Still to be carried out: not yet completed or cancelled.
  OPEN_STATUSES = %w[pending confirmed in_progress].freeze

  scope :open, -> { where(status: OPEN_STATUSES) }
  scope :upcoming, -> { where(scheduled_at: Time.current..) }
  scope :newest_first, -> { order(Arel.sql("bookings.scheduled_at DESC NULLS LAST, bookings.id DESC")) }

  scope :with_status, ->(status) { statuses.key?(status.to_s) ? where(status: status) : all }
  scope :with_payment_status, ->(status) { payment_statuses.key?(status.to_s) ? where(payment_status: status) : all }

  # Matches the booking id or the customer's name/email.
  scope :search, ->(query) {
    next all if query.blank?

    term = "%#{sanitize_sql_like(query.strip)}%"
    joins(:user).where(
      "CAST(bookings.id AS TEXT) ILIKE :term OR users.name ILIKE :term OR " \
      "users.last_name ILIKE :term OR users.email ILIKE :term", term: term
    )
  }

  validates :subtotal, :extras_total, :discounts, :total_amount,
    numericality: { greater_than_or_equal_to: 0 }

  validate :employee_is_employee

  # Lifetime value is the total of fully paid bookings. These SQL aggregates are
  # its only definition: CustomerStats and User.with_customer_totals both use them.
  def self.lifetime_value_sql
    "COALESCE(SUM(bookings.total_amount) #{paid_filter_sql}, 0)"
  end

  def self.paid_count_sql
    "COUNT(*) #{paid_filter_sql}"
  end

  def self.paid_filter_sql
    "FILTER (WHERE bookings.payment_status = #{payment_statuses.fetch(:paid)})"
  end
  private_class_method :paid_filter_sql

  # { "pending" => 2, "confirmed" => 0, … } with every status present. One GROUP BY query.
  def self.count_by_status
    counts = group(:status).count
    statuses.keys.index_with { |status| counts.fetch(status, 0) }
  end

  def extras
    Extra.joins(:booking_items).where(booking_items: { booking_id: id })
  end

  private

  def employee_is_employee
    return if employee.nil? || employee.employee?

    errors.add(:employee, "must be an employee")
  end
end
