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
      redirect_to profile_path, inertia: { errors: @user.errors.to_hash }
    end
  end

  private

  def set_user
    @user = Current.user
  end

  def user_params
    params.permit(:name, :last_name, :email)
  end
end
