# frozen_string_literal: true

class Role < ApplicationRecord
  SUPER_ADMIN = "Super Admin"

  has_many :user_roles, dependent: :destroy
  has_many :users, through: :user_roles

  has_many :role_permissions, dependent: :destroy
  has_many :permissions, through: :role_permissions

  validates :name, presence: true, uniqueness: true

  # The role holding every permission in Permission::CATALOG. Admins get access only via roles.
  def self.super_admin!
    find_or_create_by!(name: SUPER_ADMIN) { |role| role.description = "Full access to the admin dashboard" }.tap do |role|
      role.permissions << (Permission.sync_catalog! - role.permissions)
    end
  end
end
