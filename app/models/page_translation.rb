# frozen_string_literal: true

class PageTranslation < ApplicationRecord
  belongs_to :page
  belongs_to :language

  validates :name, :title, presence: true
  validates :language_id, uniqueness: { scope: :page_id }
end
