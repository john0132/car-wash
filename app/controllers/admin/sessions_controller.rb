# frozen_string_literal: true

class Admin::SessionsController < Admin::BaseController
  skip_before_action :authenticate, :require_staff, only: %i[new create]
  before_action :require_no_authentication, only: %i[new create]

  def new
  end

  def create
    user = User.authenticate_by(email: params[:email], password: params[:password])

    if user && AdminPolicy.new(user, :admin).access?
      start_new_session_for(user)
      redirect_to admin_root_path, notice: "Signed in successfully"
    else
      redirect_to admin_sign_in_path, alert: "That email or password is incorrect"
    end
  end

  def destroy
    Current.session.destroy!
    Current.session = nil
    redirect_to admin_sign_in_path, notice: "Signed out successfully", inertia: { clear_history: true }
  end
end
