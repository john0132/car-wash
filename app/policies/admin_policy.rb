# frozen_string_literal: true

# Headless policy guarding the admin area as a whole: `authorize :admin, :access?`.
class AdminPolicy < ApplicationPolicy
  UPLOAD_RESOURCES = %w[pages blogs components].freeze

  def access?
    user.present? && user.staff?
  end

  # Direct uploads (images for pages, blogs and components) need a staff user
  # who can create or update at least one of them.
  def upload?
    access? && UPLOAD_RESOURCES.product(%w[create update]).any? { |resource, action| user.permission?(resource, action) }
  end
end
