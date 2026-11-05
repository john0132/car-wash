# frozen_string_literal: true

class UserRole < ApplicationRecord
  belongs_to :user
  belongs_to :role

  validates :role_id, uniqueness: { scope: :user_id }
  validate :user_is_employee

  private

  def user_is_employee
    return if user.nil? || user.employee?

    errors.add(:user, "must be an employee to be assigned a role")
  end
end
