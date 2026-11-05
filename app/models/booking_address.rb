# frozen_string_literal: true

class BookingAddress < ApplicationRecord
  belongs_to :booking
  belongs_to :address, optional: true

  validates :name, :area_name, :city_name, :location, presence: true
end
