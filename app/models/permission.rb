# frozen_string_literal: true

class Permission < ApplicationRecord
  # Every "resource.action" the admin dashboard checks. Seeds sync this into the table.
  CATALOG = {
    "customers" => %w[read update],
    "bookings" => %w[read update],
    "memberships" => %w[read create update],
    "service_categories" => %w[read create update delete],
    "services" => %w[read create update delete],
    "extras" => %w[read create update delete],
    "payment_methods" => %w[read create update],
    "payment_transactions" => %w[read],
    "admins" => %w[read create update delete],
    "roles" => %w[read create update delete],
    "employees" => %w[read create update delete],
    "cities" => %w[read create update delete],
    "areas" => %w[read create update delete],
    "pages" => %w[read create update delete],
    "blogs" => %w[read create update delete],
    "components" => %w[read create update delete],
    "faqs" => %w[read create update delete]
  }.freeze

  has_many :role_permissions, dependent: :destroy
  has_many :roles, through: :role_permissions

  validates :resource, presence: true
  validates :action, presence: true
  validates :action, uniqueness: { scope: :resource }

  # Every "resource.action" key in CATALOG, in catalog order.
  def self.catalog_keys
    CATALOG.flat_map { |resource, actions| actions.map { |action| "#{resource}.#{action}" } }
  end

  def self.sync_catalog!
    for_keys!(catalog_keys)
  end

  # Permission rows for the given "resource.action" keys, creating any that are
  # missing. Keys outside CATALOG are ignored, so a role can only hold real permissions.
  def self.for_keys!(keys)
    (catalog_keys & Array(keys).map(&:to_s)).map do |key|
      resource, action = key.split(".", 2)
      find_or_create_by!(resource: resource, action: action)
    end
  end

  def key
    "#{resource}.#{action}"
  end
end
