# frozen_string_literal: true

# The branded error page, in the site's chrome and the visitor's language.
# Rails sends failed requests here through `config.exceptions_app` (routing
# errors, 500s…); a record that isn't found inside a website controller is
# rendered by Website::BaseController#render_not_found instead. Everything
# outside the website (the dashboard) gets the plain static pages.
class Website::ErrorsController < Website::BaseController
  skip_before_action :authenticate
  before_action :perform_authentication

  STATUSES = [ 404, 422, 500 ].freeze

  def show
    original = request.env["action_dispatch.original_path"].to_s
    return render_static if original.start_with?("/admin")

    render_error status_code
  end

  private

  def status_code
    code = request.path_info.delete("/").to_i
    STATUSES.include?(code) ? code : 404
  end

  def render_static
    code = status_code
    render file: Rails.public_path.join("#{code}.html"), layout: false, status: code
  end
end
