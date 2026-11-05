# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin components", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }

  before do
    english
    arabic
    sign_in admin
  end

  def component_params(key: "testimonials", name: "Testimonials", fields: nil)
    fields ||= [
      { key: "heading", label: "Heading", type: "string", translatable: true, required: true },
      { key: "quotes", label: "Quotes", type: "repeater", fields: [
        { key: "quote", type: "text", translatable: true, required: true },
        { key: "photo", type: "image" }
      ] }
    ]
    { component: { key: key, is_active: true, fields: fields,
                   translations: { english.id.to_s => { name: name, description: "" },
                                   arabic.id.to_s => { name: "", description: "" } } } }
  end

  describe "GET /admin/components" do
    it "lists components with field and page counts" do
      grant(admin, "components.read")
      create_component(key: "hero", name: "Hero")
      create_component(key: "cta", name: "Call to action", is_active: false)

      get admin_components_path

      expect_inertia.to render_component("admin/components/index")
      expect(inertia.props[:components].pluck(:name, :fields_count, :pages_count))
        .to eq([ [ "Call to action", 2, 0 ], [ "Hero", 2, 0 ] ])

      get admin_components_path, params: { status: "active" }
      expect(inertia.props[:components].pluck(:key)).to eq(%w[hero])
    end

    it "is forbidden without components.read" do
      get admin_components_path
      expect(response).to redirect_to(admin_root_path)
    end
  end

  describe "POST /admin/components" do
    it "creates a component from a field schema" do
      grant(admin, "components.create")

      post admin_components_path, params: component_params, as: :json

      component = Component.last
      expect(response).to redirect_to(edit_admin_component_path(component))
      expect(component.key).to eq("testimonials")
      expect(component.schema.fields.map(&:key)).to eq(%w[heading quotes])
      expect(component.translation.name).to eq("Testimonials")
    end

    it "returns schema and translation errors" do
      grant(admin, "components.create")

      post admin_components_path, params: component_params(name: "", fields: [ { key: "x", type: "select" } ]), as: :json

      expect(response).to redirect_to(new_admin_component_path)
      follow_redirect!
      expect(inertia.props[:errors]).to include(fields: [ "\"x\" needs at least one option" ])
      expect(inertia.props[:errors][:translations]).to be_present
    end
  end

  describe "PATCH /admin/components/:id" do
    it "rejects type changes to fields pages already use" do
      grant(admin, "components.update")
      component = create_component
      page = create_page
      section = page.page_sections.build(component: component, position: 0)
      section.assign_values(settings: {}, content_by_language: { english.id => { "heading" => "Hi" } })
      section.save!

      patch admin_component_path(component),
        params: component_params(key: "hero", name: "Hero", fields: [ { key: "heading", type: "rich_text", translatable: true } ]),
        as: :json

      follow_redirect!
      expect(inertia.props[:errors][:fields]).to include(a_string_including("\"heading\" can't change type"))
      expect(component.reload.schema.fields.first.type).to eq("string")
    end
  end

  describe "DELETE /admin/components/:id" do
    it "deletes an unused component" do
      grant(admin, "components.delete")
      component = create_component

      expect { delete admin_component_path(component) }.to change(Component, :count).by(-1)
      expect(response).to redirect_to(admin_components_path)
    end

    it "keeps a component pages use" do
      grant(admin, "components.delete")
      component = create_component
      section = create_page.page_sections.build(component: component, position: 0)
      section.assign_values(settings: {}, content_by_language: { english.id => { "heading" => "Hi" } })
      section.save!

      expect { delete admin_component_path(component) }.not_to change(Component, :count)
      expect(flash[:alert]).to include("is used on pages")
    end
  end
end
