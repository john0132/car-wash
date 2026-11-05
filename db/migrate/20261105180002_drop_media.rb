# frozen_string_literal: true

class DropMedia < ActiveRecord::Migration[8.1]
  def change
    drop_table :media do |t|
      t.string :attachable_type, null: false
      t.bigint :attachable_id, null: false
      t.string :collection_name, null: false, default: "default"
      t.integer :position, null: false, default: 0
      t.string :name, null: false
      t.string :file_name, null: false
      t.string :extension, null: false
      t.string :content_type, null: false
      t.bigint :byte_size, null: false
      t.string :url, null: false
      t.timestamps

      t.index %i[attachable_type attachable_id collection_name], name: "index_media_on_attachable_and_collection"
      t.index %i[attachable_type attachable_id collection_name position], name: "index_media_on_attachable_collection_position"
    end
  end
end
