# frozen_string_literal: true

# Models with an `is_active` flag that the dashboard can enable/disable and filter on.
module Activatable
  extend ActiveSupport::Concern

  included do
    # "active" / "inactive" filter from the dashboard lists; anything else means all.
    scope :with_status, ->(status) {
      case status
      when "active" then where(is_active: true)
      when "inactive" then where(is_active: false)
      else all
      end
    }
  end
end
