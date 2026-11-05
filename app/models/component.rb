# frozen_string_literal: true

# A page component type staff define in the dashboard (hero, CTA, testimonials…):
# a `key` the website renders by, and a field schema (see ComponentSchema).
# Pages use components through PageSection.
class Component < ApplicationRecord
  include Activatable
  include Translatable

  KEY_FORMAT = /\A[a-z][a-z0-9_]*\z/

  has_many :component_translations, dependent: :destroy, autosave: true
  has_many :page_sections, dependent: :restrict_with_error

  requires_default_translation

  before_validation :normalize_fields

  validates :key, presence: true, uniqueness: true,
    format: { with: KEY_FORMAT, message: "must start with a letter and use only a-z, 0-9 and _" }
  validate :schema_is_valid
  validate :used_schema_is_compatible, if: :in_use?

  def schema
    @schema = nil if @schema_source != fields
    @schema_source = fields
    @schema ||= ComponentSchema.new(fields)
  end

  def in_use?
    persisted? && page_sections.exists?
  end

  # Field paths ("heading", "items.title") whose type and translation flag are
  # locked because pages already store values for them.
  def locked_field_paths
    in_use? ? ComponentSchema.new(fields_in_database).types_by_path.keys : []
  end

  private

  def normalize_fields
    self.fields = ComponentSchema.normalize(fields)
  end

  def schema_is_valid
    errors.add(:fields, "must have at least one field") if Array(fields).empty?
    schema.errors.each { |message| errors.add(:fields, message) }
  end

  # Once sections use this component, the website may render it by `key`, and
  # stored values depend on each field's type and whether it is translatable.
  # Fields can still be added, removed or relabelled.
  def used_schema_is_compatible
    errors.add(:key, "can't be changed while pages use this component") if key_changed?
    return unless fields_changed?

    before = signatures(ComponentSchema.new(fields_in_database).fields)
    signatures(schema.fields).each do |path, signature|
      next unless before.key?(path) && before[path] != signature

      errors.add(:fields, "\"#{path}\" can't change type or translation while pages use this component")
    end
  end

  def signatures(list, prefix = nil)
    list.each_with_object({}) do |field, out|
      path = [ prefix, field.key ].compact.join(".")
      out[path] = [ field.type, field.translatable? ]
      out.merge!(signatures(field.fields, path)) if field.repeater?
    end
  end
end
