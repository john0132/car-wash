# frozen_string_literal: true

class Permission < ApplicationRecord
  # Every "resource.action" the admin dashboard checks. Seeds sync this into the table.
  CATALOG = {
    "customers" => %w[read update],
    "memberships" => %w[read create update],
    "service_categories" => %w[read create update delete],
    "services" => %w[read create update delete],
    "payment_methods" => %w[read create update],
    "payment_transactions" => %w[read],
    "admins" => %w[read create update delete],
    "employees" => %w[read create update delete],
    "cities" => %w[read create update delete],
    "areas" => %w[read create update delete],
    "pages" => %w[read create update delete],
    "blogs" => %w[read create update delete],
    "components" => %w[read create update delete]
  }.freeze

  has_many :role_permissions, dependent: :destroy
  has_many :roles, through: :role_permissions

  validates :resource, presence: true
  validates :action, presence: true
  validates :action, uniqueness: { scope: :resource }

  def self.sync_catalog!
    CATALOG.flat_map do |resource, actions|
      actions.map { |action| find_or_create_by!(resource: resource, action: action) }
    end
  end

  def key
    "#{resource}.#{action}"
  end
end
