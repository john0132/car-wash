# frozen_string_literal: true

# A frequently asked question shown on the website, in `sort_order`. Question
# and answer text live in faq_translations.
class Faq < ApplicationRecord
  include Activatable
  include Translatable

  has_many :faq_translations, dependent: :destroy, autosave: true

  validate :default_translation_present

  validates :sort_order, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  scope :ordered, -> { order(:sort_order, :id) }

  # Matches a question in any language.
  scope :search_question, ->(query) {
    next all if query.blank?

    matches = FaqTranslation.where("question ILIKE ?", "%#{sanitize_sql_like(query.strip)}%")
    where(id: matches.select(:faq_id))
  }

  private

  def default_translation_present
    default_id = Language.ids_by_code[I18n.default_locale.to_s]
    complete = translations.reject(&:marked_for_destruction?).select { |t| t.question.present? && t.answer.present? }
    return if complete.any? { |t| default_id.nil? || t.language_id == default_id }

    language = default_id && Language.find_by(id: default_id)&.name
    errors.add(:translations, language ? "must include a question and answer in #{language}" : "must include at least one question and answer")
  end
end
