# frozen_string_literal: true

# Public service pages are addressed by slug (/services/exterior-wash).
class AddSlugToServices < ActiveRecord::Migration[8.1]
  class MigrationService < ApplicationRecord
    self.table_name = "services"
  end

  def up
    add_column :services, :slug, :string

    taken = Set.new
    MigrationService.reset_column_information
    MigrationService.find_each do |service|
      name = select_value("SELECT t.name FROM service_translations t JOIN languages l ON l.id = t.language_id
                           WHERE t.service_id = #{service.id} ORDER BY (l.code = 'en') DESC, t.id LIMIT 1")
      base = name.to_s.parameterize.presence || "service"
      slug = base
      slug = "#{base}-#{service.id}" if taken.include?(slug)
      taken << slug
      service.update_columns(slug: slug)
    end

    change_column_null :services, :slug, false
    add_index :services, :slug, unique: true
  end

  def down
    remove_column :services, :slug
  end
end
