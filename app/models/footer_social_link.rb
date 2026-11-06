# frozen_string_literal: true

# A social network link in the footer. `name` ("Instagram") labels the icon
# for screen readers; the icon image and URL are the same in every language.
class FooterSocialLink < ApplicationRecord
  belongs_to :footer, touch: true
  has_one_attached :icon

  validates :name, presence: true
  validates :url, presence: true
  validates :url, format: { with: ComponentSchema::URL_FORMAT, message: "must be a URL starting with https://, http:// or /" },
    allow_blank: true
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  scope :active, -> { where(is_active: true) }
end
