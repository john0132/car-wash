# frozen_string_literal: true

class Website::HomeController < Website::BaseController
  include Website::RendersPage

  skip_before_action :authenticate
  before_action :perform_authentication

  def index
    render inertia: { page: find_page("home")&.render_props }
  end
end
