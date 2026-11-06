# frozen_string_literal: true

class PaymentMethod < ApplicationRecord
  include Translatable

  has_many :payment_method_translations, dependent: :destroy, autosave: true
  has_many :payment_transactions, dependent: :restrict_with_error

  validates :code, presence: true, uniqueness: true

  requires_default_translation
end
