# frozen_string_literal: true

# Bookings are created by customers at checkout, never from the dashboard, and
# never deleted. The dashboard can only read them and update status/assignment.
class BookingPolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")
  def update? = permit?("update")
  def edit? = update?

  private

  def resource_name = "bookings"
end
