# frozen_string_literal: true

# One link inside a footer column. Same target options as HeaderItem (Linkable).
class FooterItem < ApplicationRecord
  include Linkable

  belongs_to :footer_column, touch: true
  has_many :footer_item_translations, dependent: :destroy, autosave: true

  requires_default_translation :label
end
