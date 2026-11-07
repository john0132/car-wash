# frozen_string_literal: true

# What the public website's header and footer show, shared with every website
# page as the `site` Inertia prop (see Website::BaseController). Text falls
# back per field: the locale, then the default locale, then any language.
#
#   { header: { items: [{ id:, label:, href:, external:, children: [same, nested to any depth] }] },
#     footer: { title:, description:, image: { url: } | nil, socials: [{ id:, name:, url:, icon: }],
#               columns: [{ id:, title:, items: [{ id:, label:, href:, external: }] }] } | nil }
#
# Cached per locale. The key moves whenever a dashboard edit changes anything
# in it, including a page being renamed or disabled.
class SiteChrome
  def self.props(locale = I18n.locale)
    Rails.cache.fetch([ "site_chrome", locale.to_s, cache_version ]) { new(locale).props }
  end

  # Everything the header and footer read: an edit to any of these changes the cache key.
  VERSIONED_MODELS = [ HeaderItem, Footer, Page, Language, ServiceCategory, Service ].freeze

  # One query for all of them: each table's row count (deletions don't move the
  # newest timestamp) and newest `updated_at`, read as text so the microseconds
  # survive (Time#to_param in a cache key is only accurate to the second, so two
  # edits in one second would look the same).
  def self.cache_version
    columns = VERSIONED_MODELS.flat_map do |model|
      table = model.quoted_table_name
      [ "(SELECT COUNT(*) FROM #{table})", "(SELECT MAX(updated_at)::text FROM #{table})" ]
    end

    ApplicationRecord.connection.select_rows("SELECT #{columns.join(', ')}").first
  end

  def initialize(locale)
    @locale = locale
  end

  def props
    { header: { items: header_tree(nil) }, footer: footer_props }
  end

  private

  attr_reader :locale

  def header_items_by_parent
    @header_items_by_parent ||= HeaderItem.active.ordered
      .includes(:header_item_translations, :page, service_category: :service_category_translations, service: :service_category)
      .group_by(&:parent_id)
  end

  # The links under `parent_id` (top level when nil). An item under a hidden or
  # unresolvable parent never shows, since the walk only descends from shown items.
  def header_tree(parent_id)
    link_props(header_items_by_parent.fetch(parent_id, [])).map do |link|
      link.merge(children: header_tree(link[:id]))
    end
  end

  def footer_props
    footer = Footer.includes(
      :footer_translations, :footer_social_links, image_attachment: :blob,
      footer_columns: [ :footer_column_translations, { footer_items: [ :footer_item_translations, :page, :service_category, { service: :service_category } ] } ]
    ).first
    return nil unless footer

    {
      title: footer.translated(:title, locale),
      description: footer.translated(:description, locale),
      image: image_prop(footer.image),
      socials: footer.footer_social_links.select(&:is_active?).map { |link|
        { id: link.id, name: link.name, url: link.url, icon: image_prop(link.icon) }
      },
      columns: footer.footer_columns.select(&:is_active?).map { |column|
        { id: column.id, title: column.translated(:title, locale), items: link_props(column.footer_items.select(&:is_active?)) }
      }
    }
  end

  # Links that resolve to an address, in position order.
  def link_props(items)
    items.sort_by { |item| [ item.position, item.id ] }.filter_map do |item|
      href = item.href
      next unless href

      { id: item.id, label: item.translated(:label, locale), href: href, external: item.external? || item.open_in_new_tab? }
    end
  end

  def image_prop(attachment)
    return nil unless attachment.attached?

    { url: Rails.application.routes.url_helpers.rails_blob_path(attachment.blob, only_path: true) }
  end
end
