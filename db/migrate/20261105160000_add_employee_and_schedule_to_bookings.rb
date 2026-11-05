# frozen_string_literal: true

class AddEmployeeAndScheduleToBookings < ActiveRecord::Migration[8.1]
  def change
    add_reference :bookings, :employee, index: false, foreign_key: { to_table: :users, on_delete: :nullify }
    add_column :bookings, :scheduled_at, :datetime
    add_index :bookings, [ :employee_id, :status ]
  end
end
