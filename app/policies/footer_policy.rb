# frozen_string_literal: true

# Dashboard management of the single website footer, gated by "footers.*".
class FooterPolicy < ApplicationPolicy
  def edit? = permit?("read")
  def update? = permit?("update")
end
