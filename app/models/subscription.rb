# frozen_string_literal: true

class Subscription < ApplicationRecord
  has_many :users, dependent: :nullify

  enum :discount_type, { percentage: 0, fixed_amount: 1 }

  validates :name, presence: true
  validates :discount_type, presence: true
  validates :discount_value, :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
end
