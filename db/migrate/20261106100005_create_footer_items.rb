# frozen_string_literal: true

class CreateFooterItems < ActiveRecord::Migration[8.1]
  def change
    create_table :footer_items do |t|
      t.references :footer_column, null: false, foreign_key: true
      t.integer :position, null: false, default: 0
      t.boolean :is_active, null: false, default: true
      t.string :link_type, null: false, default: "page"
      t.references :page, foreign_key: true
      t.string :route_key
      t.string :url
      t.boolean :open_in_new_tab, null: false, default: false

      t.timestamps
    end

    create_table :footer_item_translations do |t|
      t.references :footer_item, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :label, null: false

      t.timestamps
    end
    add_index :footer_item_translations, %i[footer_item_id language_id], unique: true,
      name: "index_footer_item_translations_on_item_and_language"
  end
end
