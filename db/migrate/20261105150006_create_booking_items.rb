# frozen_string_literal: true

class CreateBookingItems < ActiveRecord::Migration[8.1]
  def change
    create_table :booking_items do |t|
      t.references :booking, null: false, foreign_key: true
      t.string :itemable_type, null: false
      t.bigint :itemable_id, null: false
      t.integer :quantity, null: false, default: 1
      t.decimal :price, null: false, precision: 10, scale: 2

      t.timestamps
    end

    add_index :booking_items, %i[itemable_type itemable_id]
  end
end
