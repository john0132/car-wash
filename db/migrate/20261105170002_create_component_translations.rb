# frozen_string_literal: true

class CreateComponentTranslations < ActiveRecord::Migration[8.1]
  def change
    create_table :component_translations do |t|
      t.references :component, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description

      t.timestamps
    end
    add_index :component_translations, %i[component_id language_id], unique: true,
      name: "index_component_translations_on_component_and_language"
  end
end
