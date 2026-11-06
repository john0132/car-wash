# frozen_string_literal: true

class FooterTranslation < ApplicationRecord
  belongs_to :footer, touch: true
  belongs_to :language

  validates :language_id, uniqueness: { scope: :footer_id }
end
