# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin areas", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }
  let(:cairo) { create_city("Cairo") }
  let(:giza) { create_city("Giza") }

  before do
    english
    arabic
    sign_in admin
  end

  def area_params(name: "Maadi", geofence: square_geojson.to_json, city: cairo, **attrs)
    {
      area: {
        city_id: city.id, rate: "1.25", is_active: true, geofence: geofence,
        translations: [ { language_id: english.id, name: name }, { language_id: arabic.id, name: "" } ],
        **attrs
      }
    }
  end

  describe "GET /admin/areas" do
    it "lists areas, filtered by city" do
      grant(admin, "areas.read")
      maadi = create_area("Maadi", city: cairo)
      dokki = create_area("Dokki", city: giza, geofence: square_geojson(lng: 31.21, lat: 30.04))

      get admin_areas_path

      expect_inertia.to render_component("admin/areas/index")
      expect(inertia.props[:areas].pluck(:id)).to eq([ dokki.id, maadi.id ])
      expect(inertia.props[:areas].first).to include(city: { id: giza.id, name: "Giza" }, geofence: include(type: "Polygon"))

      get admin_areas_path, params: { city_id: cairo.id }
      expect(inertia.props[:areas].pluck(:id)).to eq([ maadi.id ])
      expect(inertia.props[:filters]).to include(city_id: cairo.id)
    end

    it "is forbidden without areas.read" do
      get admin_areas_path

      expect(response).to redirect_to(admin_root_path)
    end
  end

  describe "GET /admin/areas/new" do
    it "preselects the city and passes other areas for reference" do
      grant(admin, "areas.create")
      other = create_area("Zamalek", city: cairo)

      get new_admin_area_path(city_id: cairo.id)

      expect_inertia.to render_component("admin/areas/new")
      expect(inertia.props[:city_id]).to eq(cairo.id)
      expect(inertia.props[:reference_areas]).to contain_exactly(include(id: other.id, city_id: cairo.id))
    end
  end

  describe "GET /admin/areas/:id/edit" do
    it "excludes the area itself from the reference areas" do
      grant(admin, "areas.update")
      area = create_area(city: cairo)

      get edit_admin_area_path(area)

      expect_inertia.to render_component("admin/areas/edit")
      expect(inertia.props[:area]).to include(id: area.id, geofence: area.geofence_geojson)
      expect(inertia.props[:reference_areas]).to be_empty
    end
  end

  describe "POST /admin/areas" do
    before { grant(admin, "areas.create") }

    it "creates an area with the drawn geofence" do
      post admin_areas_path, params: area_params

      area = Area.last
      expect(response).to redirect_to(admin_area_path(area))
      expect(area.city).to eq(cairo)
      expect(area.rate).to eq(1.25)
      expect(area.geofence_geojson[:coordinates]).to eq(square_geojson["coordinates"])
      expect(area.area_translations.map(&:name)).to eq([ "Maadi" ])
    end

    it "returns errors for a missing or invalid geofence" do
      expect { post admin_areas_path, params: area_params(geofence: "") }.not_to change(Area, :count)
      expect(response).to redirect_to(new_admin_area_path(city_id: cairo.id))
      expect(session[:inertia_errors]).to include(:geofence)

      bow_tie = { type: "Polygon", coordinates: [ [ [ 31.2, 30.0 ], [ 31.3, 30.1 ], [ 31.3, 30.0 ], [ 31.2, 30.1 ] ] ] }
      expect { post admin_areas_path, params: area_params(geofence: bow_tie.to_json) }.not_to change(Area, :count)
    end
  end

  describe "PATCH /admin/areas/:id" do
    it "moves the area to another city with a new geofence" do
      grant(admin, "areas.update")
      area = create_area(city: cairo)
      moved = square_geojson(lng: 31.0, lat: 30.05)

      patch admin_area_path(area), params: area_params(name: "Dokki", city: giza, geofence: moved.to_json)

      area.reload
      expect(response).to redirect_to(admin_area_path(area))
      expect(area.city).to eq(giza)
      expect(area.translation.name).to eq("Dokki")
      expect(area.geofence_geojson[:coordinates]).to eq(moved["coordinates"])
    end

    it "is forbidden without areas.update" do
      grant(admin, "areas.read")
      area = create_area(city: cairo)

      patch admin_area_path(area), params: area_params(name: "Renamed")

      expect(area.reload.translation.name).to eq("Maadi")
    end
  end

  describe "PATCH /admin/areas/:id/activation" do
    it "disables the area" do
      grant(admin, "areas.update")
      area = create_area(city: cairo)

      patch activation_admin_area_path(area), params: { is_active: false }

      expect(area.reload).not_to be_is_active
    end
  end

  describe "DELETE /admin/areas/:id" do
    before { grant(admin, "areas.delete") }

    it "deletes the area and returns to its city" do
      area = create_area(city: cairo)

      delete admin_area_path(area)

      expect(response).to redirect_to(admin_city_path(cairo))
      expect(Area.exists?(area.id)).to be(false)
    end

    it "refuses to delete an area with customer addresses" do
      area = create_area(city: cairo)
      users(:one).addresses.create!(area: area, name: "Home", location: LocationHelpers::GEO.point(31.2357, 30.0444))

      delete admin_area_path(area)

      expect(Area.exists?(area.id)).to be(true)
      expect(flash[:alert]).to match(/addresses/)
    end
  end
end
