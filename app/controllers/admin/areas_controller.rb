# frozen_string_literal: true

# Service areas inside a city. Each area's `geofence` polygon is drawn on a map
# in the dashboard and posted as a GeoJSON Polygon string (Area#geofence_geojson=).
class Admin::AreasController < Admin::BaseController
  include Admin::Activation
  include Admin::Pagination
  include Admin::Translations

  after_action :verify_authorized

  before_action :set_area, only: %i[show edit update destroy activation]

  def index
    authorize Area

    scope = Area.search_name(params[:q]).with_status(params[:status])
    scope = scope.where(city_id: city_filter) if city_filter
    areas, pagination = paginate(scope.ordered_by_name)
    areas = areas.includes(:area_translations, city: :city_translations)

    render inertia: {
      areas: areas.map { |area| area_props(area) },
      cities: city_options,
      filters: { q: params[:q].presence, status: params[:status].presence, city_id: city_filter },
      pagination: pagination
    }
  end

  def show
    authorize @area

    render inertia: {
      area: area_props(@area).merge(addresses_count: @area.addresses.count),
      reference_areas: reference_areas(@area, city_only: true)
    }
  end

  def new
    area = Area.new(is_active: true, city_id: params[:city_id].presence&.to_i)
    authorize area

    render inertia: form_props(area)
  end

  def create
    area = Area.new
    authorize area
    assign_area(area)

    if area.save
      redirect_to admin_area_path(area), notice: "#{translated_name(area)} was created"
    else
      redirect_to new_admin_area_path(city_id: area.city_id), inertia: { errors: area.errors }
    end
  end

  def edit
    authorize @area, :update?

    render inertia: form_props(@area)
  end

  def update
    authorize @area
    assign_area(@area)

    if @area.save
      redirect_to admin_area_path(@area), notice: "#{translated_name(@area.reload)} was updated"
    else
      redirect_to edit_admin_area_path(@area), inertia: { errors: @area.errors }
    end
  end

  def destroy
    authorize @area

    if @area.destroy
      redirect_to admin_city_path(@area.city_id), notice: "#{translated_name(@area)} was deleted"
    else
      redirect_back_or_to admin_area_path(@area), alert: @area.errors.full_messages.to_sentence
    end
  end

  def activation
    authorize @area, :update?

    update_record_activation(@area, name: translated_name(@area), fallback: admin_area_path(@area))
  end

  private

  def set_area
    @area = Area.includes(:area_translations, city: :city_translations).find(params[:id])
  end

  def area_params
    @area_params ||= params.expect(area: [ :city_id, :rate, :is_active, :geofence,
                                           translations: [ [ :language_id, :name ] ] ])
  end

  def assign_area(area)
    area.assign_attributes(area_params.slice(:city_id, :rate, :is_active))
    area.geofence_geojson = area_params[:geofence] if area_params.key?(:geofence)
    assign_translations(area, area_params[:translations])
  end

  def city_filter
    @city_filter ||= params[:city_id].presence&.to_i
  end

  def city_options
    City.includes(:city_translations).ordered_by_name.map do |city|
      { id: city.id, name: translated_name(city), is_active: city.is_active }
    end
  end

  def area_props(area)
    {
      id: area.id,
      name: translated_name(area),
      rate: area.rate.to_f,
      is_active: area.is_active,
      geofence: area.geofence_geojson,
      translations: translations_props(area),
      city: { id: area.city.id, name: translated_name(area.city) },
      created_at: area.created_at
    }
  end

  # Other areas' polygons, drawn grey on the map so admins can avoid overlaps.
  def reference_areas(area, city_only: false)
    scope = Area.where.not(id: area.id).where.not(geofence: nil).includes(:area_translations)
    scope = scope.where(city_id: area.city_id) if city_only

    scope.map do |other|
      { id: other.id, name: translated_name(other), city_id: other.city_id, geofence: other.geofence_geojson }
    end
  end

  def form_props(area)
    {
      area: area.persisted? ? area_props(area) : nil,
      translations: translations_props(area),
      city_id: area.city_id,
      cities: city_options,
      reference_areas: reference_areas(area)
    }
  end
end
