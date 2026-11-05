# frozen_string_literal: true

require "rails_helper"

RSpec.describe Area, type: :model do
  let(:city) { create_city }

  def build_area(geofence: square_geojson)
    Area.new(city: city, rate: 1).tap do |area|
      area.geofence_geojson = geofence
      area.area_translations.build(language: english, name: "Maadi")
    end
  end

  describe "#geofence_geojson" do
    it "round-trips a GeoJSON polygon through the geofence column" do
      area = build_area
      area.save!

      expect(area.reload.geofence_geojson).to eq(type: "Polygon", coordinates: square_geojson["coordinates"])
    end

    it "accepts a JSON string and closes an open ring" do
      open_ring = square_geojson["coordinates"].first[0..3]
      area = build_area(geofence: { type: "Polygon", coordinates: [ open_ring ] }.to_json)

      expect(area).to be_valid
      expect(area.geofence_geojson[:coordinates].first.last).to eq(open_ring.first)
    end

    it "finds the area covering a point inside the polygon" do
      area = build_area.tap(&:save!)
      inside = LocationHelpers::GEO.point(31.2357, 30.0444)
      outside = LocationHelpers::GEO.point(31.5, 30.3)

      expect(Area.covering(inside)).to eq([ area ])
      expect(Area.covering(outside)).to be_empty
    end

    it "clears the geofence when blank" do
      area = build_area
      area.geofence_geojson = ""

      expect(area.geofence).to be_nil
      expect(area).not_to be_valid
      expect(area.errors[:geofence]).to include("can't be blank")
    end

    {
      "fewer than three distinct points" => { "type" => "Polygon", "coordinates" => [ [ [ 31, 30 ], [ 31.1, 30 ], [ 31, 30 ] ] ] },
      "coordinates out of range" => { "type" => "Polygon", "coordinates" => [ [ [ 200, 30 ], [ 31.1, 30 ], [ 31.1, 30.1 ] ] ] },
      "a non-polygon geometry" => { "type" => "Point", "coordinates" => [ 31, 30 ] },
      "unparseable JSON" => "{not json"
    }.each do |description, geofence|
      it "rejects #{description}" do
        area = build_area(geofence: geofence)

        expect(area).not_to be_valid
        expect(area.errors[:geofence]).to eq([ "is not a valid polygon" ])
      end
    end

    it "rejects a self-intersecting (bow-tie) polygon" do
      bow_tie = { "type" => "Polygon", "coordinates" => [ [ [ 31.2, 30.0 ], [ 31.3, 30.1 ], [ 31.3, 30.0 ], [ 31.2, 30.1 ] ] ] }
      area = build_area(geofence: bow_tie)

      expect(area).not_to be_valid
      expect(area.errors[:geofence]).to eq([ "must not cross itself" ])
    end
  end

  it "requires a name in the default language" do
    area = Area.new(city: city, rate: 1)
    area.geofence_geojson = square_geojson
    area.area_translations.build(language: arabic, name: "المعادي")

    expect(area).not_to be_valid
    expect(area.errors[:translations]).to eq([ "must include a name in English" ])
  end

  it "requires a positive rate" do
    area = build_area
    area.rate = 0

    expect(area).not_to be_valid
  end

  it "can't be deleted while it has addresses" do
    area = build_area.tap(&:save!)
    user = User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password")
    user.addresses.create!(area: area, name: "Home", location: LocationHelpers::GEO.point(31.2357, 30.0444))

    expect(area.destroy).to be(false)
    expect(area.errors.full_messages.to_sentence).to match(/addresses/)
  end

  describe ".search_name and .ordered_by_name" do
    it "matches any language's name and orders by the English name" do
      zamalek = create_area("Zamalek", city: city)
      maadi = create_area("Maadi", city: city)
      maadi.area_translations.create!(language: arabic, name: "المعادي")

      expect(Area.ordered_by_name).to eq([ maadi, zamalek ])
      expect(Area.search_name("معاد")).to eq([ maadi ])
      expect(Area.search_name("ZAM")).to eq([ zamalek ])
      expect(Area.search_name(nil).count).to eq(2)
    end
  end
end
