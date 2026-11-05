# frozen_string_literal: true

# Starter page components, loaded by db/seeds.rb in every environment. Staff can
# edit them or define more in the dashboard (Content → Components). Existing
# components are never overwritten, so dashboard edits survive re-seeding.

english = Language.find_or_create_by!(code: "en") { |l| l.name = "English" }

starter_components = {
  "hero" => {
    name: "Hero",
    description: "Large banner at the top of a page with a heading, image and button.",
    fields: [
      { key: "heading", label: "Heading", type: "string", translatable: true, required: true },
      { key: "subheading", label: "Subheading", type: "text", translatable: true },
      { key: "button_label", label: "Button label", type: "string", translatable: true },
      { key: "button_url", label: "Button link", type: "url" },
      { key: "image", label: "Background image", type: "image" },
      { key: "alignment", label: "Alignment", type: "select", options: %w[left center] }
    ]
  },
  "rich_text" => {
    name: "Rich text",
    description: "Free-form formatted text.",
    fields: [
      { key: "body", label: "Text", type: "rich_text", translatable: true, required: true }
    ]
  },
  "cta" => {
    name: "Call to action",
    description: "A highlighted band asking visitors to take an action.",
    fields: [
      { key: "heading", label: "Heading", type: "string", translatable: true, required: true },
      { key: "text", label: "Text", type: "text", translatable: true },
      { key: "button_label", label: "Button label", type: "string", translatable: true, required: true },
      { key: "button_url", label: "Button link", type: "url", required: true },
      { key: "variant", label: "Style", type: "select", options: %w[primary muted] }
    ]
  },
  "features" => {
    name: "Features",
    description: "A grid of items, each with an icon, title and text.",
    fields: [
      { key: "heading", label: "Heading", type: "string", translatable: true },
      { key: "items", label: "Items", type: "repeater", required: true, fields: [
        { key: "icon", label: "Icon", type: "image" },
        { key: "title", label: "Title", type: "string", translatable: true, required: true },
        { key: "text", label: "Text", type: "text", translatable: true }
      ] }
    ]
  }
}

starter_components.each do |key, attrs|
  next if Component.exists?(key: key)

  component = Component.new(key: key, fields: attrs[:fields])
  component.component_translations.build(language: english, name: attrs[:name], description: attrs[:description])
  component.save!
end
