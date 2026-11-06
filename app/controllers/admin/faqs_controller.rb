# frozen_string_literal: true

# Frequently asked questions shown on the website, ordered by sort_order.
# Question/answer text live in faq_translations.
class Admin::FaqsController < Admin::BaseController
  include Admin::Activation
  include Admin::Pagination
  include Admin::ContentTranslations

  TRANSLATION_FIELDS = %i[question answer].freeze

  after_action :verify_authorized

  before_action :set_faq, only: %i[edit update destroy activation]

  def index
    authorize Faq

    scope = Faq.search_question(params[:q]).with_status(params[:status])
    faqs, pagination = paginate(scope.ordered)
    faqs = faqs.includes(:faq_translations)

    render inertia: {
      faqs: faqs.map { |faq| faq_row(faq) },
      filters: { q: params[:q].presence, status: params[:status].presence },
      pagination: pagination
    }
  end

  def new
    faq = Faq.new(is_active: true, sort_order: next_sort_order)
    authorize faq

    render inertia: form_props(faq)
  end

  def create
    faq = Faq.new
    authorize faq

    if save(faq)
      redirect_to admin_faqs_path, notice: "#{display_name(faq)} was created"
    else
      redirect_to new_admin_faq_path, inertia: { errors: content_errors(faq) }
    end
  end

  def edit
    authorize @faq, :update?

    render inertia: form_props(@faq)
  end

  def update
    authorize @faq

    if save(@faq)
      redirect_to admin_faqs_path, notice: "#{display_name(@faq.reload)} was updated"
    else
      redirect_to edit_admin_faq_path(@faq), inertia: { errors: content_errors(@faq) }
    end
  end

  def destroy
    authorize @faq

    if @faq.destroy
      redirect_to admin_faqs_path, notice: "#{display_name(@faq)} was deleted"
    else
      redirect_back_or_to admin_faqs_path, alert: @faq.errors.full_messages.to_sentence
    end
  end

  def activation
    authorize @faq, :update?

    update_record_activation(@faq, name: display_name(@faq), fallback: admin_faqs_path)
  end

  private

  def set_faq
    @faq = Faq.includes(:faq_translations).find(params[:id])
  end

  def save(faq)
    raw = params.to_unsafe_h[:faq] || {}
    faq.sort_order = raw[:sort_order] if raw.key?(:sort_order)
    faq.is_active = ActiveModel::Type::Boolean.new.cast(raw[:is_active]) if raw.key?(:is_active)
    assign_content_translations(faq, raw[:translations] || {}, fields: TRANSLATION_FIELDS)
    faq.save
  end

  def next_sort_order
    (Faq.maximum(:sort_order) || -1) + 1
  end

  def display_name(faq)
    faq.translation&.question || "FAQ ##{faq.id}"
  end

  def faq_row(faq)
    translation = faq.translation

    {
      id: faq.id,
      question: translation&.question,
      sort_order: faq.sort_order,
      is_active: faq.is_active,
      languages: faq.faq_translations.filter_map { |t| Language.ids_by_code.key(t.language_id) },
      updated_at: faq.updated_at
    }
  end

  def form_props(faq)
    {
      faq: { id: faq.id, sort_order: faq.sort_order, is_active: faq.is_active },
      translations: content_translations_props(faq, fields: TRANSLATION_FIELDS),
      languages: languages_props
    }
  end
end
