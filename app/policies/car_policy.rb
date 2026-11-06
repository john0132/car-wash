# frozen_string_literal: true

# Cars belong to customers, who manage them on the website. The dashboard only reads them.
class CarPolicy < ApplicationPolicy
  def index? = permit?("read")

  private

  def resource_name = "cars"
end
