# frozen_string_literal: true

class Service < ApplicationRecord
  include Activatable
  include PolymorphicTypeCode
  include Sluggable
  include Translatable

  belongs_to :service_category
  has_many :header_items, dependent: :destroy
  has_many :footer_items, dependent: :destroy
  has_many :service_translations, dependent: :destroy, autosave: true
  has_many :booking_items, as: :itemable, dependent: :restrict_with_error
  has_one_attached :image

  requires_default_translation

  sluggable fallback: "service"

  # Shown in the homepage's Services section: flagged, active, and in an active category.
  scope :on_home_page, -> {
    where(display_in_home_page: true, is_active: true)
      .where(service_category_id: ServiceCategory.where(is_active: true).select(:id))
  }

  # What the customer pays: the sale price when there is one, else the price.
  EFFECTIVE_PRICE = Arel.sql("COALESCE(services.sale_price, services.price)")

  scope :publicly_listed, -> { where(is_active: true) }
  scope :on_sale, -> { where.not(sale_price: nil) }
  scope :priced_at_least, ->(amount) { amount ? where("COALESCE(services.sale_price, services.price) >= ?", amount) : all }
  scope :priced_at_most, ->(amount) { amount ? where("COALESCE(services.sale_price, services.price) <= ?", amount) : all }
  scope :lasting_at_most, ->(minutes) { minutes ? where(duration_minutes: ..minutes) : all }
  scope :cheapest_first, -> { order(EFFECTIVE_PRICE, :id) }
  scope :priciest_first, -> { order(Arel.sql("COALESCE(services.sale_price, services.price) DESC"), :id) }

  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :sale_price, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :duration_minutes, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 1440 }, allow_nil: true
  validate :sale_price_below_price

  private

  def sale_price_below_price
    return if sale_price.blank? || price.blank?

    errors.add(:sale_price, "must be less than price") if sale_price >= price
  end
end
