# frozen_string_literal: true

class CreateBookingAddresses < ActiveRecord::Migration[8.1]
  def change
    create_table :booking_addresses do |t|
      t.references :booking, null: false, foreign_key: true, index: { unique: true }
      t.references :address, null: true, foreign_key: { on_delete: :nullify }
      t.string :name, null: false
      t.string :area_name, null: false
      t.string :city_name, null: false
      t.st_point :location, geographic: true, srid: 4326, null: false

      t.timestamps
    end

    add_index :booking_addresses, :location, using: :gist
  end
end
