# frozen_string_literal: true

# The payment methods checkout and the dashboard know about. Loaded by db/seeds.rb
# in every environment: checkout needs "cash" to exist. Looked up by code, so
# re-seeding never duplicates them or overwrites dashboard edits.

english = Language.find_or_create_by!(code: "en") { |l| l.name = "English" }
arabic = Language.find_or_create_by!(code: "ar") { |l| l.name = "العربية" }

[ [ "cash", "Cash", "نقدي" ], [ "card", "Card", "بطاقة" ], [ "wallet", "Wallet", "المحفظة" ] ].each do |code, en, ar|
  method = PaymentMethod.find_or_create_by!(code: code)
  { english => en, arabic => ar }.each do |language, name|
    method.payment_method_translations.find_or_create_by!(language: language) { |t| t.name = name }
  end
end
