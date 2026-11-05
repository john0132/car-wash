# frozen_string_literal: true

# An ordered instance of a Component on a Page. `settings` holds the values of
# the component's non-translatable fields; translatable ones live in page_section_translations.
class CreatePageSections < ActiveRecord::Migration[8.1]
  def change
    create_table :page_sections do |t|
      t.references :page, null: false, foreign_key: true
      t.references :component, null: false, foreign_key: true
      t.integer :position, null: false, default: 0
      t.boolean :is_active, null: false, default: true
      t.jsonb :settings, null: false, default: {}

      t.timestamps
    end
    add_index :page_sections, %i[page_id position]
  end
end
