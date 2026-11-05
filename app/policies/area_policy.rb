# frozen_string_literal: true

# Dashboard management of areas, gated by the "cities.*" permissions.
class AreaPolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")
  def create? = permit?("create")
  def update? = permit?("update")
  def destroy? = permit?("delete")
end
