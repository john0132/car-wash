# frozen_string_literal: true

class AddBookingToPaymentTransactions < ActiveRecord::Migration[8.1]
  def change
    add_reference :payment_transactions, :booking, foreign_key: true
  end
end
