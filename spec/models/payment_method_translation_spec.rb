# frozen_string_literal: true

require "rails_helper"

RSpec.describe PaymentMethodTranslation, type: :model do
  # Has its English name already, so these build the Arabic one.
  let(:payment_method) { create_payment_method("credit_card") }
  let(:language) { arabic }

  it "is valid with a payment_method, language, and name" do
    expect(PaymentMethodTranslation.new(payment_method: payment_method, language: language, name: "Credit Card")).to be_valid
  end

  it "requires a name" do
    expect(PaymentMethodTranslation.new(payment_method: payment_method, language: language)).not_to be_valid
  end

  it "requires a unique language per payment_method" do
    PaymentMethodTranslation.create!(payment_method: payment_method, language: language, name: "Credit Card")
    duplicate = PaymentMethodTranslation.new(payment_method: payment_method, language: language, name: "Credit Card (duplicate)")
    expect(duplicate).not_to be_valid
  end
end
