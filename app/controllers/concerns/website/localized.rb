# frozen_string_literal: true

# Language of the public website, taken from an optional URL prefix: English is
# the default and has no prefix (/services), other languages do (/ar/services).
# Everything the website renders (content translations, flash messages,
# validation errors, mails) follows I18n.locale for the request.
module Website::Localized
  extend ActiveSupport::Concern

  RTL_LOCALES = %w[ar].freeze

  included do
    around_action :switch_locale
    helper_method :rtl_locale?
    inertia_share locale: -> { locale_props }
  end

  private

  # The language comes from the URL prefix (see LocalePrefix). Route helpers and
  # redirects keep the prefix through SCRIPT_NAME, so the visitor stays in their language.
  def switch_locale(&action)
    requested = request.env[LocalePrefix::ENV_KEY].to_s
    locale = I18n.available_locales.map(&:to_s).include?(requested) ? requested : I18n.default_locale.to_s
    I18n.with_locale(locale, &action)
  end

  def rtl_locale?
    RTL_LOCALES.include?(I18n.locale.to_s)
  end

  # The `locale` prop: current language, its direction, and the same page in each language.
  def locale_props
    names = Language.where(code: I18n.available_locales.map(&:to_s)).pluck(:code, :name).to_h

    {
      code: I18n.locale.to_s,
      dir: rtl_locale? ? "rtl" : "ltr",
      default: I18n.default_locale.to_s,
      available: I18n.available_locales.map do |locale|
        { code: locale.to_s, name: names[locale.to_s] || locale.to_s.upcase, href: localized_href(locale) }
      end
    }
  end

  # This request's path and query in another language (prefix swapped).
  def localized_href(locale)
    prefix = locale == I18n.default_locale ? "" : "/#{locale}"
    full = request.path_info == "/" ? prefix : "#{prefix}#{request.path_info}"
    full = "/" if full.blank?
    query = request.query_string.presence
    query ? "#{full}?#{query}" : full
  end
end
