# frozen_string_literal: true

# Page component types staff define: a `key` the website renders by and a field
# schema (see ComponentSchema). Components used by pages can't be deleted, and
# their key and field types are locked (Component#used_schema_is_compatible).
class Admin::ComponentsController < Admin::BaseController
  include Admin::Activation
  include Admin::Pagination
  include Admin::ContentTranslations
  include Admin::ComponentOptions

  TRANSLATION_FIELDS = %i[name description].freeze

  after_action :verify_authorized

  before_action :set_component, only: %i[edit update destroy activation]

  def index
    authorize Component

    scope = Component.search_name(params[:q]).with_status(params[:status])
    components, pagination = paginate(scope.ordered_by_name)
    components = components.includes(:component_translations)
    usage = PageSection.where(component_id: components.map(&:id)).group(:component_id).distinct.count(:page_id)

    render inertia: {
      components: components.map { |c|
        component_option(c).except(:fields).merge(fields_count: c.schema.fields.size, pages_count: usage.fetch(c.id, 0))
      },
      filters: { q: params[:q].presence, status: params[:status].presence },
      pagination: pagination
    }
  end

  def new
    component = Component.new(is_active: true, fields: [])
    authorize component
    render inertia: form_props(component)
  end

  def create
    component = Component.new
    authorize component

    if save(component)
      redirect_to edit_admin_component_path(component), notice: "#{display_name(component)} was created"
    else
      redirect_to new_admin_component_path, inertia: { errors: content_errors(component) }
    end
  end

  def edit
    authorize @component, :update?
    render inertia: form_props(@component)
  end

  def update
    authorize @component

    if save(@component)
      redirect_to edit_admin_component_path(@component), notice: "#{display_name(@component)} was updated"
    else
      redirect_to edit_admin_component_path(@component), inertia: { errors: content_errors(@component) }
    end
  end

  def destroy
    authorize @component

    if @component.destroy
      redirect_to admin_components_path, notice: "#{display_name(@component)} was deleted"
    else
      redirect_back_or_to edit_admin_component_path(@component),
        alert: "#{display_name(@component)} is used on pages; remove it from them or disable it instead"
    end
  end

  def activation
    authorize @component, :update?
    update_record_activation(@component, name: display_name(@component), fallback: admin_components_path)
  end

  private

  def set_component
    @component = Component.includes(:component_translations).find(params[:id])
  end

  def save(component)
    raw = params.to_unsafe_h[:component] || {}
    component.key = raw[:key].to_s.strip.downcase if raw.key?(:key)
    component.is_active = ActiveModel::Type::Boolean.new.cast(raw[:is_active]) if raw.key?(:is_active)
    component.fields = Array(raw[:fields].is_a?(Hash) ? raw[:fields].values : raw[:fields])
    assign_content_translations(component, raw[:translations] || {}, fields: TRANSLATION_FIELDS)
    component.save
  end

  def display_name(component)
    component.translation&.name || component.key.presence || "Component"
  end

  def form_props(component)
    {
      component: component_option(component).merge(
        id: component.id,
        key: component.key.to_s,
        in_use: component.in_use?,
        locked_fields: component.locked_field_paths
      ),
      translations: content_translations_props(component, fields: TRANSLATION_FIELDS),
      languages: languages_props
    }
  end
end
