# frozen_string_literal: true

# Add-ons customers can attach to a booking (e.g. air freshener). Names live in
# extra_translations. Extras that were booked can't be deleted, only disabled.
class Admin::ExtrasController < Admin::BaseController
  include Admin::Activation
  include Admin::Pagination
  include Admin::Translations

  after_action :verify_authorized

  before_action :set_extra, only: %i[show edit update destroy activation]

  def index
    authorize Extra

    scope = Extra.search_name(params[:q]).with_status(params[:status])
    extras, pagination = paginate(scope.ordered_by_name)
    extras = extras.includes(:extra_translations)

    render inertia: {
      extras: extras.map { |extra| extra_props(extra) },
      filters: { q: params[:q].presence, status: params[:status].presence },
      pagination: pagination
    }
  end

  def show
    authorize @extra

    render inertia: {
      extra: extra_props(@extra).merge(bookings_count: @extra.booking_items.distinct.count(:booking_id))
    }
  end

  def new
    extra = Extra.new(is_active: true)
    authorize extra

    render inertia: form_props(extra)
  end

  def create
    extra = Extra.new
    authorize extra
    assign_extra(extra)

    if extra.save
      redirect_to admin_extra_path(extra), notice: "#{translated_name(extra)} was created"
    else
      redirect_to new_admin_extra_path, inertia: { errors: extra.errors }
    end
  end

  def edit
    authorize @extra, :update?

    render inertia: form_props(@extra)
  end

  def update
    authorize @extra
    assign_extra(@extra)

    if @extra.save
      redirect_to admin_extra_path(@extra), notice: "#{translated_name(@extra.reload)} was updated"
    else
      redirect_to edit_admin_extra_path(@extra), inertia: { errors: @extra.errors }
    end
  end

  def destroy
    authorize @extra

    if @extra.destroy
      redirect_to admin_extras_path, notice: "#{translated_name(@extra)} was deleted"
    else
      redirect_back_or_to admin_extra_path(@extra), alert: @extra.errors.full_messages.to_sentence
    end
  end

  def activation
    authorize @extra, :update?

    update_record_activation(@extra, name: translated_name(@extra), fallback: admin_extra_path(@extra))
  end

  private

  def set_extra
    @extra = Extra.includes(:extra_translations).find(params[:id])
  end

  def extra_params
    @extra_params ||= params.expect(extra: [ :price, :is_active, translations: [ [ :language_id, :name ] ] ])
  end

  def assign_extra(extra)
    extra.assign_attributes(extra_params.slice(:price, :is_active))
    assign_translations(extra, extra_params[:translations])
  end

  def extra_props(extra)
    {
      id: extra.id,
      name: translated_name(extra),
      price: extra.price.to_f,
      is_active: extra.is_active,
      translations: translations_props(extra),
      created_at: extra.created_at
    }
  end

  def form_props(extra)
    { extra: extra.persisted? ? extra_props(extra) : nil, translations: translations_props(extra) }
  end
end
