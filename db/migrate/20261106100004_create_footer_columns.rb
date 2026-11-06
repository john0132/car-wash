# frozen_string_literal: true

class CreateFooterColumns < ActiveRecord::Migration[8.1]
  def change
    create_table :footer_columns do |t|
      t.references :footer, null: false, foreign_key: true
      t.integer :position, null: false, default: 0
      t.boolean :is_active, null: false, default: true

      t.timestamps
    end

    create_table :footer_column_translations do |t|
      t.references :footer_column, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :title, null: false

      t.timestamps
    end
    add_index :footer_column_translations, %i[footer_column_id language_id], unique: true,
      name: "index_footer_column_translations_on_column_and_language"
  end
end
