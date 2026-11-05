# frozen_string_literal: true

# Dashboard management of service categories, gated by the "service_categories.*" permissions.
class ServiceCategoryPolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")
  def create? = permit?("create")
  def update? = permit?("update")
  def destroy? = permit?("delete")
end
