# frozen_string_literal: true

require "rails_helper"

RSpec.describe PageSection, type: :model do
  let(:component) do
    create_component(key: "features", fields: [
      { key: "heading", type: "string", translatable: true, required: true },
      { key: "image", type: "image" },
      { key: "items", type: "repeater", fields: [
        { key: "title", type: "string", translatable: true, required: true },
        { key: "icon", type: "image" }
      ] }
    ])
  end
  let(:page) { create_page }

  def build_section(settings: {}, content: {}, **attrs)
    page.page_sections.build(component: component, position: 0, **attrs).tap do |section|
      section.assign_values(settings: settings, content_by_language: content)
    end
  end

  it "stores shared values in settings and translatable ones per language, dropping unknown keys" do
    section = build_section(
      settings: { "heading" => "not here", "junk" => 1, "items" => [ { "_id" => "a" } ] },
      content: { english.id => { "heading" => "Why us", "items" => { "a" => { "title" => "Fast" } }, "junk" => 1 } }
    )
    section.save!

    expect(section.reload.settings).to eq("items" => [ { "_id" => "a" } ])
    expect(section.content_for(english.id)).to eq("heading" => "Why us", "items" => { "a" => { "title" => "Fast" } })
  end

  it "requires translatable values in the default language, keyed by language code" do
    arabic
    section = build_section(
      settings: { "items" => [ { "_id" => "a" } ] },
      content: { arabic.id => { "heading" => "لماذا", "items" => { "a" => { "title" => "سريع" } } } }
    )

    expect(section).not_to be_valid
    expect(section.errors.to_hash).to include(
      "fields.en.heading": [ "can't be blank" ],
      "fields.en.items.0.title": [ "can't be blank" ]
    )
  end

  it "removes a language whose content becomes empty" do
    section = build_section(content: { english.id => { "heading" => "Hi" }, arabic.id => { "heading" => "أهلا" } })
    section.save!

    section.assign_values(settings: {}, content_by_language: { arabic.id => { "heading" => "" } })
    section.save!

    expect(section.reload.translations.map(&:language_id)).to eq([ english.id ])
  end

  it "can't be added with a disabled component" do
    component.update!(is_active: false)
    section = build_section(content: { english.id => { "heading" => "Hi" } })

    expect(section).not_to be_valid
    expect(section.errors[:component]).to include("is disabled")
  end

  it "rejects image values that aren't uploads" do
    section = build_section(settings: { "image" => "forged" }, content: { english.id => { "heading" => "Hi" } })

    expect(section).not_to be_valid
    expect(section.errors[:images]).to be_present
  end

  it "attaches referenced images and purges ones no longer used" do
    first = uploaded_blob
    second = uploaded_blob(filename: "icon.png")
    section = build_section(
      settings: { "image" => first.signed_id, "items" => [ { "_id" => "a", "icon" => second.signed_id } ] },
      content: { english.id => { "heading" => "Hi", "items" => { "a" => { "title" => "Fast" } } } }
    )
    section.save!

    expect(section.images.blobs).to contain_exactly(first, second)

    section.assign_values(settings: { "image" => first.signed_id }, content_by_language: {})
    section.save!

    expect(section.reload.images.blobs).to contain_exactly(first)
  end

  describe "#render_props" do
    it "falls back per field and merges repeater items by id, resolving images" do
      blob = uploaded_blob
      section = build_section(
        settings: { "image" => blob.signed_id, "items" => [ { "_id" => "b" }, { "_id" => "a" } ] },
        content: {
          english.id => { "heading" => "Why us", "items" => { "a" => { "title" => "Fast" }, "b" => { "title" => "Green" } } },
          arabic.id => { "items" => { "a" => { "title" => "سريع" } } }
        }
      )
      section.save!

      props = PageSection.find(section.id).render_props(:ar)

      expect(props).to include(id: section.id, component: "features")
      expect(props[:data][:heading]).to eq("Why us")
      expect(props[:data][:image][:url]).to include("/rails/active_storage/blobs/")
      expect(props[:data][:items]).to eq([
        { id: "b", title: "Green", icon: nil },
        { id: "a", title: "سريع", icon: nil }
      ])
    end
  end
end
