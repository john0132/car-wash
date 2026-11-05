# frozen_string_literal: true

# Name translations for dashboard forms of models using Translatable (City, Area, …):
# one `{ language_id, code, language, default, name }` entry per Language, posted back as
# `translations: [{ language_id, name }, …]`.
#
# Pass `fields:` (e.g. `%i[seo_title seo_description]`) to carry extra string columns of
# the translation table alongside the name, both in the props and in the posted entries.
module Admin::Translations
  extend ActiveSupport::Concern

  private

  def languages
    @languages ||= Language.order(:id).to_a
  end

  # One entry per Language (blank values for missing ones), default language first.
  def translations_props(record, fields: [])
    default_code = I18n.default_locale.to_s
    by_language = record.translations.index_by(&:language_id)

    languages.sort_by { |l| l.code == default_code ? 0 : 1 }.map do |language|
      translation = by_language[language.id]

      {
        language_id: language.id,
        code: language.code,
        language: language.name,
        default: language.code == default_code,
        name: translation&.name.to_s
      }.merge(fields.to_h { |field| [ field, translation&.public_send(field).to_s ] })
    end
  end

  # Sets each language's name (and `fields`). A blank name removes that translation; the
  # model validates that the default language keeps one. Unknown language ids are ignored.
  def assign_translations(record, entries, fields: [])
    by_language = Array(entries).index_by { |entry| entry[:language_id].to_i }

    languages.each do |language|
      entry = by_language[language.id]
      next unless entry

      translation = record.translations.find { |t| t.language_id == language.id }
      name = entry[:name].to_s.strip

      if name.present?
        translation ||= record.translations.build(language: language)
        translation.name = name
        fields.each { |field| translation.public_send(:"#{field}=", entry[field].to_s.strip.presence) if entry.key?(field) }
      elsif translation&.persisted?
        translation.mark_for_destruction
      elsif translation
        record.translations.delete(translation)
      end
    end
  end

  # "Cairo" in the current locale (with fallbacks), for lists and breadcrumbs.
  def translated_name(record)
    record.translation&.name || "##{record.id}"
  end
end
