# frozen_string_literal: true

# `PATCH …/:id/activation` with `is_active` for records that aren't users
# (users have Admin::UserManagement#update_activation). Authorize before calling.
module Admin::Activation
  extend ActiveSupport::Concern

  private

  def update_record_activation(record, name:, fallback:)
    if record.update(is_active: ActiveModel::Type::Boolean.new.cast(params.fetch(:is_active)))
      redirect_back_or_to fallback, notice: "#{name} was #{record.is_active? ? 'enabled' : 'disabled'}"
    else
      redirect_back_or_to fallback, alert: record.errors.full_messages.to_sentence
    end
  end
end
