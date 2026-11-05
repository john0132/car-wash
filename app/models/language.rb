# frozen_string_literal: true

class Language < ApplicationRecord
  has_many :membership_translations, dependent: :destroy
  has_many :payment_method_translations, dependent: :destroy

  validates :code, presence: true, uniqueness: true
  validates :name, presence: true
end
