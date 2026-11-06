# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin payment transactions", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }
  let(:customer) { users(:one) }
  let(:cash) { create_payment_method("cash") }
  let(:card) { create_payment_method("card") }

  before do
    cash.payment_transactions.create!(user: customer, amount: 100, status: :completed, reference: "TX-000001")
    card.payment_transactions.create!(user: users(:two), amount: 40, status: :refunded, reference: "TX-000002")
    card.payment_transactions.create!(user: users(:two), amount: 10, status: :failed, reference: "TX-000003")
  end

  describe "GET /admin/payment_transactions" do
    it "lists transactions with stats" do
      grant(admin, "payment_transactions.read")
      sign_in admin

      get admin_payment_transactions_path

      expect_inertia.to render_component("admin/payment_transactions/index")
      expect(inertia.props[:transactions].size).to eq(3)
      expect(inertia.props[:stats]).to include(collected: 100.0, refunded: 40.0, failed_count: 1, pending_count: 0)
    end

    it "filters by search, status and method" do
      grant(admin, "payment_transactions.read")
      sign_in admin

      get admin_payment_transactions_path, params: { q: "TX-000001" }
      expect(inertia.props[:transactions].pluck(:reference)).to eq([ "TX-000001" ])

      get admin_payment_transactions_path, params: { q: "another" }
      expect(inertia.props[:transactions].size).to eq(2)

      get admin_payment_transactions_path, params: { status: "failed" }
      expect(inertia.props[:transactions].pluck(:reference)).to eq([ "TX-000003" ])

      get admin_payment_transactions_path, params: { payment_method_id: cash.id }
      expect(inertia.props[:transactions].pluck(:reference)).to eq([ "TX-000001" ])
    end

    it "is forbidden without payment_transactions.read" do
      sign_in admin
      get admin_payment_transactions_path

      expect(response).to redirect_to(admin_root_path)
    end
  end

  describe "GET /admin/payment_transactions/:id" do
    it "shows a transaction" do
      grant(admin, "payment_transactions.read")
      transaction = PaymentTransaction.find_by!(reference: "TX-000001")
      sign_in admin

      get admin_payment_transaction_path(transaction)

      expect_inertia.to render_component("admin/payment_transactions/show")
      expect(inertia.props[:transaction]).to include(id: transaction.id, amount: 100.0, payment_method: "Cash")
    end
  end

  it "has no routes to change transactions" do
    expect { Rails.application.routes.recognize_path("/admin/payment_transactions/1", method: :patch) }
      .to raise_error(ActionController::RoutingError)
  end
end
