# frozen_string_literal: true

class ServiceCategory < ApplicationRecord
  include Activatable
  include Translatable

  # A category can only be deleted once its services are gone (services can be on bookings).
  has_many :services, dependent: :restrict_with_error
  has_many :service_category_translations, dependent: :destroy, autosave: true
  has_one_attached :image

  requires_default_translation

  # Shown in the homepage's Service Categories section: flagged and active.
  scope :on_home_page, -> { where(display_in_home_page: true, is_active: true) }
end
