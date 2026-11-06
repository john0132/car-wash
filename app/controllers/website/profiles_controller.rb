# frozen_string_literal: true

# The customer's single profile page: details, password, devices and account deletion.
class Website::ProfilesController < Website::BaseController
  before_action :set_user

  def show
    render inertia: {
      profile: @user.as_json(only: %i[name last_name email points wallet created_at]),
      sessions: @user.sessions.order(created_at: :desc).as_json(only: %i[id user_agent ip_address created_at])
    }
  end

  def update
    if @user.update(user_params)
      redirect_to profile_path, notice: "Your profile has been updated"
    else
      errors = @user.errors.to_hash
      errors[:email_password] = errors.delete(:password_challenge) if errors.key?(:password_challenge)
      redirect_to profile_path, inertia: { errors: errors }
    end
  end

  private

  def set_user
    @user = Current.user
  end

  # Changing the email address needs the current password; the name never does.
  def user_params
    permitted = params.permit(:name, :last_name, :email, :email_password)
    attrs = permitted.slice(:name, :last_name)
    email = permitted[:email]

    if email.present? && User.normalize_value_for(:email, email) != @user.email
      attrs[:email] = email
      attrs[:password_challenge] = permitted[:email_password].to_s
    end
    attrs
  end
end
