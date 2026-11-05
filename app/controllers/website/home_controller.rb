# frozen_string_literal: true

class Website::HomeController < Website::BaseController
  skip_before_action :authenticate
  before_action :perform_authentication

  def index
  end
end
