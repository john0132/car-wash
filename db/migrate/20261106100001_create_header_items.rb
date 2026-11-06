# frozen_string_literal: true

class CreateHeaderItems < ActiveRecord::Migration[8.1]
  def change
    create_table :header_items do |t|
      t.integer :position, null: false, default: 0
      t.boolean :is_active, null: false, default: true
      t.string :link_type, null: false, default: "page"
      t.references :page, foreign_key: true
      t.string :route_key
      t.string :url
      t.boolean :open_in_new_tab, null: false, default: false

      t.timestamps
    end

    add_index :header_items, :position
  end
end
