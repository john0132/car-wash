# frozen_string_literal: true

# Groups of services (e.g. Exterior, Interior). Names and SEO text live in
# service_category_translations. A category can only be deleted once it has no services.
class Admin::ServiceCategoriesController < Admin::BaseController
  include Admin::Activation
  include Admin::Pagination
  include Admin::Translations

  TRANSLATION_FIELDS = %i[seo_title seo_description].freeze

  after_action :verify_authorized

  before_action :set_service_category, only: %i[show edit update destroy activation]

  def index
    authorize ServiceCategory

    scope = ServiceCategory.search_name(params[:q]).with_status(params[:status])
    categories, pagination = paginate(scope.ordered_by_name)
    categories = categories.includes(:service_category_translations)
    services_counts = Service.where(service_category_id: categories.map(&:id)).group(:service_category_id).count

    render inertia: {
      service_categories: categories.map { |category|
        category_props(category).merge(services_count: services_counts.fetch(category.id, 0))
      },
      filters: { q: params[:q].presence, status: params[:status].presence },
      pagination: pagination
    }
  end

  def show
    authorize @service_category

    services = @service_category.services.includes(:service_translations).ordered_by_name

    render inertia: {
      service_category: category_props(@service_category),
      services: services.map { |service| service_summary_props(service) }
    }
  end

  def new
    category = ServiceCategory.new(is_active: true)
    authorize category

    render inertia: form_props(category)
  end

  def create
    category = ServiceCategory.new
    authorize category
    assign_category(category)

    if category.save
      redirect_to admin_service_category_path(category), notice: "#{translated_name(category)} was created"
    else
      redirect_to new_admin_service_category_path, inertia: { errors: category.errors }
    end
  end

  def edit
    authorize @service_category, :update?

    render inertia: form_props(@service_category)
  end

  def update
    authorize @service_category
    assign_category(@service_category)

    if @service_category.save
      redirect_to admin_service_category_path(@service_category),
        notice: "#{translated_name(@service_category.reload)} was updated"
    else
      redirect_to edit_admin_service_category_path(@service_category), inertia: { errors: @service_category.errors }
    end
  end

  def destroy
    authorize @service_category

    if @service_category.destroy
      redirect_to admin_service_categories_path, notice: "#{translated_name(@service_category)} was deleted"
    else
      redirect_back_or_to admin_service_category_path(@service_category),
        alert: @service_category.errors.full_messages.to_sentence
    end
  end

  def activation
    authorize @service_category, :update?

    update_record_activation(@service_category, name: translated_name(@service_category),
                                                fallback: admin_service_category_path(@service_category))
  end

  private

  def set_service_category
    @service_category = ServiceCategory.includes(:service_category_translations).find(params[:id])
  end

  def category_params
    @category_params ||= params.expect(service_category: [ :is_active,
                                                           translations: [ [ :language_id, :name, *TRANSLATION_FIELDS ] ] ])
  end

  def assign_category(category)
    category.is_active = category_params[:is_active] if category_params.key?(:is_active)
    assign_translations(category, category_params[:translations], fields: TRANSLATION_FIELDS)
  end

  def category_props(category)
    {
      id: category.id,
      name: translated_name(category),
      is_active: category.is_active,
      translations: translations_props(category, fields: TRANSLATION_FIELDS),
      created_at: category.created_at
    }
  end

  def service_summary_props(service)
    {
      id: service.id,
      name: translated_name(service),
      price: service.price.to_f,
      sale_price: service.sale_price&.to_f,
      is_active: service.is_active
    }
  end

  def form_props(category)
    {
      service_category: category.persisted? ? category_props(category) : nil,
      translations: translations_props(category, fields: TRANSLATION_FIELDS)
    }
  end
end
