# frozen_string_literal: true

class CreateMembershipTranslations < ActiveRecord::Migration[8.1]
  def change
    create_table :membership_translations do |t|
      t.references :membership, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description

      t.timestamps
    end
    add_index :membership_translations, %i[membership_id language_id], unique: true, name: "index_membership_translations_on_membership_and_language"
  end
end
