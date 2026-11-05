# frozen_string_literal: true

class CreateBookings < ActiveRecord::Migration[8.1]
  def change
    create_table :bookings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :package, foreign_key: true
      t.decimal :subtotal, null: false, precision: 10, scale: 2, default: 0
      t.decimal :extras_total, null: false, precision: 10, scale: 2, default: 0
      t.decimal :discounts, null: false, precision: 10, scale: 2, default: 0
      t.decimal :total_amount, null: false, precision: 10, scale: 2, default: 0
      t.integer :status, null: false, default: 0
      t.integer :payment_status, null: false, default: 0

      t.timestamps
    end
  end
end
