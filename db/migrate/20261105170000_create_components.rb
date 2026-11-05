# frozen_string_literal: true

# Staff-defined page component types. `fields` is the schema (see ComponentSchema).
class CreateComponents < ActiveRecord::Migration[8.1]
  def change
    create_table :components do |t|
      t.string :key, null: false
      t.boolean :is_active, null: false, default: true
      t.jsonb :fields, null: false, default: []

      t.timestamps
    end
    add_index :components, :key, unique: true
  end
end
