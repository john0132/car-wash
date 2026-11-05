# frozen_string_literal: true

class CreateCities < ActiveRecord::Migration[8.1]
  def change
    create_table :cities do |t|
      t.boolean :is_active, null: false, default: true

      t.timestamps
    end
  end
end
