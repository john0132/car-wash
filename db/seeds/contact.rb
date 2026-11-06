# frozen_string_literal: true

# The contact us page and its header/footer links. Loaded by db/seeds.rb in
# every environment. Only created once — re-seeding never overwrites it, so
# dashboard edits survive. Staff edit the text under Pages (slug "contact");
# the form itself is added by Website::ContactsController.

english = Language.find_or_create_by!(code: "en") { |l| l.name = "English" }

unless Page.exists?(slug: "contact")
  rich_text = Component.find_by!(key: "rich_text")

  page = Page.new(slug: "contact", is_active: true)
  page.page_translations.build(
    language: english,
    name: "Contact Us",
    title: "Contact Us — Auto Atelier",
    subtitle: "We'd love to hear from you",
    seo_description: "Questions, feedback or a special request? Send us a message."
  )
  page.page_sections.build(component: rich_text, position: 0).assign_values(
    settings: {},
    content_by_language: {
      english.id => {
        "body" => "<h1>Contact us</h1><p>Questions, feedback or a special request? Send us a message below and we'll get back to you soon.</p>"
      }
    }
  )
  page.save!
end

unless HeaderItem.top_level.exists?(link_type: "route", route_key: "contact")
  item = HeaderItem.new(position: HeaderItem.top_level.count, link_type: "route", route_key: "contact")
  item.header_item_translations.build(language: english, label: "Contact Us")
  item.save!
end

column = Footer.first&.footer_columns&.order(:position)&.first
if column && !FooterItem.exists?(link_type: "route", route_key: "contact")
  item = column.footer_items.build(position: column.footer_items.count, link_type: "route", route_key: "contact")
  item.footer_item_translations.build(language: english, label: "Contact Us")
  item.save!
end
