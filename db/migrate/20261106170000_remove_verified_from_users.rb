# frozen_string_literal: true

# Email confirmation is gone, so the flag that tracked it is too.
class RemoveVerifiedFromUsers < ActiveRecord::Migration[8.1]
  def change
    remove_column :users, :verified, :boolean, default: false, null: false
  end
end
