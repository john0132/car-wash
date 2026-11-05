# frozen_string_literal: true

require "rails_helper"

RSpec.describe PaymentTransaction, type: :model do
  let(:user) { User.create!(name: "Jane", email: "jane@example.com", password: "a-very-long-password") }
  let(:payment_method) { PaymentMethod.create!(code: "credit_card") }

  it "is valid with a user, payment_method, and amount" do
    expect(PaymentTransaction.new(user: user, payment_method: payment_method, amount: 10)).to be_valid
  end

  it "requires an amount greater than 0" do
    expect(PaymentTransaction.new(user: user, payment_method: payment_method, amount: 0)).not_to be_valid
  end

  it "defaults status to pending" do
    transaction = PaymentTransaction.create!(user: user, payment_method: payment_method, amount: 10)
    expect(transaction.status).to eq("pending")
  end
end
