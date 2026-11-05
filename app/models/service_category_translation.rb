# frozen_string_literal: true

class ServiceCategoryTranslation < ApplicationRecord
  belongs_to :service_category
  belongs_to :language

  validates :name, presence: true
  validates :language_id, uniqueness: { scope: :service_category_id }
end
