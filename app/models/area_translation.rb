# frozen_string_literal: true

class AreaTranslation < ApplicationRecord
  belongs_to :area
  belongs_to :language

  validates :name, presence: true
  validates :language_id, uniqueness: { scope: :area_id }
end
