# frozen_string_literal: true

class CreateAreaTranslations < ActiveRecord::Migration[8.1]
  def change
    create_table :area_translations do |t|
      t.references :area, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :name, null: false

      t.timestamps
    end
    add_index :area_translations, %i[area_id language_id], unique: true, name: "index_area_translations_on_area_and_language"
  end
end
