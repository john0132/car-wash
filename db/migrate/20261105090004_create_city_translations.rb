# frozen_string_literal: true

class CreateCityTranslations < ActiveRecord::Migration[8.1]
  def change
    create_table :city_translations do |t|
      t.references :city, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :name, null: false

      t.timestamps
    end
    add_index :city_translations, %i[city_id language_id], unique: true, name: "index_city_translations_on_city_and_language"
  end
end
