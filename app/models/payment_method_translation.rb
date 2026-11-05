# frozen_string_literal: true

class PaymentMethodTranslation < ApplicationRecord
  belongs_to :payment_method
  belongs_to :language

  validates :name, presence: true
  validates :language_id, uniqueness: { scope: :payment_method_id }
end
