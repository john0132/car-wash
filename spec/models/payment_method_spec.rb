# frozen_string_literal: true

require "rails_helper"

RSpec.describe PaymentMethod, type: :model do
  it "is valid with a code" do
    expect(PaymentMethod.new(code: "credit_card")).to be_valid
  end

  it "requires a code" do
    expect(PaymentMethod.new).not_to be_valid
  end

  it "requires a unique code" do
    PaymentMethod.create!(code: "credit_card")
    expect(PaymentMethod.new(code: "credit_card")).not_to be_valid
  end

  it "defaults is_active to true" do
    payment_method = PaymentMethod.create!(code: "credit_card")
    expect(payment_method.is_active).to be(true)
  end
end
