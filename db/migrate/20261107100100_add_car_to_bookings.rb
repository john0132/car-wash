class AddCarToBookings < ActiveRecord::Migration[8.1]
  def change
    # Nullable: older bookings have no car, and deleting a car keeps its bookings.
    add_reference :bookings, :car, foreign_key: { on_delete: :nullify }
    # What the car was at booking time ("Toyota Corolla · White · ABC 123"), so the
    # booking still reads right after the customer edits or deletes the car.
    add_column :bookings, :car_description, :string
  end
end
