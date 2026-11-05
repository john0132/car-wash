# frozen_string_literal: true

class Service < ApplicationRecord
  include Activatable
  include PolymorphicTypeCode
  include Translatable

  belongs_to :service_category
  has_many :service_translations, dependent: :destroy, autosave: true
  has_many :booking_items, as: :itemable, dependent: :restrict_with_error
  has_many_attached :images

  requires_default_translation

  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :sale_price, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validate :sale_price_below_price

  private

  def sale_price_below_price
    return if sale_price.blank? || price.blank?

    errors.add(:sale_price, "must be less than price") if sale_price >= price
  end
end
