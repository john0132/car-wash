# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Pundit::Authorization

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  before_action :set_current_request_details
  before_action :authenticate

  private

  def authenticate
    redirect_to authentication_path unless perform_authentication
  end

  def require_no_authentication
    return unless perform_authentication

    flash[:notice] = "You are already signed in"
    redirect_to after_authentication_path
  end

  # Where unauthenticated visitors are sent. Overridden per area (e.g. Admin::BaseController).
  def authentication_path
    sign_in_path
  end

  # Where signed-in users land. Overridden per area (e.g. Admin::BaseController).
  def after_authentication_path
    root_path
  end

  def start_new_session_for(user)
    user.sessions.create!.tap do |session|
      cookies.signed.permanent[:session_token] = { value: session.id, httponly: true }
    end
  end

  def perform_authentication
    Current.session ||= Session.find_by_id(cookies.signed[:session_token])
  end

  def set_current_request_details
    Current.user_agent = request.user_agent
    Current.ip_address = request.ip
  end

  def user_not_authorized
    flash[:alert] = "You are not authorized to perform this action"
    redirect_back fallback_location: after_authentication_path
  end

  def pundit_user
    Current.user
  end
end
