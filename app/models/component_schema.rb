# frozen_string_literal: true

# The field schema of a Component (stored in `components.fields`) and the one
# place that validates and coerces section values against it.
#
#   [{ "key" => "heading", "label" => "Heading", "type" => "string", "translatable" => true, "required" => true },
#    { "key" => "items", "type" => "repeater", "fields" => [{ "key" => "title", "type" => "string", "translatable" => true }] }]
#
# A section's values are split by the `translatable` flag:
# - non-translatable values go to PageSection#settings
# - translatable values go to PageSectionTranslation#content, one per language
#
# Repeater items are joined across the two by a stable `_id`. Their order and
# non-translatable sub-fields are in `settings[key] = [{ "_id" => "a1", ... }]`,
# their text is in `content[key] = { "a1" => { "title" => "..." } }`. That way
# every language always shows the same items in the same order.
class ComponentSchema
  TYPES = %w[string text rich_text url image select number boolean repeater].freeze
  # Only text can differ per language; images, choices etc. are shared by all languages.
  TRANSLATABLE_TYPES = %w[string text rich_text url].freeze
  KEY_FORMAT = /\A[a-z][a-z0-9_]*\z/
  URL_FORMAT = %r{\A(https?://|/|mailto:|tel:|#)\S*\z}
  ITEM_ID = "_id"

  Field = Data.define(:key, :label, :type, :translatable, :required, :options, :fields) do
    def repeater? = type == "repeater"
    def translatable? = translatable && !repeater?
    def required? = required

    def as_json(*)
      { key:, label:, type:, translatable:, required:, options:, fields: fields.map(&:as_json) }
    end
  end

  attr_reader :fields

  # Normalizes raw JSON (string or symbol keys, string booleans) into Fields.
  # Invalid entries are kept as far as possible so #errors can report them.
  def self.normalize(raw)
    Array(raw).filter_map do |entry|
      next unless entry.respond_to?(:to_h)

      entry = entry.to_h.stringify_keys
      type = entry["type"].to_s
      repeater = type == "repeater"
      boolean = ActiveModel::Type::Boolean.new

      {
        "key" => entry["key"].to_s.strip,
        "label" => entry["label"].to_s.strip.presence || entry["key"].to_s.strip.humanize,
        "type" => type,
        "translatable" => TRANSLATABLE_TYPES.include?(type) && (boolean.cast(entry["translatable"]) || false),
        "required" => boolean.cast(entry["required"]) || false,
        "options" => type == "select" ? Array(entry["options"]).map { |o| o.to_s.strip }.compact_blank.uniq : [],
        "fields" => repeater ? normalize(entry["fields"]) : []
      }
    end
  end

  def initialize(raw)
    @fields = build(self.class.normalize(raw))
  end

  def as_json(*) = fields.map(&:as_json)

  def translatable? = fields.any? { |f| f.translatable? || (f.repeater? && f.fields.any?(&:translatable?)) }

  # Human-readable problems with the schema itself.
  def errors
    collect_errors(fields, nested: false)
  end

  # `"key" => type` for every field, with repeater sub-fields as "items.title".
  def types_by_path(list = fields, prefix = nil)
    list.each_with_object({}) do |field, types|
      path = [ prefix, field.key ].compact.join(".")
      types[path] = field.type
      types.merge!(types_by_path(field.fields, path)) if field.repeater?
    end
  end

  # Keeps only the schema's non-translatable values, coerced by type.
  def clean_settings(raw)
    raw = hash(raw)
    fields.reject(&:translatable?).each_with_object({}) do |field, clean|
      value = field.repeater? ? clean_items(field, raw[field.key]) : coerce(field, raw[field.key])
      clean[field.key] = value unless value.nil?
    end
  end

  # Keeps only the schema's translatable values, coerced by type. Repeater
  # text is kept only for items that exist in `settings`.
  def clean_content(raw, settings)
    raw = hash(raw)
    fields.each_with_object({}) do |field, clean|
      if field.repeater?
        texts = clean_item_texts(field, raw[field.key], Array(settings[field.key]))
        clean[field.key] = texts if texts.present?
      elsif field.translatable?
        value = coerce(field, raw[field.key])
        clean[field.key] = value unless value.nil?
      end
    end
  end

  # Messages for missing or invalid values, keyed by field path. `content` is
  # the default language's, or nil to skip translatable checks.
  def value_errors(settings, content)
    errors = Hash.new { |h, k| h[k] = [] }
    fields.each do |field|
      if field.repeater?
        items = Array(settings[field.key])
        errors[field.key] << "needs at least one item" if field.required? && items.empty?
        items.each_with_index do |item, index|
          texts = hash(content && hash(content[field.key])[item[ITEM_ID]])
          field.fields.each do |sub|
            next if sub.translatable? && content.nil?

            check(errors, "#{field.key}.#{index}.#{sub.key}", sub, sub.translatable? ? texts[sub.key] : item[sub.key])
          end
        end
      elsif field.translatable?
        check(errors, field.key, field, content[field.key]) unless content.nil?
      else
        check(errors, field.key, field, settings[field.key])
      end
    end
    errors
  end

  # Format checks that apply to any language's content (e.g. a translatable url).
  def content_format_errors(content)
    errors = Hash.new { |h, k| h[k] = [] }
    fields.select { |f| f.translatable? && f.type == "url" }.each do |field|
      check(errors, field.key, field.with(required: false), content[field.key])
    end
    errors
  end

  # Every image signed id referenced by `settings`, including in repeaters.
  def image_values(settings)
    fields.flat_map do |field|
      if field.repeater?
        images = field.fields.select { |s| s.type == "image" }
        Array(settings[field.key]).flat_map { |item| images.map { |s| item[s.key] } }
      elsif field.type == "image"
        [ settings[field.key] ]
      else
        []
      end
    end.compact
  end

  private

  def build(entries)
    entries.map do |entry|
      Field.new(
        key: entry["key"], label: entry["label"], type: entry["type"],
        translatable: entry["translatable"], required: entry["required"],
        options: entry["options"], fields: build(entry["fields"])
      )
    end
  end

  def collect_errors(list, nested:)
    messages = []
    keys = list.map(&:key)
    keys.select { |k| keys.count(k) > 1 }.uniq.each { |k| messages << "key \"#{k}\" is used more than once" }

    list.each do |field|
      name = field.key.presence || "(blank)"
      messages << "key \"#{name}\" must start with a letter and use only a-z, 0-9 and _" unless field.key.match?(KEY_FORMAT)
      messages << "key \"#{name}\" is reserved" if field.key == ITEM_ID
      messages << "\"#{name}\" has an unknown type \"#{field.type}\"" unless TYPES.include?(field.type)
      messages << "\"#{name}\" needs at least one option" if field.type == "select" && field.options.empty?
      next unless field.repeater?

      if nested
        messages << "\"#{name}\" can't be a list inside a list"
      elsif field.fields.empty?
        messages << "list \"#{name}\" needs at least one field"
      else
        messages.concat(collect_errors(field.fields, nested: true).map { |m| "in list \"#{name}\": #{m}" })
      end
    end
    messages
  end

  def clean_items(field, raw)
    items = raw.is_a?(Hash) ? raw.values : Array(raw)
    items.filter_map do |item|
      item = hash(item)
      id = item[ITEM_ID].to_s.presence || SecureRandom.alphanumeric(10)
      field.fields.reject(&:translatable?).each_with_object({ ITEM_ID => id }) do |sub, clean|
        value = coerce(sub, item[sub.key])
        clean[sub.key] = value unless value.nil?
      end
    end
  end

  def clean_item_texts(field, raw, items)
    raw = hash(raw)
    translatable = field.fields.select(&:translatable?)
    items.each_with_object({}) do |item, clean|
      texts = hash(raw[item[ITEM_ID]])
      values = translatable.each_with_object({}) do |sub, out|
        value = coerce(sub, texts[sub.key])
        out[sub.key] = value unless value.nil?
      end
      clean[item[ITEM_ID]] = values if values.present?
    end
  end

  # Coerces a submitted value to its field type; nil means "no value".
  def coerce(field, value)
    return nil if value.nil?

    case field.type
    when "string", "text", "url" then value.to_s.strip.presence
    when "rich_text" then HtmlSanitizer.sanitize(value.to_s).presence
    when "image" then value.to_s.strip.presence
    when "select" then field.options.include?(value.to_s) ? value.to_s : nil
    when "number" then value.to_s.strip.empty? ? nil : (Float(value.to_s, exception: false)&.then { |n| n % 1 == 0 ? n.to_i : n })
    when "boolean" then ActiveModel::Type::Boolean.new.cast(value) || false
    end
  end

  def check(errors, path, field, value)
    if blank_value?(value)
      errors[path] << "can't be blank" if field.required?
    elsif field.type == "url" && !value.to_s.match?(URL_FORMAT)
      errors[path] << "must be a URL starting with https://, http:// or /"
    end
  end

  def blank_value?(value) = value.nil? || value == "" || value == []

  def hash(value)
    value = value.to_unsafe_h if value.respond_to?(:to_unsafe_h)
    value.is_a?(Hash) ? value.stringify_keys : {}
  end
end
