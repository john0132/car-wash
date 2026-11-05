# frozen_string_literal: true

class MembershipTranslation < ApplicationRecord
  belongs_to :membership
  belongs_to :language

  validates :name, presence: true
  validates :language_id, uniqueness: { scope: :membership_id }
end
