# frozen_string_literal: true

class User < ApplicationRecord
  include Activatable

  # Digits with optional leading "+", spaces and dashes; 7–20 characters.
  PHONE_FORMAT = /\A\+?[\d\s-]{7,20}\z/

  has_secure_password

  generates_token_for :password_reset, expires_in: 20.minutes do
    password_salt.last(10)
  end

  enum :role, { admin: "admin", employee: "employee", customer: "customer" }

  has_many :sessions, dependent: :destroy
  has_many :bookings, dependent: :restrict_with_error
  has_many :assigned_bookings, class_name: "Booking", foreign_key: :employee_id,
    inverse_of: :employee, dependent: :nullify
  has_many :payment_transactions, dependent: :restrict_with_error
  has_many :addresses, dependent: :destroy
  has_many :cars, dependent: :destroy
  has_many :user_roles, dependent: :destroy
  has_many :roles, through: :user_roles
  belongs_to :membership, optional: true
  belongs_to :package, optional: true

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, allow_nil: true, length: { minimum: 12 }
  validates :role, presence: true
  validates :wallet, :points, :lifetime_points, numericality: { greater_than_or_equal_to: 0 }
  validates :phone, format: { with: PHONE_FORMAT, message: ->(*) { I18n.t("website.errors.phone_invalid") } }, allow_blank: true

  normalizes :email, with: -> { _1.strip.downcase }
  normalizes :phone, with: -> { _1.squish.presence }

  # Adds `lifetime_value` and `bookings_count` columns, one subquery each, for customer lists.
  scope :with_customer_totals, -> {
    bookings = Booking.where("bookings.user_id = users.id")
    select(
      "users.*",
      "(#{bookings.select(Booking.lifetime_value_sql).to_sql}) AS lifetime_value",
      "(#{bookings.select('COUNT(*)').to_sql}) AS bookings_count"
    )
  }

  # Adds `assigned_count`, `completed_count` and `open_count` columns for employee lists.
  scope :with_assignment_counts, -> {
    assigned = Booking.where("bookings.employee_id = users.id")
    select(
      "users.*",
      "(#{assigned.select('COUNT(*)').to_sql}) AS assigned_count",
      "(#{assigned.completed.select('COUNT(*)').to_sql}) AS completed_count",
      "(#{assigned.open.select('COUNT(*)').to_sql}) AS open_count"
    )
  }

  scope :search, ->(query) {
    next all if query.blank?

    term = "%#{sanitize_sql_like(query.strip)}%"
    where("users.name ILIKE :term OR users.last_name ILIKE :term OR users.email ILIKE :term", term: term)
  }

  after_update if: :password_digest_previously_changed? do
    sessions.where.not(id: Current.session).delete_all
  end

  # A disabled account is signed out everywhere; sign-in rejects it until re-enabled.
  after_update if: -> { is_active_previously_changed?(to: false) } do
    sessions.delete_all
  end

  def full_name
    [ name, last_name ].compact_blank.join(" ")
  end

  def last_seen_at
    sessions.maximum(:updated_at)
  end

  def staff?
    admin? || employee?
  end

  # Holds the Super Admin role, so it may manage roles without restriction (see RolePolicy).
  def super_admin?
    admin? && roles.any?(&:super_admin?)
  end

  # Privilege-escalation guard: only a Super Admin may hand out the Super Admin
  # role, and everybody else may only hand out roles made of permissions they
  # hold themselves (so nobody can grant more access than they have).
  def can_grant_role?(role)
    return true if super_admin?
    return false if role.super_admin?

    (role.permission_keys - permission_names).empty?
  end

  # "resource.action" keys granted through the user's roles, e.g. ["customers.read"].
  # Only admins hold roles; employees and customers have no dashboard permissions.
  #
  # Memoized on the instance, so a request (one Current.user) loads it once and
  # every policy check reuses it. `reload` clears it.
  def permission_names
    return [] unless admin?

    @permission_names ||= Permission.joins(:role_permissions)
      .where(role_permissions: { role_id: user_roles.select(:role_id) })
      .distinct.order(:resource, :action)
      .pluck(:resource, :action).map { |resource, action| "#{resource}.#{action}" }
  end

  def permission?(resource, action)
    permission_names.include?("#{resource}.#{action}")
  end

  def reload(*)
    @permission_names = nil
    super
  end
end
