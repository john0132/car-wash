# frozen_string_literal: true

# Shared create/edit/update/destroy/activation for staff accounts. Subclasses
# (AdministratorsController, EmployeesController) provide index/show and the
# hooks at the bottom of this file. It has no routes of its own.
#
# Not marked `abstract!`: Rails treats an abstract parent's public methods as
# internal, which would stop `new`/`create`/… from being actions in subclasses.
class Admin::StaffController < Admin::BaseController
  include Admin::UserManagement

  before_action :set_staff_member, only: %i[show edit update destroy activation]

  def new
    authorize_kind staff_kind, :create?
    render inertia: form_props(User.new(role: staff_kind, is_active: true))
  end

  def create
    authorize_kind staff_kind, :create?
    user = User.new(staff_params(nil).merge(role: staff_kind))

    if save_in_transaction(user) { user.save }
      redirect_to member_path(user), notice: "#{user.full_name} was created"
    else
      redirect_to new_member_path, inertia: { errors: user.errors }
    end
  end

  def edit
    authorize @user, :update?
    render inertia: form_props(@user)
  end

  def update
    authorize @user

    if save_in_transaction(@user) { @user.update(staff_params(@user)) }
      redirect_to member_path(@user), notice: "#{@user.full_name} was updated"
    else
      redirect_to edit_member_path(@user), inertia: { errors: @user.errors }
    end
  end

  def destroy
    authorize @user

    if @user.destroy
      redirect_to collection_path, notice: "#{@user.full_name} was deleted"
    else
      redirect_back_or_to member_path(@user), alert: @user.errors.full_messages.to_sentence
    end
  end

  def activation
    authorize @user, :manage_access?

    update_activation(@user, fallback: member_path(@user))
  end

  private

  def set_staff_member
    @user = User.public_send(staff_kind).find(params[:id])
  end

  # `role_ids=` on a persisted record writes immediately, so roll it back if the
  # rest of the record fails validation.
  def save_in_transaction(user)
    User.transaction { yield || raise(ActiveRecord::Rollback) }.present?
  end

  def staff_params(user)
    attrs = params.expect(user: [ :name, :last_name, :email, :password, :password_confirmation, :is_active,
                                  *extra_permitted_params ])

    if user&.persisted?
      attrs = attrs.except(:password, :password_confirmation) if attrs[:password].blank?
      attrs = attrs.except(:is_active, *access_params) unless policy(user).manage_access?
    end

    attrs
  end

  def form_props(user)
    {
      user: user_props(user),
      can_manage_access: user.new_record? || policy(user).manage_access?
    }
  end

  # --- Subclass hooks -------------------------------------------------------

  def staff_kind = raise(NotImplementedError)
  def collection_path = raise(NotImplementedError)
  def member_path(_user) = raise(NotImplementedError)
  def new_member_path = raise(NotImplementedError)
  def edit_member_path(_user) = raise(NotImplementedError)

  # Extra strong-params entries, e.g. `[ { role_ids: [] } ]`.
  def extra_permitted_params = []

  # Keys of extra_permitted_params a user may not change on their own account.
  def access_params = []
end
