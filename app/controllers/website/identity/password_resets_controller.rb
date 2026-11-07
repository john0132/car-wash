# frozen_string_literal: true

class Website::Identity::PasswordResetsController < Website::BaseController
  skip_before_action :authenticate

  before_action :set_user, only: %i[edit update]

  rate_limit to: 5, within: 10.minutes, only: :create,
             with: -> { redirect_to new_identity_password_reset_path, alert: t("website.flash.too_many_attempts") }

  def new
  end

  def edit
    render inertia: { email: @user.email, sid: params[:sid] }
  end

  def create
    if @user = User.find_by(email: params[:email])
      send_password_reset_email
    end

    # Same answer either way, so the form can't be used to probe which emails have accounts.
    redirect_to sign_in_path, notice: t("website.flash.reset_requested")
  end

  def update
    if @user.update(user_params)
      redirect_to sign_in_path, notice: t("website.flash.reset_done")
    else
      redirect_to edit_identity_password_reset_path(sid: params[:sid]), inertia: { errors: @user.errors }
    end
  end

  private

  def set_user
    @user = User.find_by_token_for!(:password_reset, params[:sid])
  rescue StandardError
    redirect_to new_identity_password_reset_path, alert: t("website.flash.reset_invalid")
  end

  def user_params
    params.permit(:password, :password_confirmation)
  end

  def send_password_reset_email
    UserMailer.with(user: @user).password_reset.deliver_later
  end
end
