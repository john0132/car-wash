# frozen_string_literal: true

class FaqTranslation < ApplicationRecord
  belongs_to :faq
  belongs_to :language

  validates :question, :answer, presence: true
  validates :language_id, uniqueness: { scope: :faq_id }
end
