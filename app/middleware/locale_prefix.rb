# frozen_string_literal: true

# Serves the public website in more than one language under a path prefix:
# English has none (/services) and every other available locale has its own
# (/ar/services). The prefix is moved from PATH_INFO into SCRIPT_NAME, so the
# routes stay exactly as written, and Rails' URL helpers, redirects and blob
# paths carry the prefix by themselves. The language is left in
# env["website.locale"] for Website::Localized.
class LocalePrefix
  ENV_KEY = "website.locale"

  def initialize(app)
    @app = app
  end

  def call(env)
    match = prefix.match(env["PATH_INFO"])
    if match
      env["SCRIPT_NAME"] = "#{env['SCRIPT_NAME']}/#{match[1]}"
      env["PATH_INFO"] = match.post_match.presence || "/"
      env[ENV_KEY] = match[1]
    end

    @app.call(env)
  end

  private

  def prefix
    others = (I18n.available_locales - [ I18n.default_locale ]).map(&:to_s)
    %r{\A/(#{Regexp.union(others).source})(?=/|\z)}
  end
end
