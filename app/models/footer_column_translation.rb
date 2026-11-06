# frozen_string_literal: true

class FooterColumnTranslation < ApplicationRecord
  belongs_to :footer_column, touch: true
  belongs_to :language

  validates :title, presence: true
  validates :language_id, uniqueness: { scope: :footer_column_id }
end
