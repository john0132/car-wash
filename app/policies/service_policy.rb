# frozen_string_literal: true

# Dashboard management of services, gated by the "services.*" permissions.
class ServicePolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")
  def create? = permit?("create")
  def update? = permit?("update")
  def destroy? = permit?("delete")
end
