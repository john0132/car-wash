# frozen_string_literal: true

class CreateExtras < ActiveRecord::Migration[8.1]
  def change
    create_table :extras do |t|
      t.decimal :price, null: false, precision: 10, scale: 2
      t.boolean :is_active, null: false, default: true

      t.timestamps
    end
  end
end
