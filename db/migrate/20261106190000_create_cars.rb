class CreateCars < ActiveRecord::Migration[8.1]
  def change
    create_table :cars do |t|
      t.references :user, null: false, foreign_key: true
      t.string :make, null: false
      t.string :model, null: false
      t.string :license_plate, null: false
      t.string :color, null: false

      t.timestamps
    end

    add_index :cars, :license_plate
  end
end
