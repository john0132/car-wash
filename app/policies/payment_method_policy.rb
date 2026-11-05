# frozen_string_literal: true

# Methods are never deleted (transactions reference them), only disabled via update.
class PaymentMethodPolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")
  def create? = permit?("create")
  def update? = permit?("update")

  private

  def resource_name = "payment_methods"
end
