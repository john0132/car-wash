# frozen_string_literal: true

class CreateServices < ActiveRecord::Migration[8.1]
  def change
    create_table :services do |t|
      t.references :service_category, null: false, foreign_key: true
      t.decimal :price, null: false, precision: 10, scale: 2
      t.decimal :sale_price, precision: 10, scale: 2
      t.boolean :is_active, null: false, default: true

      t.timestamps
    end
  end
end
