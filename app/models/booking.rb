# frozen_string_literal: true

class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :package, optional: true
  has_one :booking_address, dependent: :destroy
  has_many :booking_items, dependent: :destroy
  has_many :payment_transactions, dependent: :restrict_with_error

  enum :status, { pending: 0, confirmed: 1, in_progress: 2, completed: 3, cancelled: 4 }
  enum :payment_status, { unpaid: 0, paid: 1, partially_refunded: 2, refunded: 3, failed: 4 }

  validates :subtotal, :extras_total, :discounts, :total_amount,
    numericality: { greater_than_or_equal_to: 0 }

  def extras
    Extra.joins(:booking_items).where(booking_items: { booking_id: id })
  end
end
