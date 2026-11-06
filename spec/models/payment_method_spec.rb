# frozen_string_literal: true

require "rails_helper"

RSpec.describe PaymentMethod, type: :model do
  def build_payment_method(code = "credit_card")
    PaymentMethod.new(code: code).tap do |method|
      method.payment_method_translations.build(language: english, name: "Credit card")
    end
  end

  it "is valid with a code and an English name" do
    expect(build_payment_method).to be_valid
  end

  it "requires a code" do
    expect(build_payment_method(nil)).not_to be_valid
  end

  it "requires a unique code" do
    create_payment_method("credit_card")
    expect(build_payment_method("credit_card")).not_to be_valid
  end

  it "requires a name in the default language" do
    english # the rule only applies once the default language exists
    method = PaymentMethod.new(code: "credit_card")
    method.payment_method_translations.build(language: arabic, name: "بطاقة")

    expect(method).not_to be_valid
    expect(method.errors[:translations]).to eq([ "must include a name in English" ])
  end

  it "defaults is_active to true" do
    expect(create_payment_method("credit_card").is_active).to be(true)
  end
end
