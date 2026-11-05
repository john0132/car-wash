# frozen_string_literal: true

class CreateBlogs < ActiveRecord::Migration[8.1]
  def change
    create_table :blogs do |t|
      t.string :slug, null: false
      t.boolean :is_active, null: false, default: true

      t.timestamps
    end
    add_index :blogs, :slug, unique: true
  end
end
