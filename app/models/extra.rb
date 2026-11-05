# frozen_string_literal: true

class Extra < ApplicationRecord
  include Attachable

  has_many :extra_translations, dependent: :destroy
  has_many :booking_items, as: :itemable, dependent: :restrict_with_error

  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }

  def bookings
    Booking.where(id: booking_items.select(:booking_id))
  end
end
