# frozen_string_literal: true

class CreatePaymentTransactions < ActiveRecord::Migration[8.1]
  def change
    create_table :payment_transactions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :payment_method, null: false, foreign_key: true
      t.decimal :amount, null: false, precision: 10, scale: 2
      t.integer :status, null: false, default: 0
      t.string :reference

      t.timestamps
    end
    add_index :payment_transactions, :reference, unique: true
  end
end
