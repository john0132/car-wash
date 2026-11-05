# frozen_string_literal: true

class AddRoleAndIsActiveToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :role, :string, null: false, default: "customer"
    add_column :users, :is_active, :boolean, null: false, default: true
  end
end
