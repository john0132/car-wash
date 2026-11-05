# frozen_string_literal: true

# The translatable values of a PageSection in one language (see ComponentSchema).
class PageSectionTranslation < ApplicationRecord
  belongs_to :page_section
  belongs_to :language

  validates :language_id, uniqueness: { scope: :page_section_id }
end
