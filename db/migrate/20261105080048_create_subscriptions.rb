# frozen_string_literal: true

class CreateSubscriptions < ActiveRecord::Migration[8.1]
  def change
    create_table :subscriptions do |t|
      t.string :name, null: false
      t.text :description
      t.boolean :is_active, null: false, default: true
      t.integer :discount_type, null: false
      t.decimal :discount_value, null: false, precision: 10, scale: 2
      t.decimal :price, null: false, precision: 10, scale: 2

      t.timestamps
    end
  end
end
