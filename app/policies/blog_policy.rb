# frozen_string_literal: true

# Dashboard management of blogs, gated by the "blogs.*" permissions.
class BlogPolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")
  def create? = permit?("create")
  def update? = permit?("update")
  def destroy? = permit?("delete")
end
