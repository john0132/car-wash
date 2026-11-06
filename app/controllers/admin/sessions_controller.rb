# frozen_string_literal: true

class Admin::SessionsController < Admin::BaseController
  skip_before_action :authenticate, :require_staff, only: %i[new create]
  before_action :require_no_staff_session, only: %i[new create]

  rate_limit to: 10, within: 3.minutes, only: :create,
             with: -> { redirect_to admin_sign_in_path, alert: "Too many attempts. Try again later." }

  def new
  end

  def create
    user = User.authenticate_by(email: params[:email], password: params[:password])

    staff = user if user && AdminPolicy.new(user, :admin).access?

    if staff && !staff.is_active?
      redirect_to admin_sign_in_path, alert: "Your account has been disabled"
    elsif staff
      Current.session&.destroy # replace a signed-in customer session instead of orphaning it
      start_new_session_for(staff)
      redirect_to after_authentication_url, notice: "Signed in successfully"
    else
      redirect_to admin_sign_in_path, alert: "That email or password is incorrect"
    end
  end

  def destroy
    Current.session.destroy!
    Current.session = nil
    redirect_to admin_sign_in_path, notice: "Signed out successfully", inertia: { clear_history: true }
  end

  private

  # Only staff are bounced to the dashboard. A signed-in customer still gets the
  # form, so they can switch to a staff account without signing out of the website first.
  def require_no_staff_session
    return unless perform_authentication && policy(:admin).access?

    redirect_to admin_root_path, notice: "You are already signed in"
  end
end
