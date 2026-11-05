# frozen_string_literal: true

# Dashboard management of cities, gated by the "cities.*" permissions.
class CityPolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")
  def create? = permit?("create")
  def update? = permit?("update")
  def destroy? = permit?("delete")
end
