# frozen_string_literal: true

class Media < ApplicationRecord
  # Maps attachable classes to short, storage-stable codes so attachable_type
  # never stores a full (and namespace-/rename-fragile) Ruby class name.
  TYPE_MAP = {
    "Page" => "page",
    "Blog" => "blog",
    "Package" => "package"
  }.freeze

  belongs_to :attachable, polymorphic: true

  validates :name, :file_name, :extension, :content_type, :url, presence: true
  validates :collection_name, presence: true
  validates :byte_size, numericality: { greater_than: 0 }

  def self.polymorphic_class_for(name)
    TYPE_MAP.key(name)&.constantize || super
  end
end
