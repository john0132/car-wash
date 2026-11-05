# frozen_string_literal: true

require "rails_helper"

RSpec.describe Page, type: :model do
  it "is valid with a slug and a default-language name" do
    page = Page.new(slug: "about-us")
    page.page_translations.build(language: english, name: "About", title: "About us")
    expect(page).to be_valid
  end

  it "requires a name in the default language" do
    english
    page = Page.new(slug: "about-us")
    expect(page).not_to be_valid
    expect(page.errors[:translations]).to include("must include a name in English")
  end

  it "requires a slug" do
    expect(Page.new(slug: nil).tap(&:valid?).errors[:slug]).to be_present
  end

  it "requires a unique slug" do
    create_page(slug: "about-us")
    expect(Page.new(slug: "about-us").tap(&:valid?).errors[:slug]).to include("has already been taken")
  end

  it "rejects slugs with invalid characters" do
    expect(Page.new(slug: "About Us!").tap(&:valid?).errors[:slug]).to be_present
  end

  it "defaults is_active to true" do
    expect(create_page.is_active).to be(true)
  end

  describe "#render_props" do
    it "returns the page text with locale fallback and only active sections, in order" do
      component = create_component
      page = Page.new(slug: "home")
      page.page_translations.build(language: english, name: "Home", title: "Welcome", subtitle: "Clean cars")
      page.page_translations.build(language: arabic, name: "الرئيسية", title: "أهلا")
      [ [ 1, "Second", true ], [ 0, "First", true ], [ 2, "Hidden", false ] ].each do |position, heading, active|
        page.page_sections.build(component: component, position: position, is_active: active)
          .assign_values(settings: {}, content_by_language: { english.id => { "heading" => heading } })
      end
      page.save!

      props = Page.find(page.id).render_props(:ar)

      expect(props).to include(slug: "home", title: "أهلا", subtitle: "Clean cars")
      expect(props[:sections].map { |s| s[:data][:heading] }).to eq(%w[First Second])
      expect(props[:components].keys).to eq([ "hero" ])
    end
  end
end
