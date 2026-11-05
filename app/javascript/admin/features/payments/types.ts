export type TransactionStatus = "pending" | "completed" | "failed" | "refunded"

export const TRANSACTION_STATUSES: TransactionStatus[] = [
  "pending",
  "completed",
  "failed",
  "refunded",
]

/** Admin::PaymentMethodsController#payment_method_props (+ index extras) */
export interface PaymentMethodRow {
  id: number
  code: string
  name: string | null
  is_active: boolean
  created_at: string
  transactions_count: number
  revenue: number
}

export interface PaymentMethodDetail {
  id: number | null
  code: string
  name: string | null
  is_active: boolean
}

export interface PaymentMethodTranslation {
  language_id: number
  code: string
  language: string
  name: string | null
}

/** Fields posted by PaymentMethodForm as `payment_method[...]`. */
export interface PaymentMethodFormData {
  code: string
  is_active: boolean
  translations: Record<number, { name: string }>
}

/** Admin::PaymentTransactionsController#transaction_props */
export interface TransactionRow {
  id: number
  amount: number
  status: TransactionStatus
  reference: string | null
  payment_method: string
  booking_id: number | null
  customer: { id: number; full_name: string; email: string }
  created_at: string
}

export interface TransactionFilters {
  q: string | null
  status: TransactionStatus | null
  payment_method_id: string | null
}

export interface TransactionStats {
  collected: number
  refunded: number
  pending_count: number
  failed_count: number
}
