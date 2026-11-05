# frozen_string_literal: true

class UserRole < ApplicationRecord
  belongs_to :user
  belongs_to :role

  validates :role_id, uniqueness: { scope: :user_id }
  validate :user_is_admin

  private

  def user_is_admin
    return if user.nil? || user.admin?

    errors.add(:user, "must be an admin to be assigned a role")
  end
end
