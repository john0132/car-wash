# frozen_string_literal: true

# Dashboard management of components, gated by the "components.*" permissions.
class ComponentPolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")
  def create? = permit?("create")
  def update? = permit?("update")
  def destroy? = permit?("delete")
end
