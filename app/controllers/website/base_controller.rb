# frozen_string_literal: true

# Base for every public website controller. Renders with the `application`
# layout, which loads the `website.tsx` Inertia entrypoint (SSR-enabled).
class Website::BaseController < InertiaController
  include Website::Localized
  include Website::PublicProps

  # Header and footer content staff edit in the dashboard (see SiteChrome).
  inertia_share site: -> { SiteChrome.props(I18n.locale) }
  # Absolute URLs (canonical, Open Graph, sitemap) need the public origin.
  inertia_share seo: -> { { origin: request.base_url } }

  # Handlers run after the locale around_action has unwound, so they set the language themselves.
  rescue_from ActiveRecord::RecordNotFound, with: -> { with_request_locale { render_error 404 } }

  private

  # The branded error page (website/errors/show), with the status the browser should see.
  def render_error(status)
    render inertia: "website/errors/show", props: { status: status }, status: status
  end

  # The website only knows customers. A staff session (admin dashboard sign-in
  # shares the same cookie) is treated as signed out here, so staff and
  # customer areas never bleed into each other.
  def perform_authentication
    super
    Current.session = nil if Current.session && !Current.user.customer?
    Current.session
  end
end
