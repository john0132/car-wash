# frozen_string_literal: true

class PaymentTransaction < ApplicationRecord
  belongs_to :user
  belongs_to :payment_method
  belongs_to :booking, optional: true

  enum :status, { pending: 0, completed: 1, failed: 2, refunded: 3 }

  validates :amount, presence: true, numericality: { greater_than: 0 }

  # Matches the reference or the paying customer's name/email.
  scope :search, ->(query) {
    next all if query.blank?

    term = "%#{sanitize_sql_like(query.strip)}%"
    joins(:user).where(
      "payment_transactions.reference ILIKE :term OR users.name ILIKE :term OR " \
      "users.last_name ILIKE :term OR users.email ILIKE :term", term: term
    )
  }

  scope :with_status, ->(status) { statuses.key?(status.to_s) ? where(status: status) : all }

  # Matches the reference or the paying customer's name/email.
  scope :search, ->(query) {
    next all if query.blank?

    term = "%#{sanitize_sql_like(query.strip)}%"
    joins(:user).where(
      "payment_transactions.reference ILIKE :term OR users.name ILIKE :term OR " \
      "users.last_name ILIKE :term OR users.email ILIKE :term", term: term
    )
  }

  scope :with_status, ->(status) { statuses.key?(status.to_s) ? where(status: status) : all }
end
