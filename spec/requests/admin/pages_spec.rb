# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin pages", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }
  let(:hero) { create_component(key: "hero", name: "Hero") }
  let(:cta) { create_component(key: "cta", name: "CTA") }

  before do
    english
    arabic
    sign_in admin
  end

  def translations(en_title: "About us", ar_title: "")
    {
      english.id.to_s => { name: "About", title: en_title, subtitle: "", seo_title: "", seo_description: "", seo_image: "" },
      arabic.id.to_s => { name: ar_title.presence && "من نحن", title: ar_title, subtitle: "", seo_title: "",
                          seo_description: "", seo_image: "" }
    }
  end

  def section(component, heading, id: nil, ar: nil, **settings)
    content = { english.id.to_s => { heading: heading } }
    content[arabic.id.to_s] = { heading: ar } if ar
    { id: id, component_id: component.id, is_active: true, settings: settings, content: content }
  end

  describe "GET /admin/pages" do
    it "lists pages with section counts" do
      grant(admin, "pages.read")
      create_page(slug: "about", name: "About")
      create_page(slug: "faq", name: "FAQ", is_active: false)

      get admin_pages_path

      expect_inertia.to render_component("admin/pages/index")
      expect(inertia.props[:pages].pluck(:slug, :sections_count)).to eq([ [ "about", 0 ], [ "faq", 0 ] ])

      get admin_pages_path, params: { q: "faq" }
      expect(inertia.props[:pages].pluck(:slug)).to eq(%w[faq])
    end

    it "is forbidden without pages.read" do
      get admin_pages_path
      expect(response).to redirect_to(admin_root_path)
    end
  end

  describe "GET /admin/pages/new" do
    it "offers the active components with their schemas" do
      grant(admin, "pages.create")
      hero
      create_component(key: "old", name: "Old", is_active: false)

      get new_admin_page_path

      expect_inertia.to render_component("admin/pages/new")
      expect(inertia.props[:components]).to contain_exactly(include(key: "hero", fields: include(include(key: "heading"))))
      expect(inertia.props[:languages].pluck(:code)).to eq(%w[en ar])
    end
  end

  describe "POST /admin/pages" do
    it "creates a page with its translations and ordered sections" do
      grant(admin, "pages.create")

      post admin_pages_path, as: :json, params: {
        page: { slug: "about", is_active: true, translations: translations(ar_title: "من نحن"),
                sections: [ section(hero, "We come to you", ar: "نأتي إليك", button_url: "/book"), section(cta, "Book now") ] }
      }

      page = Page.last
      expect(response).to redirect_to(edit_admin_page_path(page))
      expect(page.page_translations.map(&:title)).to contain_exactly("About us", "من نحن")
      expect(page.page_sections.map { |s| [ s.component.key, s.position, s.settings ] })
        .to eq([ [ "hero", 0, { "button_url" => "/book" } ], [ "cta", 1, {} ] ])
      expect(page.render_props(:ar)[:sections].map { |s| s[:data][:heading] }).to eq([ "نأتي إليك", "Book now" ])
    end

    it "returns errors keyed by section index and language" do
      grant(admin, "pages.create")

      post admin_pages_path, as: :json, params: {
        page: { slug: "Bad Slug", is_active: true, translations: translations(en_title: ""),
                sections: [ section(hero, "Fine"), section(cta, "", button_url: "javascript:x") ] }
      }

      expect(response).to redirect_to(new_admin_page_path)
      follow_redirect!
      errors = inertia.props[:errors]
      expect(errors).to include(:slug, :"translations.#{english.id}.title", :sections)
      expect(errors).to include(
        "sections.1.fields.en.heading": [ "can't be blank" ],
        "sections.1.fields.button_url": [ "must be a URL starting with https://, http:// or /" ]
      )
      expect(errors.keys.grep(/\Asections\.0\./)).to be_empty
      expect(Page.count).to eq(0)
    end
  end

  describe "PATCH /admin/pages/:id" do
    it "updates, reorders, adds and removes sections" do
      grant(admin, "pages.update")
      page = create_page(slug: "about")
      [ "First", "Second", "Third" ].each_with_index do |heading, position|
        s = page.page_sections.build(component: hero, position: position)
        s.assign_values(settings: {}, content_by_language: { english.id => { "heading" => heading } })
      end
      page.save!
      first, second, third = page.page_sections.to_a

      patch admin_page_path(page), as: :json, params: {
        page: { slug: "about", is_active: true, translations: translations,
                sections: [ section(hero, "Third!", id: third.id), section(cta, "New"), section(hero, "First", id: first.id) ] }
      }

      expect(response).to redirect_to(edit_admin_page_path(page))
      sections = page.reload.page_sections.to_a
      expect(sections.map { |s| [ s.component.key, s.content_for(english.id)["heading"] ] })
        .to eq([ [ "hero", "Third!" ], [ "cta", "New" ], [ "hero", "First" ] ])
      expect(sections.first.id).to eq(third.id)
      expect(PageSection.exists?(second.id)).to be(false)
    end

    it "is forbidden without pages.update" do
      page = create_page
      patch admin_page_path(page), as: :json, params: { page: { slug: "changed" } }

      expect(page.reload.slug).to eq("about-us")
    end
  end

  describe "DELETE /admin/pages/:id" do
    it "deletes the page and its sections" do
      grant(admin, "pages.delete")
      page = create_page
      s = page.page_sections.build(component: hero, position: 0)
      s.assign_values(settings: {}, content_by_language: { english.id => { "heading" => "Hi" } })
      page.save!

      expect { delete admin_page_path(page) }.to change(Page, :count).by(-1).and change(PageSection, :count).by(-1)
      expect(response).to redirect_to(admin_pages_path)
    end
  end

  describe "PATCH /admin/pages/:id/activation" do
    it "unpublishes the page" do
      grant(admin, "pages.update")
      page = create_page

      patch activation_admin_page_path(page), params: { is_active: false }

      expect(page.reload.is_active).to be(false)
    end
  end
end
