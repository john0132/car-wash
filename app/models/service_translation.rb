# frozen_string_literal: true

class ServiceTranslation < ApplicationRecord
  belongs_to :service
  belongs_to :language

  before_validation { self.description = description.to_s.strip.presence }

  validates :name, presence: true
  validates :language_id, uniqueness: { scope: :service_id }
end
