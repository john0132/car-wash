# frozen_string_literal: true

# Dashboard management of booking extras, gated by the "extras.*" permissions.
class ExtraPolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")
  def create? = permit?("create")
  def update? = permit?("update")
  def destroy? = permit?("delete")
end
