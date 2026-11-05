# frozen_string_literal: true

class BlogTranslation < ApplicationRecord
  belongs_to :blog
  belongs_to :language

  validates :name, :title, presence: true
  validates :language_id, uniqueness: { scope: :blog_id }
end
