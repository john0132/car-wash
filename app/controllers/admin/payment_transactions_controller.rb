# frozen_string_literal: true

# Read-only ledger of every payment: booking payments, refunds and wallet top-ups.
class Admin::PaymentTransactionsController < Admin::BaseController
  include Admin::Pagination

  after_action :verify_authorized

  def index
    authorize PaymentTransaction

    scope = PaymentTransaction.search(params[:q]).with_status(params[:status])
    scope = scope.where(payment_method_id: params[:payment_method_id]) if params[:payment_method_id].present?

    transactions, pagination = paginate(scope.includes(:user, payment_method: :payment_method_translations).order(created_at: :desc, id: :desc))

    render inertia: {
      transactions: transactions.map { |transaction| transaction_props(transaction) },
      filters: {
        q: params[:q].presence,
        status: params[:status].presence,
        payment_method_id: params[:payment_method_id].presence
      },
      payment_method_options: PaymentMethod.includes(:payment_method_translations).order(:id).map { |m|
        { id: m.id, name: m.translation&.name || m.code }
      },
      stats: stats_for(scope),
      pagination: pagination
    }
  end

  def show
    transaction = PaymentTransaction.includes(:user, :booking, payment_method: :payment_method_translations).find(params[:id])
    authorize transaction

    render inertia: {
      transaction: transaction_props(transaction).merge(updated_at: transaction.updated_at),
      booking: transaction.booking&.then { |b|
        { id: b.id, status: b.status, payment_status: b.payment_status, total_amount: b.total_amount.to_f,
          scheduled_at: b.scheduled_at }
      }
    }
  end

  private

  def stats_for(scope)
    amounts = scope.reorder(nil).group(:status).sum(:amount)
    counts = scope.reorder(nil).group(:status).count

    {
      collected: amounts.fetch("completed", 0).to_f,
      refunded: amounts.fetch("refunded", 0).to_f,
      pending_count: counts.fetch("pending", 0),
      failed_count: counts.fetch("failed", 0)
    }
  end

  def transaction_props(transaction)
    {
      id: transaction.id,
      amount: transaction.amount.to_f,
      status: transaction.status,
      reference: transaction.reference,
      payment_method: transaction.payment_method.translation&.name || transaction.payment_method.code,
      booking_id: transaction.booking_id,
      customer: { id: transaction.user.id, full_name: transaction.user.full_name, email: transaction.user.email },
      created_at: transaction.created_at
    }
  end
end
