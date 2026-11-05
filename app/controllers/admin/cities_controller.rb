# frozen_string_literal: true

# Cities group the service areas. A city can only be deleted once it has no areas.
class Admin::CitiesController < Admin::BaseController
  include Admin::Activation
  include Admin::Pagination
  include Admin::Translations

  after_action :verify_authorized

  before_action :set_city, only: %i[show edit update destroy activation]

  def index
    authorize City

    scope = City.search_name(params[:q]).with_status(params[:status])
    cities, pagination = paginate(scope.ordered_by_name)
    cities = cities.includes(:city_translations)
    areas_counts = Area.where(city_id: cities.map(&:id)).group(:city_id).count

    render inertia: {
      cities: cities.map { |city| city_props(city).merge(areas_count: areas_counts.fetch(city.id, 0)) },
      filters: { q: params[:q].presence, status: params[:status].presence },
      pagination: pagination
    }
  end

  def show
    authorize @city

    areas = @city.areas.includes(:area_translations).ordered_by_name

    render inertia: {
      city: city_props(@city),
      areas: areas.map { |area| area_summary_props(area) }
    }
  end

  def new
    city = City.new(is_active: true)
    authorize city

    render inertia: form_props(city)
  end

  def create
    city = City.new(is_active: city_params[:is_active])
    authorize city
    assign_translations(city, city_params[:translations])

    if city.save
      redirect_to admin_city_path(city), notice: "#{translated_name(city)} was created"
    else
      redirect_to new_admin_city_path, inertia: { errors: city.errors }
    end
  end

  def edit
    authorize @city, :update?

    render inertia: form_props(@city)
  end

  def update
    authorize @city
    @city.is_active = city_params[:is_active] if city_params.key?(:is_active)
    assign_translations(@city, city_params[:translations])

    if @city.save
      redirect_to admin_city_path(@city), notice: "#{translated_name(@city.reload)} was updated"
    else
      redirect_to edit_admin_city_path(@city), inertia: { errors: @city.errors }
    end
  end

  def destroy
    authorize @city

    if @city.destroy
      redirect_to admin_cities_path, notice: "#{translated_name(@city)} was deleted"
    else
      redirect_back_or_to admin_city_path(@city), alert: @city.errors.full_messages.to_sentence
    end
  end

  def activation
    authorize @city, :update?

    update_record_activation(@city, name: translated_name(@city), fallback: admin_city_path(@city))
  end

  private

  def set_city
    @city = City.includes(:city_translations).find(params[:id])
  end

  def city_params
    @city_params ||= params.expect(city: [ :is_active, translations: [ [ :language_id, :name ] ] ])
  end

  def city_props(city)
    {
      id: city.id,
      name: translated_name(city),
      is_active: city.is_active,
      translations: translations_props(city),
      created_at: city.created_at
    }
  end

  def area_summary_props(area)
    {
      id: area.id,
      name: translated_name(area),
      rate: area.rate.to_f,
      is_active: area.is_active,
      geofence: area.geofence_geojson
    }
  end

  def form_props(city)
    { city: city.persisted? ? city_props(city) : nil, translations: translations_props(city) }
  end
end
