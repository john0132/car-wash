# frozen_string_literal: true

class CreateServiceCategoryTranslations < ActiveRecord::Migration[8.1]
  def change
    create_table :service_category_translations do |t|
      t.references :service_category, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :name, null: false
      t.string :seo_title
      t.text :seo_description
      t.string :seo_image_url

      t.timestamps
    end
    add_index :service_category_translations, %i[service_category_id language_id], unique: true,
      name: "index_service_category_translations_on_category_and_language"
  end
end
