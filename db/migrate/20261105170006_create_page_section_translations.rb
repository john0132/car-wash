# frozen_string_literal: true

class CreatePageSectionTranslations < ActiveRecord::Migration[8.1]
  def change
    create_table :page_section_translations do |t|
      t.references :page_section, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.jsonb :content, null: false, default: {}

      t.timestamps
    end
    add_index :page_section_translations, %i[page_section_id language_id], unique: true,
      name: "index_page_section_translations_on_section_and_language"
  end
end
