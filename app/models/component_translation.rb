# frozen_string_literal: true

class ComponentTranslation < ApplicationRecord
  belongs_to :component
  belongs_to :language

  validates :name, presence: true
  validates :language_id, uniqueness: { scope: :component_id }
end
