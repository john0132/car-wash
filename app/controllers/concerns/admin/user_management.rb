# frozen_string_literal: true

# Shared by the admin dashboard's customer, administrator and employee screens:
# list filtering (`q`, `status`), page-number pagination, the enable/disable
# response, and the JSON shapes the pages in app/javascript/admin/features expect.
module Admin::UserManagement
  extend ActiveSupport::Concern

  PER_PAGE = 20

  included do
    after_action :verify_authorized
  end

  private

  def authorize_kind(kind, action)
    authorize kind, action, policy_class: UserPolicy
  end

  def filtered_users(kind)
    User.public_send(kind).search(params[:q]).with_status(params[:status])
  end

  def list_filters
    { q: params[:q].presence, status: params[:status].presence }
  end

  # Returns [records, pagination] for page `params[page_param]`. Pass `total`
  # when it is already known, to skip the COUNT query.
  def paginate(scope, total: nil, page_param: :page, per_page: PER_PAGE)
    total ||= scope.count(:all)
    pages = [ (total.to_f / per_page).ceil, 1 ].max
    page = params[page_param].to_i.clamp(1, pages)

    [ scope.limit(per_page).offset((page - 1) * per_page), { page: page, pages: pages, total: total } ]
  end

  # PATCH …/:id/activation with `is_active`. Authorize before calling.
  def update_activation(user, fallback:)
    if user.update(is_active: ActiveModel::Type::Boolean.new.cast(params.fetch(:is_active)))
      redirect_back_or_to fallback, notice: "#{user.full_name} was #{user.is_active? ? 'enabled' : 'disabled'}"
    else
      redirect_back_or_to fallback, alert: user.errors.full_messages.to_sentence
    end
  end

  # Everything booking_props reads, newest first.
  def bookings_for_table(scope)
    scope.includes(:booking_address, :booking_items, :user, :employee).newest_first
  end

  def user_props(user)
    user.as_json(only: %i[id name last_name email verified is_active created_at])
      .merge(full_name: user.full_name)
  end

  def booking_props(booking)
    {
      id: booking.id,
      status: booking.status,
      payment_status: booking.payment_status,
      total_amount: booking.total_amount.to_f,
      items_count: booking.booking_items.sum(&:quantity),
      scheduled_at: booking.scheduled_at,
      created_at: booking.created_at,
      address: booking.booking_address&.then { |a| "#{a.name}, #{a.area_name}" },
      customer: booking.user && { id: booking.user.id, full_name: booking.user.full_name },
      employee: booking.employee && { id: booking.employee.id, full_name: booking.employee.full_name }
    }
  end
end
