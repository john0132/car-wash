# frozen_string_literal: true

class CreatePackages < ActiveRecord::Migration[8.1]
  def change
    create_table :packages do |t|
      t.string :name, null: false
      t.text :description
      t.boolean :is_active, null: false, default: true
      t.decimal :price, null: false, precision: 10, scale: 2

      t.timestamps
    end
  end
end
