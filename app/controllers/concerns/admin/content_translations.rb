# frozen_string_literal: true

# Multi-field translations for the dashboard's content forms (pages, blogs,
# components). The props are one entry per Language, default language first:
#
#   { language_id:, code:, language:, default:, title: "…", seo_image: { signed_id:, url: } | nil, … }
#
# The form posts them back as `translations: { "<language_id>" => { title: "…", … } }`.
# A language whose text fields are all blank is removed, and the model
# validates that the default language keeps one.
#
# Image props/assignment come from Admin::Images.
module Admin::ContentTranslations
  extend ActiveSupport::Concern

  include Admin::Images

  private

  def languages
    @languages ||= Language.order(:id).to_a.sort_by { |l| l.code == I18n.default_locale.to_s ? 0 : 1 }
  end

  def languages_props
    languages.map { |l| { id: l.id, code: l.code, name: l.name, default: l.code == I18n.default_locale.to_s } }
  end

  # `fields` are text attributes; `images` are has_one_attached names.
  def content_translations_props(record, fields:, images: [])
    by_language = record.translations.index_by(&:language_id)

    languages.map do |language|
      translation = by_language[language.id]
      entry = { language_id: language.id, code: language.code, language: language.name,
                default: language.code == I18n.default_locale.to_s }
      fields.each { |field| entry[field] = translation&.public_send(field).to_s }
      images.each { |image| entry[image] = translation && image_prop(translation.public_send(image)) }
      entry
    end
  end

  def assign_content_translations(record, raw, fields:, images: [])
    raw = raw.respond_to?(:to_unsafe_h) ? raw.to_unsafe_h : raw.to_h

    languages.each do |language|
      values = raw[language.id.to_s] || raw[language.id]
      next unless values

      values = values.with_indifferent_access
      translation = record.translations.find { |t| t.language_id == language.id }

      if fields.all? { |field| values[field].to_s.strip.blank? || HtmlSanitizer.blank?(values[field].to_s) }
        if translation&.persisted?
          translation.mark_for_destruction
        elsif translation
          record.translations.delete(translation)
        end
        next
      end

      translation ||= record.translations.build(language: language)
      fields.each { |field| translation.public_send(:"#{field}=", values[field].to_s.strip.presence) }
      images.each { |image| assign_image(translation, image, values[image]) if values.key?(image) }
    end
  end

  # Errors of the record, with each translation's errors keyed by language as
  # `translations.<language_id>.<attribute>` instead of Rails' `<model>_translations.<attribute>`.
  def content_errors(record)
    association = record.class.translations_association.to_s
    errors = record.errors.to_hash.reject { |key, _| key.to_s.start_with?("#{association}.") }

    record.translations.each do |translation|
      translation.errors.to_hash.each do |attribute, messages|
        errors[:"translations.#{translation.language_id}.#{attribute}"] = messages
      end
    end
    errors
  end
end
