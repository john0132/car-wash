# frozen_string_literal: true

# Base for every public website controller. Renders with the `application`
# layout, which loads the `website.tsx` Inertia entrypoint (SSR-enabled).
class Website::BaseController < InertiaController
  # Header and footer content staff edit in the dashboard (see SiteChrome).
  inertia_share site: -> { SiteChrome.props(I18n.locale) }

  private

  # The website only knows customers. A staff session (admin dashboard sign-in
  # shares the same cookie) is treated as signed out here, so staff and
  # customer areas never bleed into each other.
  def perform_authentication
    super
    Current.session = nil if Current.session && !Current.user.customer?
    Current.session
  end
end
