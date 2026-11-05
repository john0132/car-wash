# frozen_string_literal: true

# Short, storage-stable codes for models that appear as the `_type` side of a
# polymorphic column (BookingItem#itemable_type), so a stored value survives
# a class rename/namespace move.
module PolymorphicTypeCode
  extend ActiveSupport::Concern

  TYPE_MAP = {
    "Package" => "package",
    "Service" => "service",
    "Extra" => "extra"
  }.freeze

  class_methods do
    def polymorphic_name
      TYPE_MAP[name] || super
    end
  end

  def self.class_for(code)
    TYPE_MAP.key(code)&.constantize
  end
end
