# frozen_string_literal: true

class CreateBlogTranslations < ActiveRecord::Migration[8.1]
  def change
    create_table :blog_translations do |t|
      t.references :blog, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :name, null: false
      t.string :title, null: false
      t.string :subtitle
      t.text :body
      t.string :seo_title
      t.text :seo_description
      t.string :seo_image_url

      t.timestamps
    end
    add_index :blog_translations, %i[blog_id language_id], unique: true, name: "index_blog_translations_on_blog_and_language"
  end
end
