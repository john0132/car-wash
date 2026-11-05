# frozen_string_literal: true

class ExtraTranslation < ApplicationRecord
  belongs_to :extra
  belongs_to :language

  validates :name, presence: true
  validates :language_id, uniqueness: { scope: :extra_id }
end
