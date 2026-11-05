# frozen_string_literal: true

class Package < ApplicationRecord
  include PolymorphicTypeCode

  has_many :users, dependent: :nullify
  has_many :bookings, dependent: :nullify
  has_many :booking_items, as: :itemable, dependent: :restrict_with_error
  has_many_attached :images

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
end
