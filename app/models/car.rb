# frozen_string_literal: true

class Car < ApplicationRecord
  belongs_to :user

  validates :make, :model, :license_plate, :color, presence: true

  normalizes :make, :model, :color, with: -> { _1.squish }
  normalizes :license_plate, with: -> { _1.squish.upcase }

  scope :search, ->(query) {
    next all if query.blank?

    term = "%#{sanitize_sql_like(query.strip)}%"
    joins(:user).where(
      "cars.make ILIKE :term OR cars.model ILIKE :term OR cars.license_plate ILIKE :term OR " \
      "users.name ILIKE :term OR users.last_name ILIKE :term OR users.email ILIKE :term", term: term
    )
  }
end
