# frozen_string_literal: true

# Authorizes the admin dashboard's user management. Permissions are scoped by
# the kind of user being managed: "customers.*", "admins.*" or "employees.*".
#
# The record is a User, or the role name for collection actions:
#   authorize :employee, :index?, policy_class: UserPolicy
class UserPolicy < ApplicationPolicy
  def index?
    permit?("read")
  end

  def show?
    permit?("read")
  end

  # Customers sign themselves up; staff accounts are created from the dashboard.
  def create?
    staff_record? && permit?("create")
  end

  def update?
    permit?("update") && !protected_record?
  end

  # Customers are never deleted (their bookings reference them), only disabled.
  # Nobody deletes their own account from here.
  def destroy?
    staff_record? && !self? && permit?("delete") && !protected_record?
  end

  # Disabling or changing roles is not allowed on yourself, to avoid locking yourself out.
  def manage_access?
    update? && !self?
  end

  private

  def kind
    record.is_a?(User) ? record.role : record.to_s
  end

  # A Super Admin account can only be edited, disabled or deleted by another
  # Super Admin; otherwise anyone with "administrators.update" could reset its
  # password and sign in as it.
  def protected_record?
    record.is_a?(User) && record.super_admin? && !user.super_admin?
  end

  def staff_record?
    %w[admin employee].include?(kind)
  end

  def self?
    record.is_a?(User) && record == user
  end

  def resource_name
    kind.pluralize
  end
end
