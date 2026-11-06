# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Pundit::Authorization

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  before_action :set_current_request_details
  before_action :authenticate

  private

  # Signed-out GET requests remember where they were going (e.g. a checkout
  # with its service and extras), so signing in lands back there.
  def authenticate
    return if perform_authentication

    session[:return_to_after_authenticating] = request.fullpath if request.get? || request.head?
    redirect_to authentication_path
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

  # Where to go right after signing in or up: the page that asked for sign-in, if any.
  def after_authentication_url
    session.delete(:return_to_after_authenticating) || after_authentication_path
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
