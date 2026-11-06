# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin payment methods", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }
  let!(:english) { Language.find_or_create_by!(code: "en") { |l| l.name = "English" } }
  let!(:cash) { create_payment_method("cash", name: "Cash") }

  describe "GET /admin/payment_methods" do
    it "lists methods with transaction counts and revenue" do
      grant(admin, "payment_methods.read")
      cash.payment_transactions.create!(user: users(:one), amount: 50, status: :completed)
      cash.payment_transactions.create!(user: users(:one), amount: 20, status: :failed)
      sign_in admin

      get admin_payment_methods_path

      expect_inertia.to render_component("admin/payment_methods/index")
      expect(inertia.props[:payment_methods].first).to include(code: "cash", name: "Cash", transactions_count: 2, revenue: 50.0)
    end

    it "is forbidden without payment_methods.read" do
      sign_in admin
      get admin_payment_methods_path

      expect(response).to redirect_to(admin_root_path)
    end
  end

  describe "POST /admin/payment_methods" do
    it "creates a method with translations" do
      grant(admin, "payment_methods.create")
      sign_in admin

      expect {
        post admin_payment_methods_path, params: {
          payment_method: { code: "Credit Card", is_active: true, translations: { english.id => { name: "Card" } } }
        }
      }.to change(PaymentMethod, :count).by(1)

      method = PaymentMethod.find_by!(code: "credit_card")
      expect(method.translation.name).to eq("Card")
      expect(response).to redirect_to(admin_payment_methods_path)
    end

    it "requires an English name" do
      grant(admin, "payment_methods.create")
      sign_in admin

      expect {
        post admin_payment_methods_path, params: {
          payment_method: { code: "wallet", translations: { english.id => { name: "" }, arabic.id => { name: "المحفظة" } } }
        }
      }.not_to change(PaymentMethod, :count)

      expect(response).to redirect_to(new_admin_payment_method_path)
      expect(session[:inertia_errors]).to include(translations: [ "must include a name in English" ])
    end

    it "is forbidden with read-only access" do
      grant(admin, "payment_methods.read")
      sign_in admin

      expect {
        post admin_payment_methods_path, params: { payment_method: { code: "x", translations: { english.id => { name: "X" } } } }
      }.not_to change(PaymentMethod, :count)
    end
  end

  describe "PATCH /admin/payment_methods/:id" do
    it "renames a method" do
      grant(admin, "payment_methods.update")
      sign_in admin

      patch admin_payment_method_path(cash), params: {
        payment_method: { code: "cash", is_active: true, translations: { english.id => { name: "Cash on delivery" } } }
      }

      expect(cash.reload.translation.name).to eq("Cash on delivery")
    end
  end

  describe "PATCH /admin/payment_methods/:id/activation" do
    it "disables a method" do
      grant(admin, "payment_methods.update")
      sign_in admin

      patch activation_admin_payment_method_path(cash), params: { is_active: false }
      expect(cash.reload.is_active).to be(false)
    end
  end

  it "has no routes to delete methods" do
    expect { Rails.application.routes.recognize_path("/admin/payment_methods/1", method: :delete) }
      .to raise_error(ActionController::RoutingError)
  end
end
