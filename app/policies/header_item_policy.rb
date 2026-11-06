# frozen_string_literal: true

# Dashboard management of the website header navigation, gated by "header_items.*".
# The header is edited as a whole, so there's no create/delete: those are part of `update`.
class HeaderItemPolicy < ApplicationPolicy
  def edit? = permit?("read")
  def update? = permit?("update")
end
