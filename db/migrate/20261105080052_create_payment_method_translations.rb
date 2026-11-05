# frozen_string_literal: true

class CreatePaymentMethodTranslations < ActiveRecord::Migration[8.1]
  def change
    create_table :payment_method_translations do |t|
      t.references :payment_method, null: false, foreign_key: true
      t.references :language, null: false, foreign_key: true
      t.string :name, null: false

      t.timestamps
    end
    add_index :payment_method_translations, %i[payment_method_id language_id], unique: true, name: "index_payment_method_translations_on_method_and_language"
  end
end
