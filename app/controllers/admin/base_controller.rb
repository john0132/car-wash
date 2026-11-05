# frozen_string_literal: true

# Base for every admin dashboard controller. Renders with the `admin` layout,
# which loads the client-only `admin.tsx` Inertia entrypoint.
class Admin::BaseController < InertiaController
  layout "admin"

  # The admin dashboard is not indexed and does not need SSR.
  # A distinct asset version makes any Inertia visit that crosses between the
  # admin and website bundles a version mismatch, so Inertia does a full page
  # load into the correct entrypoint instead of resolving a foreign page.
  inertia_config ssr_enabled: false,
                 version: -> { "admin-#{InertiaRails.configuration.version}" }

  before_action :require_staff

  # Used by the frontend to hide UI the user cannot use. Never a security boundary:
  # every admin action must still be authorized on the server (Pundit).
  inertia_share admin: -> {
    {
      permissions: Current.user&.permission_names || [],
      is_super_admin: Current.user&.super_admin? || false
    }
  }

  private

  def require_staff
    return if policy(:admin).access?

    redirect_to root_path, alert: "You are not authorized to access the admin area"
  end

  def authentication_path
    admin_sign_in_path
  end

  def after_authentication_path
    admin_root_path
  end
end
