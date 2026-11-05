# frozen_string_literal: true

class Website::SessionsController < Website::BaseController
  skip_before_action :authenticate, only: %i[new create]
  before_action :require_no_authentication, only: %i[new create]
  before_action :set_session, only: :destroy

  def new
  end

  def create
    user = User.authenticate_by(email: params[:email], password: params[:password])

    if user&.is_active?
      start_new_session_for(user)
      redirect_to after_authentication_path, notice: "Signed in successfully"
    elsif user
      redirect_to sign_in_path, alert: "Your account has been disabled"
    else
      redirect_to sign_in_path, alert: "That email or password is incorrect"
    end
  end

  def destroy
    @session.destroy!
    Current.session = nil
    redirect_to settings_sessions_path, notice: "That session has been logged out", inertia: { clear_history: true }
  end

  private

  def set_session
    @session = Current.user.sessions.find(params[:id])
  end
end
