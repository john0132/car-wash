# frozen_string_literal: true

# A website page built from ordered PageSections, each an instance of a
# staff-defined Component. Page-level text (name, title, SEO) lives in page_translations.
class Page < ApplicationRecord
  include Activatable
  include Translatable

  SLUG_SEGMENT = /[a-z0-9]+(?:-[a-z0-9]+)*/
  SLUG_REGEXP = /\A#{SLUG_SEGMENT}\z/

  has_many :page_translations, dependent: :destroy, autosave: true
  has_many :header_items, dependent: :destroy
  has_many :footer_items, dependent: :destroy
  has_many :page_sections, -> { order(:position, :id) }, dependent: :destroy, autosave: true, index_errors: true

  requires_default_translation

  validates :slug, presence: true, uniqueness: true, format: { with: SLUG_REGEXP }

  # The website's view of this page in `locale`: page text (each field falls
  # back to the default locale, then any language), the active sections (see PageSection#render_props) and the schema
  # of every component they use, so the website can render components it has
  # no dedicated React component for.
  def render_props(locale = I18n.locale)
    sections = page_sections.select(&:is_active?)
    text = ->(attribute) { translations_for(locale).map(&attribute).find(&:present?) }
    seo_image = translations_for(locale).map(&:seo_image).find(&:attached?)

    {
      id: id,
      slug: slug,
      title: text.(:title),
      subtitle: text.(:subtitle),
      seo: {
        title: text.(:seo_title) || text.(:title),
        description: text.(:seo_description),
        image: seo_image && { url: Rails.application.routes.url_helpers.rails_blob_path(seo_image.blob, only_path: true) }
      },
      sections: sections.map { |section| section.render_props(locale) },
      components: sections.map(&:component).uniq.to_h { |c| [ c.key, c.schema.as_json ] }
    }
  end

  private

  # Translations in fallback order: `locale`, the default locale, then the rest.
  # Values are taken field by field, like PageSection#render_props.
  def translations_for(locale)
    ids = Language.ids_by_code
    loaded = page_translations.to_a
    preferred = [ ids[locale.to_s], ids[I18n.default_locale.to_s] ].compact
    (preferred.filter_map { |id| loaded.find { |t| t.language_id == id } } + loaded).uniq
  end
end
