# frozen_string_literal: true

# Customer loyalty tiers. Names and descriptions live in membership_translations
# (one per Language); tiers are disabled rather than deleted because customers reference them.
class Admin::MembershipsController < Admin::BaseController
  include Admin::ContentTranslations

  RECENT_CUSTOMERS = 10
  TRANSLATION_FIELDS = %i[name description].freeze

  after_action :verify_authorized

  before_action :set_membership, only: %i[show edit update activation]

  def index
    authorize Membership

    memberships = Membership.includes(:membership_translations).order(:id).to_a
    counts = User.customer.where(membership_id: memberships.map(&:id)).group(:membership_id).count

    render inertia: {
      memberships: memberships.map { |m| membership_props(m).merge(customers_count: counts.fetch(m.id, 0)) },
      stats: {
        total: memberships.size,
        active: memberships.count(&:is_active?),
        members: counts.values.sum
      }
    }
  end

  def show
    authorize @membership

    customers = User.customer.where(membership: @membership)

    render inertia: {
      membership: membership_props(@membership).merge(
        created_at: @membership.created_at,
        updated_at: @membership.updated_at
      ),
      translations: content_translations_props(@membership, fields: TRANSLATION_FIELDS),
      stats: {
        customers_count: customers.count,
        active_customers_count: customers.where(is_active: true).count,
        points: customers.sum(:points),
        lifetime_points: customers.sum(:lifetime_points)
      },
      customers: customers.order(lifetime_points: :desc).limit(RECENT_CUSTOMERS).map { |customer|
        { id: customer.id, full_name: customer.full_name, email: customer.email,
          points: customer.points, lifetime_points: customer.lifetime_points, is_active: customer.is_active }
      }
    }
  end

  def new
    authorize Membership
    render inertia: form_props(Membership.new(is_active: true, egp_to_points: 1, points_to_egp: 0.1,
                                              background_color: "#1F2937", text_color: "#F9FAFB"))
  end

  def create
    authorize Membership
    membership = Membership.new

    if save(membership)
      redirect_to admin_membership_path(membership), notice: "#{display_name(membership)} was created"
    else
      redirect_to new_admin_membership_path, inertia: { errors: content_errors(membership) }
    end
  end

  def edit
    authorize @membership, :update?
    render inertia: form_props(@membership)
  end

  def update
    authorize @membership

    if save(@membership)
      redirect_to admin_membership_path(@membership), notice: "#{display_name(@membership)} was updated"
    else
      redirect_to edit_admin_membership_path(@membership), inertia: { errors: content_errors(@membership) }
    end
  end

  def activation
    authorize @membership, :update?

    if @membership.update(is_active: ActiveModel::Type::Boolean.new.cast(params.fetch(:is_active)))
      redirect_back_or_to admin_membership_path(@membership),
        notice: "#{display_name(@membership)} was #{@membership.is_active? ? 'enabled' : 'disabled'}"
    else
      redirect_back_or_to admin_membership_path(@membership), alert: @membership.errors.full_messages.to_sentence
    end
  end

  private

  def set_membership
    @membership = Membership.includes(:membership_translations).find(params[:id])
  end

  def membership_params
    params.expect(membership: %i[is_active egp_to_points points_to_egp background_color text_color])
  end

  def save(membership)
    membership.assign_attributes(membership_params)
    membership.background_color = hex(membership.background_color)
    membership.text_color = hex(membership.text_color)
    assign_content_translations(membership, submitted_translations(:membership), fields: TRANSLATION_FIELDS)
    membership.save
  end

  def hex(color)
    color = color.to_s.strip
    color.empty? || color.start_with?("#") ? color : "##{color}"
  end

  def display_name(membership)
    membership.membership_translations.reload
    membership.translation&.name || "Membership ##{membership.id}"
  end

  def membership_props(membership)
    {
      id: membership.id,
      name: membership.translation&.name,
      description: membership.translation&.description,
      is_active: membership.is_active,
      egp_to_points: membership.egp_to_points.to_f,
      points_to_egp: membership.points_to_egp.to_f,
      background_color: membership.background_color,
      text_color: membership.text_color
    }
  end

  def form_props(membership)
    {
      membership: membership_props(membership),
      translations: content_translations_props(membership, fields: TRANSLATION_FIELDS),
      languages: languages_props
    }
  end
end
