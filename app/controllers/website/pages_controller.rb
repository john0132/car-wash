# frozen_string_literal: true

# Any public page by slug, built from the admin-side Page/PageSection/Component
# CMS (see config/routes.rb's trailing `:slug` route and Website::RendersPage).
class Website::PagesController < Website::BaseController
  include Website::RendersPage

  skip_before_action :authenticate
  before_action :perform_authentication

  def show
    page = find_page(params[:slug])
    raise ActiveRecord::RecordNotFound unless page

    render inertia: { page: page.render_props }
  end
end
