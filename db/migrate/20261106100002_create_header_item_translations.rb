# frozen_string_literal: true

class CreateHeaderItemTranslations < ActiveRecord::Migration[8.1]
  def change
    create_table :header_item_translations do |t|
      t.references :header_item, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :label, null: false

      t.timestamps
    end

    add_index :header_item_translations, %i[header_item_id language_id], unique: true,
      name: "index_header_item_translations_on_item_and_language"
  end
end
