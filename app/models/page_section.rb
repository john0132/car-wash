# frozen_string_literal: true

# One Component placed on a Page, at `position`. Values are split by the
# component's schema (see ComponentSchema):
# - `settings` holds the non-translatable values
# - each PageSectionTranslation's `content` holds the translatable values for one language
#
# Validation errors are keyed so the dashboard can place them on the right input:
# - `fields.<path>` for a non-translatable value
# - `fields.<language code>.<path>` for a translatable value
class PageSection < ApplicationRecord
  belongs_to :page
  belongs_to :component
  has_many :page_section_translations, dependent: :destroy, autosave: true
  has_many_attached :images

  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validate :component_is_active, on: :create
  validate :values_are_valid

  before_validation :clean_values
  after_save :sync_images

  scope :active, -> { where(is_active: true) }

  delegate :schema, to: :component

  def translations
    page_section_translations
  end

  # Replaces the values from a dashboard form: `settings` for non-translatable
  # fields, `content_by_language` as `{ language_id => { key => value } }`.
  # Languages left out keep their content; a language whose content is empty
  # after cleaning is removed.
  def assign_values(settings:, content_by_language:)
    self.settings = settings
    content_by_language.each do |language_id, content|
      translation = translations.find { |t| t.language_id == language_id.to_i } ||
        translations.build(language_id: language_id.to_i)
      translation.content = content
    end
  end

  # Content for `language_id`, or {} when that language has none.
  def content_for(language_id)
    translations.find { |t| t.language_id == language_id && !t.marked_for_destruction? }&.content || {}
  end

  # The website's view of this section in `locale`. Every translatable value
  # falls back field by field: current locale, then the default locale, then
  # any language. Image signed ids become `{ url: }`.
  #
  #   { id: 1, component: "hero", data: { heading: "Shine", image: { url: "/rails/..." },
  #                                       items: [{ id: "a1", title: "Fast" }] } }
  def render_props(locale = I18n.locale)
    contents = fallback_contents(locale)
    blobs = images_by_signed_id

    data = schema.fields.each_with_object({}) do |field, out|
      out[field.key] =
        if field.repeater?
          Array(settings[field.key]).map do |item|
            id = item[ComponentSchema::ITEM_ID]
            texts = contents.map { |c| c.dig(field.key, id) || {} }
            field.fields.each_with_object({ id: id }) do |sub, values|
              values[sub.key] = sub.translatable? ? first_present(texts, sub.key) : render_value(sub, item[sub.key], blobs)
            end
          end
        elsif field.translatable?
          first_present(contents, field.key)
        else
          render_value(field, settings[field.key], blobs)
        end
    end

    { id: id, component: component.key, data: data.deep_symbolize_keys }
  end

  # `{ signed_id => url }` for every attached image, for dashboard previews.
  def image_urls
    images_by_signed_id.transform_values { |blob| blob_path(blob) }
  end

  private

  def clean_values
    return unless component

    self.settings = schema.clean_settings(settings)
    translations.each do |translation|
      next if translation.marked_for_destruction?

      translation.content = schema.clean_content(translation.content, settings)
      translation.mark_for_destruction if translation.content.empty? && translation.persisted?
    end
    translations.target.reject! { |t| t.new_record? && t.content.empty? }
  end

  def component_is_active
    errors.add(:component, "is disabled") if component && !component.is_active?
  end

  def values_are_valid
    return unless component

    default = default_language_id
    default_code = Language.ids_by_code.key(default)
    default_content = content_for(default) if default

    schema.value_errors(settings, nil).each do |path, messages|
      messages.each { |m| errors.add(:"fields.#{path}", m) }
    end
    if schema.translatable?
      schema.value_errors(settings, default_content || {}).each do |path, messages|
        next unless translatable_path?(path)

        messages.each { |m| errors.add(:"fields.#{default_code}.#{path}", m) }
      end
    end

    translations.reject(&:marked_for_destruction?).each do |translation|
      code = Language.ids_by_code.key(translation.language_id)
      schema.content_format_errors(translation.content).each do |path, messages|
        messages.each { |m| errors.add(:"fields.#{code}.#{path}", m) }
      end
    end

    schema.image_values(settings).each do |signed_id|
      next if images_by_signed_id.key?(signed_id) || ActiveStorage::Blob.find_signed(signed_id)

      errors.add(:images, "include an upload that no longer exists; upload it again")
      break
    end
  end

  # Whether `path` ("heading" or "items.0.title") is a translatable field.
  def translatable_path?(path)
    key, _index, sub = path.split(".")
    field = schema.fields.find { |f| f.key == key }
    return false unless field

    sub ? field.fields.find { |f| f.key == sub }&.translatable? : field.translatable?
  end

  # The default locale's language, or the first one with content when the
  # default locale isn't set up.
  def default_language_id
    Language.ids_by_code[I18n.default_locale.to_s] ||
      translations.reject(&:marked_for_destruction?).first&.language_id
  end

  def fallback_contents(locale)
    ids = Language.ids_by_code
    loaded = translations.to_a
    preferred = [ ids[locale.to_s], ids[I18n.default_locale.to_s] ].compact
    ordered = preferred.filter_map { |id| loaded.find { |t| t.language_id == id } }
    (ordered + loaded).uniq.map(&:content)
  end

  def first_present(contents, key)
    contents.map { |c| c[key] }.find { |v| !v.nil? && v != "" }
  end

  def render_value(field, value, blobs)
    return value unless field.type == "image"

    blob = value && (blobs[value] || ActiveStorage::Blob.find_signed(value))
    blob && { url: blob_path(blob) }
  end

  def images_by_signed_id
    @images_by_signed_id ||= images.blobs.index_by(&:signed_id)
  end

  def blob_path(blob)
    Rails.application.routes.url_helpers.rails_blob_path(blob, only_path: true)
  end

  # Attaches every image the values reference and purges the rest, so uploads
  # live and die with the section.
  def sync_images
    blob_ids = schema.image_values(settings).filter_map { |id| ActiveStorage::Blob.find_signed(id)&.id }.uniq
    attached = images_attachments.pluck(:blob_id)

    (blob_ids - attached).each { |blob_id| images_attachments.create!(blob_id: blob_id) }
    images_attachments.where.not(blob_id: blob_ids).find_each(&:purge_later)
    images_attachments.reset
    images_blobs.reset
    @images_by_signed_id = nil
  end
end
