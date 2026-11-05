# frozen_string_literal: true

class AddProfileAndWalletFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :last_name, :string
    add_column :users, :wallet, :float, null: false, default: 0.0
    add_column :users, :points, :integer, null: false, default: 0
    add_column :users, :lifetime_points, :integer, null: false, default: 0
    add_reference :users, :membership, foreign_key: true
    add_reference :users, :subscription, foreign_key: true
  end
end
