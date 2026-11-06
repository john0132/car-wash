# frozen_string_literal: true

class Website::PasswordsController < Website::BaseController
  def update
    user = Current.user

    if user.update(user_params)
      redirect_to profile_path, notice: "Your password has been changed"
    else
      redirect_to profile_path, inertia: { errors: user.errors.to_hash }
    end
  end

  private

  def user_params
    params.permit(:password, :password_confirmation, :password_challenge).with_defaults(password_challenge: "")
  end
end
