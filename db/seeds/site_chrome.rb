# frozen_string_literal: true

# Starter website header links and footer, matching the homepage sections.
# Loaded by db/seeds.rb in every environment. Each is only created once —
# re-seeding never overwrites it, so dashboard edits survive.

english = Language.find_or_create_by!(code: "en") { |l| l.name = "English" }

unless HeaderItem.exists?
  [ [ "Services", "/#services" ], [ "Why Us", "/#why-us" ], [ "Membership", "/#membership" ] ].each_with_index do |(label, url), position|
    item = HeaderItem.new(position: position, link_type: "url", url: url)
    item.header_item_translations.build(language: english, label: label)
    item.save!
  end
end

HeaderServicesMenu.sync!

unless Footer.exists?
  footer = Footer.new
  footer.footer_translations.build(language: english, title: "Auto Atelier", description: "Hand-finished auto care, by appointment.")

  column = footer.footer_columns.build(position: 0)
  column.footer_column_translations.build(language: english, title: "Account")
  [ [ "Sign in", "sign_in" ], [ "Book your visit", "sign_up" ] ].each_with_index do |(label, route), position|
    item = column.footer_items.build(position: position, link_type: "route", route_key: route)
    item.footer_item_translations.build(language: english, label: label)
  end

  footer.save!
end
