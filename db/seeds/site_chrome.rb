# frozen_string_literal: true

# Starter website header links and footer, matching the homepage sections.
# Loaded by db/seeds.rb in every environment. Each is only created once —
# re-seeding never overwrites it, so dashboard edits survive.

english = Language.find_or_create_by!(code: "en") { |l| l.name = "English" }

unless HeaderItem.exists?
  [ [ "Services", "/#services" ] ].each_with_index do |(label, url), position|
    item = HeaderItem.new(position: position, link_type: "url", url: url)
    item.header_item_translations.build(language: english, label: label)
    item.save!
  end
end

HeaderServicesMenu.sync!

# The "Why Us" and "Membership" anchors were replaced by the About Us page.
HeaderItem.top_level.where(link_type: "url", url: [ "/#why-us", "/#membership" ]).destroy_all

about_page = Page.find_by(slug: "about")
if about_page && !HeaderItem.exists?(page_id: about_page.id)
  item = HeaderItem.new(position: HeaderItem.top_level.count, link_type: "page", page: about_page)
  item.header_item_translations.build(language: english, label: "About Us")
  item.save!
end

unless HeaderItem.top_level.exists?(link_type: "route", route_key: "faqs")
  item = HeaderItem.new(position: HeaderItem.top_level.count, link_type: "route", route_key: "faqs")
  item.header_item_translations.build(language: english, label: "FAQ")
  item.save!
end

unless Footer.exists?
  footer = Footer.new
  footer.footer_translations.build(language: english, title: "Auto Atelier", description: "Hand-finished auto care, by appointment.")

  column = footer.footer_columns.build(position: 0)
  column.footer_column_translations.build(language: english, title: "Account")
  [ [ "Sign in", "sign_in" ], [ "Book your visit", "sign_up" ], [ "FAQ", "faqs" ] ].each_with_index do |(label, route), position|
    item = column.footer_items.build(position: position, link_type: "route", route_key: route)
    item.footer_item_translations.build(language: english, label: label)
  end

  footer.save!
end

# Existing footers get the FAQ link too, in their first column.
first_column = Footer.first&.footer_columns&.order(:position)&.first
if first_column && !FooterItem.exists?(link_type: "route", route_key: "faqs")
  item = first_column.footer_items.build(position: first_column.footer_items.count, link_type: "route", route_key: "faqs")
  item.footer_item_translations.build(language: english, label: "FAQ")
  item.save!
end

# Link the blog from the footer (added after the footer was first seeded).
footer = Footer.first
if footer && !FooterItem.exists?(link_type: "route", route_key: "blogs")
  column = footer.footer_columns.first
  if column
    item = column.footer_items.build(position: column.footer_items.size, link_type: "route", route_key: "blogs")
    item.footer_item_translations.build(language: english, label: "Blog")
    item.save!
  end
end

# Link Terms & Conditions from the footer only (never the header).
terms_page = Page.find_by(slug: "terms-and-conditions")
if terms_page && !FooterItem.exists?(link_type: "page", page_id: terms_page.id)
  column = Footer.first&.footer_columns&.order(:position)&.first
  if column
    item = column.footer_items.build(position: column.footer_items.count, link_type: "page", page: terms_page)
    item.footer_item_translations.build(language: english, label: "Terms & Conditions")
    item.save!
  end
end
