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
  has_many :user_roles, dependent: :destroy
  has_many :roles, through: :user_roles
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

  def staff?
    admin? || employee?
  end

  # "resource.action" keys the user is granted, e.g. ["bookings.read"].
  def permission_names
    scope = if admin?
      Permission.all
    elsif employee?
      Permission.joins(:role_permissions).where(role_permissions: { role_id: user_roles.select(:role_id) }).distinct
    else
      Permission.none
    end

    scope.order(:resource, :action).pluck(:resource, :action).map { |resource, action| "#{resource}.#{action}" }
  end

  def permission?(resource, action)
    return true if admin?
    return false unless employee?

    roles.joins(:permissions).exists?(permissions: { resource: resource, action: action })
  end
end
