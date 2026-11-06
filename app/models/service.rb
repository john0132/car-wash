# frozen_string_literal: true

class Service < ApplicationRecord
  include Activatable
  include PolymorphicTypeCode
  include Translatable

  belongs_to :service_category
  has_many :service_translations, dependent: :destroy, autosave: true
  has_many :booking_items, as: :itemable, dependent: :restrict_with_error
  has_one_attached :image

  requires_default_translation

  before_validation :generate_slug, if: -> { slug.blank? }
  before_validation { self.slug = slug.to_s.strip.downcase.presence }

  # Shown in the homepage's Services section: flagged, active, and in an active category.
  scope :on_home_page, -> {
    where(display_in_home_page: true, is_active: true)
      .where(service_category_id: ServiceCategory.where(is_active: true).select(:id))
  }

  validates :slug, presence: true, uniqueness: true, format: { with: Page::SLUG_REGEXP }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :sale_price, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :duration_minutes, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 1440 }, allow_nil: true
  validate :sale_price_below_price

  private

  # "exterior-wash" from the default-language name; numbered when already taken.
  def generate_slug
    name = translated(:name, I18n.default_locale).to_s
    base = name.parameterize.presence || "service"
    candidate = base
    candidate = "#{base}-#{SecureRandom.hex(2)}" while Service.where.not(id: id).exists?(slug: candidate)
    self.slug = candidate
  end

  def sale_price_below_price
    return if sale_price.blank? || price.blank?

    errors.add(:sale_price, "must be less than price") if sale_price >= price
  end
end
