# frozen_string_literal: true

class Page < ApplicationRecord
  SLUG_REGEXP = /\A[a-z0-9]+(?:-[a-z0-9]+)*\z/

  has_many :page_translations, dependent: :destroy

  validates :slug, presence: true, uniqueness: true, format: { with: SLUG_REGEXP }
end
