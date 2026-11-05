# frozen_string_literal: true

class CreateExtraTranslations < ActiveRecord::Migration[8.1]
  def change
    create_table :extra_translations do |t|
      t.references :extra, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :name, null: false

      t.timestamps
    end

    add_index :extra_translations, %i[extra_id language_id], unique: true,
      name: "index_extra_translations_on_extra_and_language"
  end
end
