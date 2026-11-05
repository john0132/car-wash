# frozen_string_literal: true

class CityTranslation < ApplicationRecord
  belongs_to :city
  belongs_to :language

  validates :name, presence: true
  validates :language_id, uniqueness: { scope: :city_id }
end
