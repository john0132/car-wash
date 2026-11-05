# frozen_string_literal: true

class AddPositionToActiveStorageAttachments < ActiveRecord::Migration[8.1]
  def change
    add_column :active_storage_attachments, :position, :integer, default: 0, null: false
  end
end
