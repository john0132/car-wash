# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin cities", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }

  before do
    english
    arabic
    sign_in admin
  end

  def translations(en:, ar: "")
    [ { language_id: english.id, name: en }, { language_id: arabic.id, name: ar } ]
  end

  describe "GET /admin/cities" do
    it "lists cities with area counts, filtered by name and status" do
      grant(admin, "cities.read")
      cairo = create_city("Cairo")
      create_area(city: cairo)
      create_city("Giza", is_active: false)

      get admin_cities_path

      expect_inertia.to render_component("admin/cities/index")
      expect(inertia.props[:cities].pluck(:name)).to eq(%w[Cairo Giza])
      expect(inertia.props[:cities].first).to include(areas_count: 1)

      get admin_cities_path, params: { q: "gi" }
      expect(inertia.props[:cities].pluck(:name)).to eq(%w[Giza])

      get admin_cities_path, params: { status: "active" }
      expect(inertia.props[:cities].pluck(:name)).to eq(%w[Cairo])
    end

    it "is forbidden without cities.read" do
      get admin_cities_path

      expect(response).to redirect_to(admin_root_path)
      expect(flash[:alert]).to eq("You are not authorized to perform this action")
    end
  end

  describe "GET /admin/cities/:id" do
    it "shows the city with its areas and their geofences" do
      grant(admin, "cities.read")
      city = create_city
      area = create_area(city: city)

      get admin_city_path(city)

      expect_inertia.to render_component("admin/cities/show")
      expect(inertia.props[:areas]).to contain_exactly(include(id: area.id, geofence: include(type: "Polygon")))
    end
  end

  describe "GET /admin/cities/new" do
    it "offers one blank translation per language, the default one first" do
      grant(admin, "cities.create")

      get new_admin_city_path

      expect_inertia.to render_component("admin/cities/new")
      expect(inertia.props[:translations].pluck(:code, :default, :name)).to eq([ [ "en", true, "" ], [ "ar", false, "" ] ])
    end
  end

  describe "POST /admin/cities" do
    it "creates a city with its translations" do
      grant(admin, "cities.create")

      post admin_cities_path, params: { city: { is_active: true, translations: translations(en: "Alexandria", ar: "الإسكندرية") } }

      city = City.last
      expect(response).to redirect_to(admin_city_path(city))
      expect(city.city_translations.map(&:name)).to contain_exactly("Alexandria", "الإسكندرية")
    end

    it "requires an English name" do
      grant(admin, "cities.create")

      expect {
        post admin_cities_path, params: { city: { is_active: true, translations: translations(en: "", ar: "الإسكندرية") } }
      }.not_to change(City, :count)

      expect(response).to redirect_to(new_admin_city_path)
      expect(session[:inertia_errors]).to include(:translations)
    end

    it "is forbidden without cities.create" do
      grant(admin, "cities.read")

      expect {
        post admin_cities_path, params: { city: { translations: translations(en: "Alexandria") } }
      }.not_to change(City, :count)
    end
  end

  describe "PATCH /admin/cities/:id" do
    it "renames the city and removes a blanked-out translation" do
      grant(admin, "cities.update")
      city = create_city("Cairo")
      city.city_translations.create!(language: arabic, name: "القاهرة")

      patch admin_city_path(city), params: { city: { is_active: false, translations: translations(en: "Greater Cairo") } }

      expect(response).to redirect_to(admin_city_path(city))
      city.reload
      expect(city.city_translations.map(&:name)).to eq([ "Greater Cairo" ])
      expect(city).not_to be_is_active
    end
  end

  describe "PATCH /admin/cities/:id/activation" do
    it "disables the city" do
      grant(admin, "cities.update")
      city = create_city

      patch activation_admin_city_path(city), params: { is_active: false }

      expect(city.reload).not_to be_is_active
    end
  end

  describe "DELETE /admin/cities/:id" do
    before { grant(admin, "cities.delete") }

    it "deletes a city without areas" do
      city = create_city

      delete admin_city_path(city)

      expect(response).to redirect_to(admin_cities_path)
      expect(City.exists?(city.id)).to be(false)
    end

    it "refuses to delete a city that still has areas" do
      city = create_city
      create_area(city: city)

      delete admin_city_path(city)

      expect(City.exists?(city.id)).to be(true)
      expect(flash[:alert]).to match(/areas/)
    end
  end
end
