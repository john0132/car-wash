# frozen_string_literal: true

# Builders for City/Area, which require a default-language (English) name and,
# for areas, a geofence polygon.
module LocationHelpers
  GEO = RGeo::Geographic.spherical_factory(srid: 4326)

  def english
    Language.find_or_create_by!(code: "en") { |l| l.name = "English" }
  end

  def arabic
    Language.find_or_create_by!(code: "ar") { |l| l.name = "Arabic" }
  end

  # GeoJSON Polygon for a square of ±`half` degrees around (lng, lat).
  def square_geojson(lng: 31.2357, lat: 30.0444, half: 0.01)
    corners = [ [ -half, -half ], [ half, -half ], [ half, half ], [ -half, half ], [ -half, -half ] ]
    { "type" => "Polygon", "coordinates" => [ corners.map { |dlng, dlat| [ lng + dlng, lat + dlat ] } ] }
  end

  def create_city(name = "Cairo", **attrs)
    City.new(**attrs).tap do |city|
      city.city_translations.build(language: english, name: name)
      city.save!
    end
  end

  def create_area(name = "Maadi", city: create_city, geofence: square_geojson, **attrs)
    Area.new(city: city, rate: 1, **attrs).tap do |area|
      area.geofence_geojson = geofence
      area.area_translations.build(language: english, name: name)
      area.save!
    end
  end
end

RSpec.configure do |config|
  config.include LocationHelpers
end
