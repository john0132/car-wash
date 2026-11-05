# frozen_string_literal: true

class CreateAddresses < ActiveRecord::Migration[8.1]
  def change
    create_table :addresses do |t|
      t.references :user, null: false, foreign_key: true
      t.references :area, null: false, foreign_key: true
      t.string :name, null: false
      t.st_point :location, geographic: true, srid: 4326, null: false

      t.timestamps
    end
    add_index :addresses, :location, using: :gist
  end
end
