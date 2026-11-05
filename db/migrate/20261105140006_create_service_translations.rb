# frozen_string_literal: true

class CreateServiceTranslations < ActiveRecord::Migration[8.1]
  def change
    create_table :service_translations do |t|
      t.references :service, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :name, null: false
      t.string :seo_title
      t.text :seo_description
      t.string :seo_image_url

      t.timestamps
    end
    add_index :service_translations, %i[service_id language_id], unique: true,
      name: "index_service_translations_on_service_and_language"
  end
end
