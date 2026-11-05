# frozen_string_literal: true

class CreateAreas < ActiveRecord::Migration[8.1]
  def change
    create_table :areas do |t|
      t.references :city, null: false, foreign_key: true
      t.decimal :rate, null: false, precision: 10, scale: 2
      t.boolean :is_active, null: false, default: true
      t.st_polygon :geofence, geographic: true, srid: 4326

      t.timestamps
    end
    add_index :areas, :geofence, using: :gist
  end
end
