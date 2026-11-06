# frozen_string_literal: true

# Public category pages are addressed by slug (/categories/exterior).
class AddSlugToServiceCategories < ActiveRecord::Migration[8.1]
  class MigrationCategory < ApplicationRecord
    self.table_name = "service_categories"
  end

  def up
    add_column :service_categories, :slug, :string

    taken = Set.new
    MigrationCategory.reset_column_information
    MigrationCategory.find_each do |category|
      name = select_value("SELECT t.name FROM service_category_translations t JOIN languages l ON l.id = t.language_id
                           WHERE t.service_category_id = #{category.id} ORDER BY (l.code = 'en') DESC, t.id LIMIT 1")
      base = name.to_s.parameterize.presence || "category"
      slug = base
      slug = "#{base}-#{category.id}" if taken.include?(slug)
      taken << slug
      category.update_columns(slug: slug)
    end

    change_column_null :service_categories, :slug, false
    add_index :service_categories, :slug, unique: true
  end

  def down
    remove_column :service_categories, :slug
  end
end
