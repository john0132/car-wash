# frozen_string_literal: true

# One link in the website header, shown in `position` order. The label is
# translated (header_item_translations); the target is described by Linkable.
class HeaderItem < ApplicationRecord
  include Linkable

  has_many :header_item_translations, dependent: :destroy, autosave: true

  requires_default_translation :label
end
