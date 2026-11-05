# frozen_string_literal: true

class Language < ApplicationRecord
  has_many :membership_translations, dependent: :destroy
  has_many :payment_method_translations, dependent: :destroy
  has_many :city_translations, dependent: :destroy
  has_many :area_translations, dependent: :destroy
  has_many :page_translations, dependent: :destroy
  has_many :blog_translations, dependent: :destroy
  has_many :extra_translations, dependent: :destroy

  validates :code, presence: true, uniqueness: true
  validates :name, presence: true

  # { "en" => 1, "ar" => 2 }, loaded once per request (or job) via Current.
  def self.ids_by_code
    Current.language_ids_by_code ||= pluck(:code, :id).to_h
  end
end
