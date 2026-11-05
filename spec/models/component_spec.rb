# frozen_string_literal: true

require "rails_helper"

RSpec.describe Component, type: :model do
  it "is valid with a key, fields and a default-language name" do
    expect(create_component).to be_persisted
  end

  it "requires a snake_case unique key" do
    create_component(key: "hero")

    expect(Component.new(key: "hero", fields: [ { key: "a", type: "string" } ]).tap(&:valid?).errors[:key])
      .to include("has already been taken")
    expect(Component.new(key: "Hero Banner").tap(&:valid?).errors[:key]).to be_present
  end

  it "requires at least one valid field" do
    expect(Component.new(key: "empty").tap(&:valid?).errors[:fields]).to include("must have at least one field")
    expect(Component.new(key: "bad", fields: [ { key: "x", type: "nope" } ]).tap(&:valid?).errors[:fields])
      .to include("\"x\" has an unknown type \"nope\"")
  end

  context "when pages use it" do
    let(:component) { create_component }

    before do
      page = Page.new(slug: "home")
      page.page_translations.build(language: english, name: "Home", title: "Home")
      page.page_sections.build(component: component, position: 0)
        .assign_values(settings: {}, content_by_language: { english.id => { "heading" => "Hi" } })
      page.save!
    end

    it "locks the key and the type and translation of existing fields" do
      component.key = "banner"
      component.fields = [
        { key: "heading", type: "text", translatable: true },
        { key: "button_url", type: "url", translatable: true },
        { key: "subtitle", type: "string" }
      ]

      expect(component).not_to be_valid
      expect(component.errors[:key]).to include("can't be changed while pages use this component")
      expect(component.errors[:fields]).to contain_exactly(
        "\"heading\" can't change type or translation while pages use this component",
        "\"button_url\" can't change type or translation while pages use this component"
      )
    end

    it "still allows adding, removing and relabelling fields" do
      component.fields = [ { key: "heading", label: "Title", type: "string", translatable: true }, { key: "extra", type: "boolean" } ]
      expect(component).to be_valid
      expect(component.locked_field_paths).to eq(%w[heading button_url])
    end

    it "can't be destroyed" do
      expect(component.destroy).to be(false)
    end
  end
end
