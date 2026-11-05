# frozen_string_literal: true

# For models whose translatable fields live in a `<model>_translations` table
# (e.g. Membership -> membership_translations). Picks the translation for a
# language code, falling back to the default locale and then to any translation.
#
# Preload `<model>_translations` when calling this on a collection. Languages
# are matched by id (Language.ids_by_code), so they don't need preloading.
module Translatable
  extend ActiveSupport::Concern

  class_methods do
    def translations_association
      :"#{model_name.singular}_translations"
    end

    # Validates that a named translation exists for I18n.default_locale (or,
    # when that language isn't set up, for any language). Translations marked
    # for destruction don't count.
    def requires_default_translation
      validate :default_translation_present
    end
  end

  included do
    # Orders by the name in the default locale's language.
    scope :ordered_by_name, -> {
      table = reflect_on_association(translations_association).klass.arel_table
      default_id = Language.ids_by_code[I18n.default_locale.to_s]
      join = arel_table.join(table, Arel::Nodes::OuterJoin)
        .on(table[:"#{model_name.singular}_id"].eq(arel_table[:id]).and(table[:language_id].eq(default_id)))
        .join_sources

      joins(join).order(table[:name].asc, arel_table[:id].asc)
    }

    # Records with a translation (in any language) whose name contains `query`.
    scope :search_name, ->(query) {
      next all if query.blank?

      matches = reflect_on_association(translations_association).klass
        .where("name ILIKE ?", "%#{sanitize_sql_like(query.strip)}%")
      where(id: matches.select(:"#{model_name.singular}_id"))
    }
  end

  def translations
    public_send(self.class.translations_association)
  end

  def translation(locale = I18n.locale)
    loaded = translations.to_a
    ids = Language.ids_by_code
    find = ->(code) { loaded.find { |t| t.language_id == ids[code.to_s] } }

    find.(locale) || find.(I18n.default_locale) || loaded.first
  end

  private

  def default_translation_present
    default_id = Language.ids_by_code[I18n.default_locale.to_s]
    named = translations.reject(&:marked_for_destruction?).select { |t| t.name.present? }
    return if named.any? { |t| default_id.nil? || t.language_id == default_id }

    language = default_id && Language.find_by(id: default_id)&.name
    errors.add(:translations, language ? "must include a name in #{language}" : "must include at least one name")
  end
end
