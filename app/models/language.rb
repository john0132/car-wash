# frozen_string_literal: true

class Language < ApplicationRecord
  has_many :membership_translations, dependent: :destroy
  has_many :payment_method_translations, dependent: :destroy
  has_many :city_translations, dependent: :destroy
  has_many :area_translations, dependent: :destroy
  has_many :page_translations, dependent: :destroy
  has_many :blog_translations, dependent: :destroy
  has_many :extra_translations, dependent: :destroy
  has_many :service_category_translations, dependent: :destroy
  has_many :service_translations, dependent: :destroy
  has_many :component_translations, dependent: :destroy
  has_many :page_section_translations, dependent: :destroy

  # Languages added or removed mid-request (seeds, specs) must show up in ids_by_code.
  after_save { Current.language_ids_by_code = nil }
  after_destroy { Current.language_ids_by_code = nil }

  validates :code, presence: true, uniqueness: true
  validates :name, presence: true

  # { "en" => 1, "ar" => 2 }, loaded once per request (or job) via Current.
  def self.ids_by_code
    Current.language_ids_by_code ||= pluck(:code, :id).to_h
  end
end
