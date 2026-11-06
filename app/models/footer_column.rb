# frozen_string_literal: true

# A titled column of links in the footer.
class FooterColumn < ApplicationRecord
  include Translatable

  belongs_to :footer, touch: true
  has_many :footer_column_translations, dependent: :destroy, autosave: true
  has_many :footer_items, -> { order(:position, :id) }, dependent: :destroy, autosave: true

  requires_default_translation :title

  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  scope :active, -> { where(is_active: true) }
end
