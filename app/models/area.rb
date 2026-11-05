# frozen_string_literal: true

class Area < ApplicationRecord
  belongs_to :city
  has_many :area_translations, dependent: :destroy

  validates :rate, presence: true, numericality: { greater_than: 0 }

  # Uses ST_Covers (not ST_Contains with a ::geometry cast) so the geofence GiST index is used.
  scope :covering, ->(point) { where("ST_Covers(geofence, ?)", point) }
end
