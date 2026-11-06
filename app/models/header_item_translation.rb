# frozen_string_literal: true

class HeaderItemTranslation < ApplicationRecord
  belongs_to :header_item, touch: true
  belongs_to :language

  validates :label, presence: true
  validates :language_id, uniqueness: { scope: :header_item_id }
end
