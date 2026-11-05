# frozen_string_literal: true

class City < ApplicationRecord
  include Activatable
  include Translatable

  has_many :city_translations, dependent: :destroy, autosave: true
  # A city can only be deleted once its areas are gone, since areas hold customer addresses.
  has_many :areas, dependent: :restrict_with_error

  requires_default_translation
end
