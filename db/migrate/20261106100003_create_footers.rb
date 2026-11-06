# frozen_string_literal: true

class CreateFooters < ActiveRecord::Migration[8.1]
  def change
    create_table :footers do |t|
      t.timestamps
    end

    create_table :footer_translations do |t|
      t.references :footer, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :title
      t.text :description

      t.timestamps
    end
    add_index :footer_translations, %i[footer_id language_id], unique: true,
      name: "index_footer_translations_on_footer_and_language"

    create_table :footer_social_links do |t|
      t.references :footer, null: false, foreign_key: true
      t.integer :position, null: false, default: 0
      t.boolean :is_active, null: false, default: true
      t.string :name, null: false
      t.string :url, null: false

      t.timestamps
    end
  end
end
