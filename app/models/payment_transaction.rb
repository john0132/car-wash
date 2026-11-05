# frozen_string_literal: true

class PaymentTransaction < ApplicationRecord
  belongs_to :user
  belongs_to :payment_method
  belongs_to :booking, optional: true

  enum :status, { pending: 0, completed: 1, failed: 2, refunded: 3 }

  validates :amount, presence: true, numericality: { greater_than: 0 }
end
