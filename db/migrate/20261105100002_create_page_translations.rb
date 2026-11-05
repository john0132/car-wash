# frozen_string_literal: true

class CreatePageTranslations < ActiveRecord::Migration[8.1]
  def change
    create_table :page_translations do |t|
      t.references :page, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :name, null: false
      t.string :title, null: false
      t.string :subtitle
      t.string :seo_title
      t.text :seo_description
      t.string :seo_image_url

      t.timestamps
    end
    add_index :page_translations, %i[page_id language_id], unique: true, name: "index_page_translations_on_page_and_language"
  end
end
