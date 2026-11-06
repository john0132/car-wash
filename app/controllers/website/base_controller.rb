# frozen_string_literal: true

# Base for every public website controller. Renders with the `application`
# layout, which loads the `website.tsx` Inertia entrypoint (SSR-enabled).
class Website::BaseController < InertiaController
  # Header and footer content staff edit in the dashboard (see SiteChrome).
  inertia_share site: -> { SiteChrome.props(I18n.locale) }
end
