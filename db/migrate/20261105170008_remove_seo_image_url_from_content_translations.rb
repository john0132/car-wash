# frozen_string_literal: true

# SEO images are now ActiveStorage attachments (`has_one_attached :seo_image`).
class RemoveSeoImageUrlFromContentTranslations < ActiveRecord::Migration[8.1]
  def change
    remove_column :blog_translations, :seo_image_url, :string
    remove_column :page_translations, :seo_image_url, :string
  end
end
