# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  generates_token_for :email_verification, expires_in: 2.days do
    email
  end

  generates_token_for :password_reset, expires_in: 20.minutes do
    password_salt.last(10)
  end

  enum :role, { admin: "admin", employee: "employee", customer: "customer" }

  has_many :sessions, dependent: :destroy
  has_many :payment_transactions, dependent: :restrict_with_error
  has_many :addresses, dependent: :destroy
  belongs_to :membership, optional: true
  belongs_to :package, optional: true

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, allow_nil: true, length: { minimum: 12 }
  validates :role, presence: true
  validates :wallet, :points, :lifetime_points, numericality: { greater_than_or_equal_to: 0 }

  normalizes :email, with: -> { _1.strip.downcase }

  before_validation if: :email_changed?, on: :update do
    self.verified = false
  end

  after_update if: :password_digest_previously_changed? do
    sessions.where.not(id: Current.session).delete_all
  end
end
