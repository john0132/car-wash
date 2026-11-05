# frozen_string_literal: true

# Include in any model that can own Media records. Overrides polymorphic_name
# so Media#attachable_type stores the short code from Media::TYPE_MAP instead
# of this class's full Ruby name.
module Attachable
  extend ActiveSupport::Concern

  included do
    has_many :media, as: :attachable, class_name: "Media", dependent: :destroy
  end

  class_methods do
    def polymorphic_name
      Media::TYPE_MAP[name] || super
    end
  end
end
