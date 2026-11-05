# frozen_string_literal: true

class Area < ApplicationRecord
  include Activatable
  include Translatable

  GEO_FACTORY = RGeo::Geographic.spherical_factory(srid: 4326)

  belongs_to :city
  has_many :area_translations, dependent: :destroy, autosave: true
  has_many :addresses, dependent: :restrict_with_error

  requires_default_translation

  validates :rate, presence: true, numericality: { greater_than: 0 }
  validates :geofence, presence: true, unless: :invalid_geofence_input?
  validate :geofence_is_valid_polygon

  # Uses ST_Covers (not ST_Contains with a ::geometry cast) so the geofence GiST index is used.
  scope :covering, ->(point) { where("ST_Covers(geofence, ?)", point) }

  # The geofence as a GeoJSON Polygon geometry (outer ring only, [lng, lat] positions).
  def geofence_geojson
    return unless geofence

    {
      type: "Polygon",
      coordinates: [ geofence.exterior_ring.points.map { |point| [ point.x, point.y ] } ]
    }
  end

  # Accepts a GeoJSON Polygon geometry, as a Hash or a JSON string. Blank clears the geofence.
  # Holes (inner rings) are ignored. Unparseable input leaves an error for validation.
  def geofence_geojson=(value)
    @invalid_geofence_input = false
    return self.geofence = nil if value.blank?

    self.geofence = polygon_from_geojson(value.is_a?(String) ? JSON.parse(value) : value.to_h)
  rescue JSON::ParserError, ArgumentError, TypeError, NoMethodError, RGeo::Error::RGeoError
    @invalid_geofence_input = true
    self.geofence = nil
  end

  private

  def polygon_from_geojson(geojson)
    geojson = geojson.to_h.deep_stringify_keys
    raise ArgumentError, "not a Polygon" unless geojson["type"] == "Polygon"

    positions = Array(geojson.fetch("coordinates").first).map do |lng, lat|
      lng = Float(lng)
      lat = Float(lat)
      raise ArgumentError, "coordinates out of range" unless lng.between?(-180, 180) && lat.between?(-90, 90)

      [ lng, lat ]
    end
    positions << positions.first unless positions.first == positions.last
    raise ArgumentError, "too few points" if positions.uniq.size < 3

    GEO_FACTORY.polygon(GEO_FACTORY.linear_ring(positions.map { |lng, lat| GEO_FACTORY.point(lng, lat) }))
  end

  def invalid_geofence_input?
    @invalid_geofence_input
  end

  # PostGIS rejects nothing on insert, so check validity (e.g. self-intersections) explicitly.
  def geofence_is_valid_polygon
    return errors.add(:geofence, "is not a valid polygon") if invalid_geofence_input?
    return unless geofence && will_save_change_to_geofence?

    sql = self.class.sanitize_sql_array([ "SELECT ST_IsValid(ST_GeomFromText(?, 4326))", geofence.as_text ])
    valid = self.class.connection.select_value(sql)
    errors.add(:geofence, "must not cross itself") unless valid
  end
end
