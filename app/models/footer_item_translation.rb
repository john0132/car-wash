# frozen_string_literal: true

class FooterItemTranslation < ApplicationRecord
  belongs_to :footer_item, touch: true
  belongs_to :language

  validates :label, presence: true
  validates :language_id, uniqueness: { scope: :footer_item_id }
end
