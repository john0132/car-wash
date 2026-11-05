# frozen_string_literal: true

class ServiceTranslation < ApplicationRecord
  belongs_to :service
  belongs_to :language

  validates :name, presence: true
  validates :language_id, uniqueness: { scope: :service_id }
end
