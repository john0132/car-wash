# frozen_string_literal: true

class ServiceCategory < ApplicationRecord
  include Activatable
  include Translatable

  # A category can only be deleted once its services are gone (services can be on bookings).
  has_many :services, dependent: :restrict_with_error
  has_many :service_category_translations, dependent: :destroy, autosave: true
  has_many_attached :images

  requires_default_translation
end
