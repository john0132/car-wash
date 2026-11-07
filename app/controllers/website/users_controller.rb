# frozen_string_literal: true

class Website::UsersController < Website::BaseController
  skip_before_action :authenticate, only: %i[new create]
  before_action :require_no_authentication, only: %i[new create]

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)

    if @user.save
      start_new_session_for(@user)
      redirect_to after_authentication_url, notice: t("website.flash.signed_up")
    else
      redirect_to sign_up_path, inertia: { errors: @user.errors }
    end
  end

  def destroy
    user = Current.user
    if user.authenticate(params[:delete_password] || "")
      user.update!(is_active: false) # keeps bookings and payments; the model signs the account out everywhere
      Current.session = nil
      redirect_to root_path, notice: t("website.flash.account_deleted"), inertia: { clear_history: true }
    else
      redirect_to profile_path, inertia: { errors: { delete_password: [ t("website.errors.delete_password_invalid") ] } }
    end
  end

  private

  def user_params
    params.permit(:email, :name, :last_name, :password, :password_confirmation)
  end
end
