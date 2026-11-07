# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Pundit::Authorization

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
      write_session_cookie(session)
    end
  end

  def write_session_cookie(session)
    cookies.signed[:session_token] = { value: session.id, httponly: true, expires: Session::IDLE_TIMEOUT.from_now }
  end

  # Sessions idle for longer than Session::IDLE_TIMEOUT are deleted instead of
  # accepted; active ones are touched (at most daily) so they keep sliding forward.
  def perform_authentication
    Current.session ||= begin
      session = Session.find_by_id(cookies.signed[:session_token])

      if session&.expired?
        session.destroy
        cookies.delete(:session_token)
        nil
      elsif session&.stale?
        session.touch
        write_session_cookie(session)
        session
      else
        session
      end
    end
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
