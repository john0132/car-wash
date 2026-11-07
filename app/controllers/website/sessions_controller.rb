# frozen_string_literal: true

class Website::SessionsController < Website::BaseController
  skip_before_action :authenticate, only: %i[new create]
  before_action :require_no_authentication, only: %i[new create]
  before_action :set_session, only: :destroy

  rate_limit to: 10, within: 3.minutes, only: :create,
             with: -> { redirect_to sign_in_path, alert: t("website.flash.too_many_attempts") }

  def new
  end

  def create
    user = User.authenticate_by(email: params[:email], password: params[:password])
    user = nil unless user&.customer? # staff sign in through the admin dashboard

    if user&.is_active?
      start_new_session_for(user)
      redirect_to after_authentication_url, notice: t("website.flash.signed_in")
    elsif user
      redirect_to sign_in_path, alert: t("website.flash.account_disabled")
    else
      redirect_to sign_in_path, alert: t("website.flash.bad_credentials")
    end
  end

  def destroy
    @session.destroy!
    Current.session = nil
    redirect_to profile_path, notice: t("website.flash.session_logged_out"), inertia: { clear_history: true }
  end

  private

  def set_session
    @session = Current.user.sessions.find(params[:id])
  end
end
