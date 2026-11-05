# frozen_string_literal: true

class BookingItem < ApplicationRecord
  belongs_to :booking
  belongs_to :itemable, polymorphic: true

  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }

  def self.polymorphic_class_for(name)
    Media.polymorphic_class_for(name)
  end
end
