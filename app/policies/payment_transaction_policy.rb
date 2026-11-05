# frozen_string_literal: true

# Transactions are a financial record: the dashboard can only read them.
class PaymentTransactionPolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")

  private

  def resource_name = "payment_transactions"
end
