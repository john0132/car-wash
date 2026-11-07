# frozen_string_literal: true

# Dashboard staff accounts. An administrator's permissions come only from their roles.
class Admin::AdministratorsController < Admin::StaffController
  def index
    authorize_kind :admin, :index?

    administrators, pagination = paginate(filtered_users(:admin).order(:name))
    administrators = administrators.includes(:roles)

    render inertia: {
      administrators: administrators.map { |admin|
        user_props(admin).merge(roles: admin.roles.sort_by(&:name).map { |role| { id: role.id, name: role.name } })
      },
      filters: list_filters,
      pagination: pagination
    }
  end

  def show
    authorize @user

    roles = @user.roles.includes(:permissions).order(:name)

    render inertia: {
      administrator: user_props(@user).merge(last_seen_at: @user.last_seen_at),
      roles: roles.map { |role|
        {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions.map(&:key).sort
        }
      },
      permissions: @user.permission_names
    }
  end

  private

  def form_props(user)
    super.deep_merge(
      user: { role_ids: user.role_ids },
      roles: Role.includes(:permissions).order(:name).select { |role|
        user.role_ids.include?(role.id) || Current.user.can_grant_role?(role)
      }.map { |role|
        { id: role.id, name: role.name, description: role.description, permissions_count: role.permissions.size }
      }
    )
  end

  def staff_kind = :admin
  def extra_permitted_params = [ { role_ids: [] } ]
  def access_params = [ :role_ids ]
  def collection_path = admin_administrators_path
  def member_path(user) = admin_administrator_path(user)
  def new_member_path = new_admin_administrator_path
  def edit_member_path(user) = edit_admin_administrator_path(user)
end
