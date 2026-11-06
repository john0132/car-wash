# frozen_string_literal: true

class Address < ApplicationRecord
  belongs_to :user
  belongs_to :area

  validates :name, presence: true
  validates :location, presence: true

  def latitude
    location&.y
  end

  def longitude
    location&.x
  end

  # Builds `location` from user-entered coordinates. Anything missing or out of
  # range leaves it blank, so the presence validation reports it.
  def assign_coordinates(latitude, longitude)
    lat = Float(latitude)
    lng = Float(longitude)
    raise ArgumentError unless lat.between?(-90, 90) && lng.between?(-180, 180)

    self.location = Area::GEO_FACTORY.point(lng, lat)
  rescue ArgumentError, TypeError
    self.location = nil
  end
end
