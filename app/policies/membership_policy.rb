# frozen_string_literal: true

# Tiers are never deleted (customers reference them), only disabled via update.
class MembershipPolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")
  def create? = permit?("create")
  def update? = permit?("update")

  private

  def resource_name = "memberships"
end
