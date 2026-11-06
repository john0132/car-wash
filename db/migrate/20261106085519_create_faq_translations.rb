# frozen_string_literal: true

class CreateFaqTranslations < ActiveRecord::Migration[8.1]
  def change
    create_table :faq_translations do |t|
      t.references :faq, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :question, null: false
      t.text :answer, null: false

      t.timestamps
    end

    add_index :faq_translations, %i[faq_id language_id], unique: true,
      name: "index_faq_translations_on_faq_and_language"
  end
end
