# frozen_string_literal: true

class CreatePaymentMethods < ActiveRecord::Migration[8.1]
  def change
    create_table :payment_methods do |t|
      t.string :code, null: false
      t.boolean :is_active, null: false, default: true

      t.timestamps
    end
    add_index :payment_methods, :code, unique: true
  end
end
