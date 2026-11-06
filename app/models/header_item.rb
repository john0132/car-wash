# frozen_string_literal: true

# One link in the website header. Items form a tree of any depth: top-level
# items have no parent and nested ones are the entries of their parent's
# dropdown. `position` orders siblings. The label is translated
# (header_item_translations); the target is described by Linkable.
class HeaderItem < ApplicationRecord
  include Linkable

  belongs_to :parent, class_name: "HeaderItem", optional: true, inverse_of: :children
  has_many :children, class_name: "HeaderItem", foreign_key: :parent_id, dependent: :destroy, inverse_of: :parent
  has_many :header_item_translations, dependent: :destroy, autosave: true

  requires_default_translation :label

  validate :parent_is_not_self_or_descendant

  scope :top_level, -> { where(parent_id: nil) }

  private

  def parent_is_not_self_or_descendant
    ancestor = parent
    seen = []
    while ancestor
      if ancestor.equal?(self) || (id && ancestor.id == id)
        errors.add(:parent, "can't be the item itself or one of its children")
        return
      end
      return if seen.include?(ancestor.id) && ancestor.id

      seen << ancestor.id
      ancestor = ancestor.parent
    end
  end
end
