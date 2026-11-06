# frozen_string_literal: true

# Shared by the header and footer editors, which save a whole list of links
# (Linkable records) in one request. Each submitted link is:
#
#   { id: 3 | nil, link_type: "page" | "route" | "url", page_id:, route_key:, url:,
#     open_in_new_tab:, is_active:, translations: { "<language_id>" => { label: "…" } } }
#
# The list order sets `position`. Include Admin::ContentTranslations as well.
module Admin::NavigationItems
  extend ActiveSupport::Concern

  private

  # Hash entries ("0" => {...}) or an array, as indifferent hashes in submitted order.
  def submitted_entries(raw)
    entries = raw.is_a?(Hash) ? raw.sort_by { |key, _| key.to_i }.map(&:last) : Array(raw)
    entries.select { |entry| entry.respond_to?(:to_h) }.map { |entry| entry.to_h.with_indifferent_access }
  end

  # The existing record an entry refers to, or a new one from the block.
  def find_or_build(records, entry)
    (entry[:id].present? && records.find { |record| record.id == entry[:id].to_i }) || yield
  end

  # Assigns a submitted link to a Linkable record.
  def assign_link(record, entry, position:)
    record.position = position
    record.is_active = cast_boolean(entry.fetch(:is_active, true))
    record.link_type = entry[:link_type].to_s
    record.page = entry[:page_id].present? ? pages_by_id[entry[:page_id].to_i] : nil
    record.route_key = entry[:route_key].presence
    record.url = entry[:url].to_s.strip.presence
    record.open_in_new_tab = cast_boolean(entry[:open_in_new_tab])
    assign_content_translations(record, entry[:translations] || {}, fields: %i[label])
  end

  def cast_boolean(value) = ActiveModel::Type::Boolean.new.cast(value) || false

  def pages_by_id
    @pages_by_id ||= Page.all.index_by(&:id)
  end

  # `{ "<language_id>" => { label: "…" } }` for every language, the shape the form posts back.
  def translation_values(record, fields)
    by_language = record.translations.reject(&:marked_for_destruction?).index_by(&:language_id)
    languages.to_h do |language|
      [ language.id, fields.to_h { |field| [ field, by_language[language.id]&.public_send(field).to_s ] } ]
    end
  end

  def link_props(record)
    {
      id: record.id,
      link_type: record.link_type,
      page_id: record.page_id,
      route_key: record.route_key.to_s,
      url: record.url.to_s,
      open_in_new_tab: record.open_in_new_tab,
      is_active: record.is_active,
      translations: translation_values(record, %i[label])
    }
  end

  # What the link form can point at.
  def link_options
    pages = Page.includes(:page_translations).order(:slug)
    {
      pages: pages.map { |page| { id: page.id, slug: page.slug, name: page.translation&.name || page.slug, is_active: page.is_active } },
      routes: Linkable::ROUTES.keys
    }
  end

  # `record`'s own errors (with translation errors keyed by language), under
  # `prefix` when given, leaving out errors bubbled up from the `nested` associations,
  # which are reported on the nested records themselves.
  def prefixed_errors(record, prefix = nil, nested: [])
    content_errors(record).each_with_object({}) do |(key, messages), errors|
      next if nested.any? { |name| key.to_s.start_with?(name.to_s) }

      errors[prefix ? :"#{prefix}.#{key}" : key.to_sym] = messages
    end
  end
end
