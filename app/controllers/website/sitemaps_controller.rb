# frozen_string_literal: true

# /sitemap.xml and /robots.txt for search engines. Every public page is listed in each
# language (with hreflang alternates), with the time staff last changed it.
class Website::SitemapsController < ApplicationController
  skip_before_action :authenticate

  # Pages under these are for signed-in customers or the dashboard: not worth crawling.
  PRIVATE_PATHS = %w[/admin /profile /checkout /bookings /sign_in /sign_up /sessions /identity /password].freeze

  def show
    @locales = I18n.available_locales
    @entries = Rails.cache.fetch([ "website", "sitemap", "v1" ], expires_in: 1.hour) { entries }

    respond_to { |format| format.xml }
  end

  def robots
    @private_paths = PRIVATE_PATHS.flat_map do |path|
      [ path ] + (I18n.available_locales - [ I18n.default_locale ]).map { |locale| "/#{locale}#{path}" }
    end
    @sitemap_url = sitemap_url

    render formats: :text, content_type: "text/plain"
  end

  private

  # [{ path:, lastmod: }]: language-neutral paths, prefixed per language in the view.
  def entries
    base = [ "/", "/services", "/blogs", "/faqs", "/contact" ].map { |path| { path: path, lastmod: nil } }

    base +
      records(ServiceCategory.where(is_active: true)) { |slug| "/categories/#{slug}" } +
      records(Service.publicly_listed) { |slug| "/services/#{slug}" } +
      records(Blog.where(is_active: true)) { |slug| "/blogs/#{slug}" } +
      records(Page.where(is_active: true).where.not(slug: %w[home contact])) { |slug| "/#{slug}" }
  end

  def records(scope)
    scope.pluck(:slug, :updated_at).map { |slug, updated_at| { path: yield(slug), lastmod: updated_at } }
  end
end
