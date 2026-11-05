# frozen_string_literal: true

# Dashboard management of pages, gated by the "pages.*" permissions.
class PagePolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")
  def create? = permit?("create")
  def update? = permit?("update")
  def destroy? = permit?("delete")
end
