# frozen_string_literal: true

# Base for every public website controller. Renders with the `application`
# layout, which loads the `website.tsx` Inertia entrypoint (SSR-enabled).
class Website::BaseController < InertiaController
end
