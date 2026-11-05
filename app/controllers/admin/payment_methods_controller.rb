# frozen_string_literal: true

# Ways customers can pay. Names live in payment_method_translations (one per Language);
# methods are disabled rather than deleted because transactions reference them.
class Admin::PaymentMethodsController < Admin::BaseController
  after_action :verify_authorized

  before_action :set_payment_method, only: %i[edit update activation]

  def index
    authorize PaymentMethod

    methods = PaymentMethod.includes(:payment_method_translations).order(:id).to_a
    completed = PaymentTransaction.completed.where(payment_method_id: methods.map(&:id)).group(:payment_method_id)
    counts = PaymentTransaction.where(payment_method_id: methods.map(&:id)).group(:payment_method_id).count
    revenue = completed.sum(:amount)

    render inertia: {
      payment_methods: methods.map { |m|
        payment_method_props(m).merge(transactions_count: counts.fetch(m.id, 0), revenue: revenue.fetch(m.id, 0).to_f)
      },
      stats: { total: methods.size, active: methods.count(&:is_active?) }
    }
  end

  def new
    authorize PaymentMethod
    render inertia: form_props(PaymentMethod.new(is_active: true))
  end

  def create
    authorize PaymentMethod
    payment_method = PaymentMethod.new

    if save(payment_method)
      redirect_to admin_payment_methods_path, notice: "#{display_name(payment_method)} was created"
    else
      redirect_to new_admin_payment_method_path, inertia: { errors: errors_for(payment_method) }
    end
  end

  def edit
    authorize @payment_method, :update?
    render inertia: form_props(@payment_method)
  end

  def update
    authorize @payment_method

    if save(@payment_method)
      redirect_to admin_payment_methods_path, notice: "#{display_name(@payment_method)} was updated"
    else
      redirect_to edit_admin_payment_method_path(@payment_method), inertia: { errors: errors_for(@payment_method) }
    end
  end

  def activation
    authorize @payment_method, :update?

    if @payment_method.update(is_active: ActiveModel::Type::Boolean.new.cast(params.fetch(:is_active)))
      redirect_back_or_to admin_payment_methods_path,
        notice: "#{display_name(@payment_method)} was #{@payment_method.is_active? ? 'enabled' : 'disabled'}"
    else
      redirect_back_or_to admin_payment_methods_path, alert: @payment_method.errors.full_messages.to_sentence
    end
  end

  private

  def set_payment_method
    @payment_method = PaymentMethod.includes(:payment_method_translations).find(params[:id])
  end

  def payment_method_params
    params.expect(payment_method: %i[code is_active])
  end

  # { "<language_id>" => { name: } }, limited to existing languages.
  def translation_params
    raw = params.fetch(:payment_method, {}).fetch(:translations, {})
    return {} unless raw.respond_to?(:key?)

    Language.ids.filter_map { |id| [ id.to_s, raw.require(id.to_s).permit(:name) ] if raw.key?(id.to_s) }.to_h
  end

  def save(payment_method)
    translations = translation_params
    payment_method.assign_attributes(payment_method_params)
    payment_method.code = payment_method.code.to_s.strip.parameterize(separator: "_")
    @translation_error = nil

    PaymentMethod.transaction do
      raise ActiveRecord::Rollback unless payment_method.save

      translations.each do |language_id, attrs|
        record = payment_method.payment_method_translations.find_or_initialize_by(language_id: language_id)
        if attrs[:name].to_s.strip.blank?
          record.destroy if record.persisted?
        else
          record.update!(name: attrs[:name].strip)
        end
      end

      if payment_method.payment_method_translations.reload.empty?
        @translation_error = "Enter a name in at least one language"
        raise ActiveRecord::Rollback
      end

      return true
    end

    false
  end

  def errors_for(payment_method)
    errors = payment_method.errors.to_hash
    errors[:translations] = [ @translation_error ] if @translation_error
    errors
  end

  def display_name(payment_method)
    payment_method.payment_method_translations.reload
    payment_method.translation&.name || payment_method.code
  end

  def payment_method_props(payment_method)
    {
      id: payment_method.id,
      code: payment_method.code,
      name: payment_method.translation&.name,
      is_active: payment_method.is_active,
      created_at: payment_method.created_at
    }
  end

  def translation_props(payment_method)
    by_language = payment_method.payment_method_translations.index_by(&:language_id)

    Language.order(:id).map do |language|
      { language_id: language.id, code: language.code, language: language.name,
        name: by_language[language.id]&.name }
    end
  end

  def form_props(payment_method)
    { payment_method: payment_method_props(payment_method), translations: translation_props(payment_method) }
  end
end
