# frozen_string_literal: true

# Bookable services, each in a ServiceCategory. Names and SEO text live in
# service_translations. Services that were booked can't be deleted, only disabled.
class Admin::ServicesController < Admin::BaseController
  include Admin::Activation
  include Admin::Images
  include Admin::Pagination
  include Admin::Translations

  TRANSLATION_FIELDS = %i[seo_title seo_description].freeze

  after_action :verify_authorized

  before_action :set_service, only: %i[show edit update destroy activation]

  def index
    authorize Service

    scope = Service.search_name(params[:q]).with_status(params[:status])
    scope = scope.where(service_category_id: category_filter) if category_filter
    services, pagination = paginate(scope.ordered_by_name)
    services = services.includes(:service_translations, image_attachment: :blob, service_category: :service_category_translations)

    render inertia: {
      services: services.map { |service| service_props(service) },
      categories: category_options,
      filters: { q: params[:q].presence, status: params[:status].presence, service_category_id: category_filter },
      pagination: pagination
    }
  end

  def show
    authorize @service

    render inertia: {
      service: service_props(@service).merge(bookings_count: @service.booking_items.distinct.count(:booking_id))
    }
  end

  def new
    service = Service.new(is_active: true, service_category_id: params[:service_category_id].presence&.to_i)
    authorize service

    render inertia: form_props(service)
  end

  def create
    service = Service.new
    authorize service
    assign_service(service)

    if service.save
      redirect_to admin_service_path(service), notice: "#{translated_name(service)} was created"
    else
      redirect_to new_admin_service_path(service_category_id: service.service_category_id),
        inertia: { errors: service.errors }
    end
  end

  def edit
    authorize @service, :update?

    render inertia: form_props(@service)
  end

  def update
    authorize @service
    assign_service(@service)

    if @service.save
      redirect_to admin_service_path(@service), notice: "#{translated_name(@service.reload)} was updated"
    else
      redirect_to edit_admin_service_path(@service), inertia: { errors: @service.errors }
    end
  end

  def destroy
    authorize @service

    if @service.destroy
      redirect_to admin_service_category_path(@service.service_category_id),
        notice: "#{translated_name(@service)} was deleted"
    else
      redirect_back_or_to admin_service_path(@service), alert: @service.errors.full_messages.to_sentence
    end
  end

  def activation
    authorize @service, :update?

    update_record_activation(@service, name: translated_name(@service), fallback: admin_service_path(@service))
  end

  private

  def set_service
    @service = Service.includes(:service_translations, image_attachment: :blob, service_category: :service_category_translations)
      .find(params[:id])
  end

  def service_params
    @service_params ||= params.expect(service: [ :service_category_id, :price, :sale_price, :is_active, :display_in_home_page, :image,
                                                 translations: [ [ :language_id, :name, *TRANSLATION_FIELDS ] ] ])
  end

  def assign_service(service)
    service.assign_attributes(service_params.slice(:service_category_id, :price, :is_active, :display_in_home_page))
    assign_image(service, :image, service_params[:image]) if service_params.key?(:image)
    # A blank sale price means "no sale", not 0.
    service.sale_price = service_params[:sale_price].presence if service_params.key?(:sale_price)
    assign_translations(service, service_params[:translations], fields: TRANSLATION_FIELDS)
  end

  def category_filter
    @category_filter ||= params[:service_category_id].presence&.to_i
  end

  def category_options
    ServiceCategory.includes(:service_category_translations).ordered_by_name.map do |category|
      { id: category.id, name: translated_name(category), is_active: category.is_active }
    end
  end

  def service_props(service)
    {
      id: service.id,
      name: translated_name(service),
      price: service.price.to_f,
      sale_price: service.sale_price&.to_f,
      is_active: service.is_active,
      display_in_home_page: service.display_in_home_page,
      image: image_prop(service.image),
      translations: translations_props(service, fields: TRANSLATION_FIELDS),
      service_category: { id: service.service_category.id, name: translated_name(service.service_category) },
      created_at: service.created_at
    }
  end

  def form_props(service)
    {
      service: service.persisted? ? service_props(service) : nil,
      translations: translations_props(service, fields: TRANSLATION_FIELDS),
      service_category_id: service.service_category_id,
      categories: category_options
    }
  end
end
