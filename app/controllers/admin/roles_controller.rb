# frozen_string_literal: true

# Roles bundle "resource.action" permissions (Permission::CATALOG). Administrators
# get dashboard access only through the roles assigned to them.
class Admin::RolesController < Admin::BaseController
  include Admin::Pagination

  after_action :verify_authorized

  before_action :set_role, only: %i[show edit update destroy]

  def index
    authorize Role

    scope = Role.order(:name)
    scope = scope.where("roles.name ILIKE ?", "%#{Role.sanitize_sql_like(params[:q].strip)}%") if params[:q].present?
    roles, pagination = paginate(scope)
    ids = roles.map(&:id)
    permissions_counts = RolePermission.where(role_id: ids).group(:role_id).count
    administrators_counts = UserRole.where(role_id: ids).group(:role_id).count

    render inertia: {
      roles: roles.map { |role|
        role_props(role).merge(
          permissions_count: permissions_counts.fetch(role.id, 0),
          administrators_count: administrators_counts.fetch(role.id, 0)
        )
      },
      filters: { q: params[:q].presence },
      pagination: pagination
    }
  end

  def show
    authorize @role

    render inertia: {
      role: role_props(@role).merge(permission_keys: @role.permission_keys),
      catalog: catalog_props,
      administrators_count: @role.users.count,
      # Names of the administrators holding the role are shown only to those who may list administrators.
      administrators: UserPolicy.new(Current.user, :admin).index? ? administrators_props : nil
    }
  end

  def new
    role = Role.new
    authorize role

    render inertia: form_props(role)
  end

  def create
    role = Role.new
    authorize role

    if save_role(role)
      redirect_to admin_role_path(role), notice: "#{role.name} was created"
    else
      redirect_to new_admin_role_path, inertia: { errors: role.errors }
    end
  end

  def edit
    authorize @role, :update?

    render inertia: form_props(@role)
  end

  def update
    authorize @role

    if save_role(@role)
      redirect_to admin_role_path(@role), notice: "#{@role.name} was updated"
    else
      redirect_to edit_admin_role_path(@role), inertia: { errors: @role.errors }
    end
  end

  def destroy
    authorize @role

    if @role.destroy
      redirect_to admin_roles_path, notice: "#{@role.name} was deleted"
    else
      redirect_back_or_to admin_role_path(@role), alert: @role.errors.full_messages.to_sentence
    end
  end

  private

  def set_role
    @role = Role.includes(:permissions).find(params[:id])
  end

  def role_params
    @role_params ||= params.expect(role: [ :name, :description, permission_keys: [] ])
  end

  # `permission_keys=` on a persisted role writes immediately, so roll it back
  # if the name or description fails validation.
  def save_role(role)
    Role.transaction do
      role.assign_attributes(name: role_params[:name], description: role_params[:description].presence)
      role.permission_keys = role_params.fetch(:permission_keys, [])
      role.save || raise(ActiveRecord::Rollback)
    end.present?
  end

  def role_props(role)
    {
      id: role.id,
      name: role.name,
      description: role.description,
      super_admin: role.super_admin?,
      created_at: role.created_at
    }
  end

  def catalog_props
    Permission::CATALOG.map { |resource, actions| { resource: resource, label: resource.humanize, actions: actions } }
  end

  def administrators_props
    @role.users.order(:name).map do |user|
      { id: user.id, full_name: user.full_name, email: user.email, is_active: user.is_active }
    end
  end

  def form_props(role)
    {
      role: role.persisted? ? role_props(role) : nil,
      permission_keys: role.persisted? ? role.permission_keys : [],
      catalog: catalog_props
    }
  end
end
