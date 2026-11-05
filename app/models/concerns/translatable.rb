# frozen_string_literal: true

# For models whose translatable fields live in a `<model>_translations` table
# (e.g. Membership -> membership_translations). Picks the translation for a
# language code, falling back to the default locale and then to any translation.
#
# Preload `<model>_translations` when calling this on a collection. Languages
# are matched by id (Language.ids_by_code), so they don't need preloading.
module Translatable
  extend ActiveSupport::Concern

  def translation(locale = I18n.locale)
    translations = public_send(:"#{self.class.model_name.singular}_translations").to_a
    ids = Language.ids_by_code
    find = ->(code) { translations.find { |t| t.language_id == ids[code.to_s] } }

    find.(locale) || find.(I18n.default_locale) || translations.first
  end
end
