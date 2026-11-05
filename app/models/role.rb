# frozen_string_literal: true

class Role < ApplicationRecord
  SUPER_ADMIN = "Super Admin"

  has_many :user_roles, dependent: :destroy
  has_many :users, through: :user_roles

  has_many :role_permissions, dependent: :destroy
  has_many :permissions, through: :role_permissions

  validates :name, presence: true, uniqueness: true

  normalizes :name, with: -> { _1.strip }

  # The seeded Super Admin is found by name and always holds the whole catalog,
  # so it can't be deleted (and only a Super Admin may edit it, see RolePolicy).
  before_destroy prepend: true do
    if super_admin?
      errors.add(:base, "The #{SUPER_ADMIN} role can't be deleted")
      throw :abort
    end
  end

  # The role holding every permission in Permission::CATALOG. Admins get access only via roles.
  def self.super_admin!
    find_or_create_by!(name: SUPER_ADMIN) { |role| role.description = "Full access to the admin dashboard" }.tap do |role|
      role.permissions << (Permission.sync_catalog! - role.permissions)
    end
  end

  def super_admin?
    name_was == SUPER_ADMIN
  end

  # "resource.action" keys this role grants, e.g. ["cities.read"].
  def permission_keys
    permissions.map(&:key).sort
  end

  # Replaces the role's permissions. Unknown keys are ignored (see Permission.for_keys!).
  # On a persisted role this writes immediately, so wrap it in a transaction with the save.
  def permission_keys=(keys)
    self.permissions = Permission.for_keys!(keys)
  end
end
