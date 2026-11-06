# frozen_string_literal: true

# A unique, URL-safe `slug` column. Blank slugs are generated from the name in the
# default locale (numbered when taken); given ones are normalised and validated.
module Sluggable
  extend ActiveSupport::Concern

  class_methods do
    # `fallback` is the base used when the record has no name to derive one from.
    def sluggable(fallback:)
      @slug_fallback = fallback
      before_validation :generate_slug, if: -> { slug.blank? }
      before_validation { self.slug = slug.to_s.strip.downcase.presence }
      validates :slug, presence: true, uniqueness: true, format: { with: Page::SLUG_REGEXP }
    end

    attr_reader :slug_fallback
  end

  private

  def generate_slug
    base = translated(:name, I18n.default_locale).to_s.parameterize.presence || self.class.slug_fallback
    candidate = base
    candidate = "#{base}-#{SecureRandom.hex(2)}" while self.class.where.not(id: id).exists?(slug: candidate)
    self.slug = candidate
  end
end
