# frozen_string_literal: true

# Headless policy guarding the admin area as a whole: `authorize :admin, :access?`.
class AdminPolicy < ApplicationPolicy
  def access?
    user.present? && user.staff?
  end
end
