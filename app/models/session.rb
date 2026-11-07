# frozen_string_literal: true

class Session < ApplicationRecord
  # A session ends after this long without a request (each use pushes it back).
  IDLE_TIMEOUT = 30.days
  # How often a busy session rewrites its timestamp / refreshes its cookie.
  REFRESH_AFTER = 1.day

  belongs_to :user

  scope :expired, -> { where(updated_at: ...IDLE_TIMEOUT.ago) }

  def expired?
    updated_at < IDLE_TIMEOUT.ago
  end

  def stale?
    updated_at < REFRESH_AFTER.ago
  end

  before_create do
    self.user_agent = Current.user_agent
    self.ip_address = Current.ip_address
  end
end
