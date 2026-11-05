# frozen_string_literal: true

# A blog post. Its text (title, rich text body, SEO) lives in blog_translations.
class Blog < ApplicationRecord
  include Attachable
  include Activatable
  include Translatable

  SLUG_REGEXP = /\A[a-z0-9]+(?:-[a-z0-9]+)*\z/

  has_many :blog_translations, dependent: :destroy, autosave: true
  has_one_attached :cover_image

  requires_default_translation

  validates :slug, presence: true, uniqueness: true, format: { with: SLUG_REGEXP }

  # Matches a slug or a name in any language.
  scope :search, ->(query) {
    next all if query.blank?

    search_name(query).or(where("blogs.slug ILIKE ?", "%#{sanitize_sql_like(query.strip)}%"))
  }
end
