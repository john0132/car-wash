# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin service categories", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }

  before do
    english
    arabic
    sign_in admin
  end

  def translations(en:, ar: "", **seo)
    [ { language_id: english.id, name: en, **seo }, { language_id: arabic.id, name: ar } ]
  end

  describe "GET /admin/service_categories" do
    it "lists categories with service counts, filtered by name and status" do
      grant(admin, "service_categories.read")
      exterior = create_service_category("Exterior")
      create_service(service_category: exterior)
      create_service_category("Interior", is_active: false)

      get admin_service_categories_path

      expect_inertia.to render_component("admin/service_categories/index")
      expect(inertia.props[:service_categories].pluck(:name)).to eq(%w[Exterior Interior])
      expect(inertia.props[:service_categories].first).to include(services_count: 1)

      get admin_service_categories_path, params: { q: "inter" }
      expect(inertia.props[:service_categories].pluck(:name)).to eq(%w[Interior])

      get admin_service_categories_path, params: { status: "active" }
      expect(inertia.props[:service_categories].pluck(:name)).to eq(%w[Exterior])
    end

    it "is forbidden without service_categories.read" do
      get admin_service_categories_path

      expect(response).to redirect_to(admin_root_path)
      expect(flash[:alert]).to eq("You are not authorized to perform this action")
    end
  end

  describe "GET /admin/service_categories/:id" do
    it "shows the category with its services" do
      grant(admin, "service_categories.read")
      category = create_service_category
      service = create_service(service_category: category, price: 200, sale_price: 150)

      get admin_service_category_path(category)

      expect_inertia.to render_component("admin/service_categories/show")
      expect(inertia.props[:services]).to contain_exactly(include(id: service.id, price: 200.0, sale_price: 150.0))
    end
  end

  describe "GET /admin/service_categories/new" do
    it "offers one blank translation per language with SEO fields, the default one first" do
      grant(admin, "service_categories.create")

      get new_admin_service_category_path

      expect_inertia.to render_component("admin/service_categories/new")
      expect(inertia.props[:translations].pluck(:code, :default, :name, :seo_title))
        .to eq([ [ "en", true, "", "" ], [ "ar", false, "", "" ] ])
    end
  end

  describe "POST /admin/service_categories" do
    it "creates a category with its translations and SEO text" do
      grant(admin, "service_categories.create")

      post admin_service_categories_path, params: {
        service_category: {
          is_active: true,
          translations: translations(en: "Exterior", ar: "خارجي", seo_title: "Exterior car wash",
                                     seo_description: "Wash at your door")
        }
      }

      category = ServiceCategory.last
      expect(response).to redirect_to(admin_service_category_path(category))
      expect(category.service_category_translations.map(&:name)).to contain_exactly("Exterior", "خارجي")
      expect(category.translation(:en)).to have_attributes(seo_title: "Exterior car wash",
                                                           seo_description: "Wash at your door")
    end

    it "requires an English name" do
      grant(admin, "service_categories.create")

      expect {
        post admin_service_categories_path, params: { service_category: { translations: translations(en: "", ar: "خارجي") } }
      }.not_to change(ServiceCategory, :count)

      expect(response).to redirect_to(new_admin_service_category_path)
      expect(session[:inertia_errors]).to include(:translations)
    end

    it "is forbidden without service_categories.create" do
      grant(admin, "service_categories.read")

      expect {
        post admin_service_categories_path, params: { service_category: { translations: translations(en: "Exterior") } }
      }.not_to change(ServiceCategory, :count)
    end
  end

  describe "PATCH /admin/service_categories/:id" do
    it "renames the category, clears blank SEO text and removes a blanked-out translation" do
      grant(admin, "service_categories.update")
      category = create_service_category("Exterior")
      category.translation(:en).update!(seo_title: "Old title")
      category.service_category_translations.create!(language: arabic, name: "خارجي")

      patch admin_service_category_path(category), params: {
        service_category: { is_active: false, translations: translations(en: "Outside", seo_title: "") }
      }

      expect(response).to redirect_to(admin_service_category_path(category))
      category.reload
      expect(category.service_category_translations.map(&:name)).to eq([ "Outside" ])
      expect(category.translation(:en).seo_title).to be_nil
      expect(category).not_to be_is_active
    end
  end

  describe "PATCH /admin/service_categories/:id/activation" do
    it "disables the category" do
      grant(admin, "service_categories.update")
      category = create_service_category

      patch activation_admin_service_category_path(category), params: { is_active: false }

      expect(category.reload).not_to be_is_active
    end
  end

  describe "DELETE /admin/service_categories/:id" do
    before { grant(admin, "service_categories.delete") }

    it "deletes a category without services" do
      category = create_service_category

      delete admin_service_category_path(category)

      expect(response).to redirect_to(admin_service_categories_path)
      expect(ServiceCategory.exists?(category.id)).to be(false)
    end

    it "refuses to delete a category that still has services" do
      category = create_service_category
      create_service(service_category: category)

      delete admin_service_category_path(category)

      expect(ServiceCategory.exists?(category.id)).to be(true)
      expect(flash[:alert]).to match(/services/)
    end
  end
end
