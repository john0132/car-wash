# frozen_string_literal: true

# A message sent through the website's contact us form. Read-only in the
# dashboard (list, view, delete).
class ContactMessage < ApplicationRecord
  validates :first_name, :last_name, :email, :phone, :message, presence: true
  validates :first_name, :last_name, :email, :phone, length: { maximum: 255 }
  validates :message, length: { minimum: 10, maximum: 5000 }
  validates :phone, format: { with: /\A\+?[0-9\s\-().]{7,25}\z/, message: "is not a valid phone number" }, allow_blank: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true

  # Strip control characters (keeping newlines/tabs in the message) and
  # surrounding whitespace so stored text can't carry hidden/binary junk.
  before_validation do
    %i[first_name last_name email phone message].each do |a|
      keep = a == :message ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/ : /[[:cntrl:]]/
      self[a] = self[a].to_s.gsub(keep, "").strip.presence
    end
  end

  scope :newest_first, -> { order(created_at: :desc, id: :desc) }

  scope :search, ->(query) {
    next all if query.blank?

    pattern = "%#{sanitize_sql_like(query.strip)}%"
    where("first_name ILIKE :q OR last_name ILIKE :q OR email ILIKE :q OR phone ILIKE :q OR message ILIKE :q", q: pattern)
  }

  def full_name = "#{first_name} #{last_name}".strip
end
