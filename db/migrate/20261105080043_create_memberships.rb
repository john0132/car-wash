# frozen_string_literal: true

class CreateMemberships < ActiveRecord::Migration[8.1]
  def change
    create_table :memberships do |t|
      t.boolean :is_active, null: false, default: true
      t.decimal :egp_to_points, null: false, precision: 10, scale: 2
      t.decimal :points_to_egp, null: false, precision: 10, scale: 2
      t.string :background_color, null: false
      t.string :text_color, null: false

      t.timestamps
    end
  end
end
