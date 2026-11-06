# frozen_string_literal: true

# A navigation link staff configure in the dashboard (HeaderItem, FooterItem).
# It points at one of:
# - a `page`: a CMS Page, so the link follows the page if its slug changes and
#   disappears while the page is disabled
# - a `route`: one of the app screens in ROUTES, so staff never type app paths
# - a `url`: any address (https://, a /path, mailto:, tel: or #anchor)
#
# The including model has `link_type`, `page_id`, `route_key`, `url`,
# `open_in_new_tab`, `is_active` and `position`, and a `label` translation.
module Linkable
  extend ActiveSupport::Concern

  LINK_TYPES = %w[page route url].freeze
  ROUTES = {
    "home" => :root_path,
    "sign_in" => :sign_in_path,
    "sign_up" => :sign_up_path
  }.freeze

  included do
    include Translatable

    belongs_to :page, optional: true

    before_validation :clear_unused_targets

    validates :link_type, inclusion: { in: LINK_TYPES }
    validates :page, presence: true, if: -> { link_type == "page" }
    validates :route_key, inclusion: { in: ROUTES.keys }, if: -> { link_type == "route" }
    validates :url, presence: true, if: -> { link_type == "url" }
    validates :url, format: { with: ComponentSchema::URL_FORMAT, message: "must be a URL starting with https://, http:// or /" },
      allow_blank: true, if: -> { link_type == "url" }
    validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

    scope :active, -> { where(is_active: true) }
    scope :ordered, -> { order(:position, :id) }
  end

  # Where the link goes, or nil when it can't be shown (target page missing or disabled).
  def href
    case link_type
    when "page" then page&.is_active? ? page_href(page) : nil
    when "route" then ROUTES[route_key] && Rails.application.routes.url_helpers.public_send(ROUTES[route_key])
    when "url" then url.presence
    end
  end

  # Whether the link leaves the site.
  def external?
    link_type == "url" && url.to_s.match?(%r{\Ahttps?://})
  end

  private

  def page_href(page)
    helpers = Rails.application.routes.url_helpers
    page.slug == "home" ? helpers.root_path : helpers.page_path(page.slug)
  end

  def clear_unused_targets
    self.page_id = nil unless link_type == "page"
    self.route_key = nil unless link_type == "route"
    self.url = nil unless link_type == "url"
  end
end
