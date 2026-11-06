# frozen_string_literal: true

# A message sent through the website's contact us form. Read-only in the
# dashboard (list, view, delete).
class ContactMessage < ApplicationRecord
  validates :first_name, :last_name, :email, :message, presence: true
  validates :first_name, :last_name, :email, :phone, length: { maximum: 255 }
  validates :message, length: { maximum: 5000 }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true

  before_validation { [ :first_name, :last_name, :email, :phone, :message ].each { |a| self[a] = self[a].to_s.strip.presence } }

  scope :newest_first, -> { order(created_at: :desc, id: :desc) }

  scope :search, ->(query) {
    next all if query.blank?

    pattern = "%#{sanitize_sql_like(query.strip)}%"
    where("first_name ILIKE :q OR last_name ILIKE :q OR email ILIKE :q OR phone ILIKE :q OR message ILIKE :q", q: pattern)
  }

  def full_name = "#{first_name} #{last_name}".strip
end
