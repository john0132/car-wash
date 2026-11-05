# frozen_string_literal: true

class City < ApplicationRecord
  has_many :city_translations, dependent: :destroy
  has_many :areas, dependent: :destroy
end
