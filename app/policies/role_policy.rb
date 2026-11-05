# frozen_string_literal: true

# Dashboard management of roles, gated by the "roles.*" permissions.
# The seeded Super Admin role can't be deleted, and only a Super Admin may edit
# it (even though editing it edits a role they themselves hold).
class RolePolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")
  def create? = permit?("create")
  def update? = permit?("update") && (!super_admin_role? || user.super_admin?)
  def destroy? = permit?("delete") && !super_admin_role?

  private

  def super_admin_role?
    record.is_a?(Role) && record.super_admin?
  end
end
