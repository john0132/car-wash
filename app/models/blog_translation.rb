# frozen_string_literal: true

class BlogTranslation < ApplicationRecord
  belongs_to :blog
  belongs_to :language

  has_one_attached :seo_image

  before_validation { self.body = HtmlSanitizer.sanitize(body).presence }

  validates :name, :title, presence: true
  validates :language_id, uniqueness: { scope: :blog_id }
end
