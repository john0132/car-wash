# frozen_string_literal: true

# What the public website's header and footer show, shared with every website
# page as the `site` Inertia prop (see Website::BaseController). Text falls
# back per field: the locale, then the default locale, then any language.
#
#   { header: { items: [{ id:, label:, href:, external: }] },
#     footer: { title:, description:, image: { url: } | nil, socials: [{ id:, name:, url:, icon: }],
#               columns: [{ id:, title:, items: [{ id:, label:, href:, external: }] }] } | nil }
#
# Cached per locale. The key moves whenever a dashboard edit changes anything
# in it, including a page being renamed or disabled.
class SiteChrome
  def self.props(locale = I18n.locale)
    Rails.cache.fetch([ "site_chrome", locale.to_s, cache_version ]) { new(locale).props }
  end

  def self.cache_version
    [ HeaderItem, Footer, Page, Language ].map { |model| version_of(model) }
  end

  # Row count (deletions don't move the newest timestamp) and the newest
  # `updated_at`, to the microsecond: Time#to_param in a cache key is only
  # accurate to the second, so two edits in one second would look the same.
  def self.version_of(model)
    count, newest = model.pick(Arel.sql("COUNT(*)"), Arel.sql("MAX(updated_at)"))
    [ count, newest&.utc&.to_fs(:usec) ]
  end

  def initialize(locale)
    @locale = locale
  end

  def props
    { header: { items: link_props(header_items) }, footer: footer_props }
  end

  private

  attr_reader :locale

  def header_items
    HeaderItem.active.ordered.includes(:header_item_translations, :page)
  end

  def footer_props
    footer = Footer.includes(
      :footer_translations, :footer_social_links, image_attachment: :blob,
      footer_columns: [ :footer_column_translations, { footer_items: %i[footer_item_translations page] } ]
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
