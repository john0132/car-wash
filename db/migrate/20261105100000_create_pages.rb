# frozen_string_literal: true

class CreatePages < ActiveRecord::Migration[8.1]
  def change
    create_table :pages do |t|
      t.string :slug, null: false
      t.boolean :is_active, null: false, default: true

      t.timestamps
    end
    add_index :pages, :slug, unique: true
  end
end
