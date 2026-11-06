# frozen_string_literal: true

# The payment methods checkout and the dashboard know about. Loaded by db/seeds.rb
# in every environment: checkout needs "cash" to exist. Looked up by code, so
# re-seeding never duplicates them or overwrites dashboard edits.

english = Language.find_or_create_by!(code: "en") { |l| l.name = "English" }
arabic = Language.find_or_create_by!(code: "ar") { |l| l.name = "العربية" }

[ [ "cash", "Cash", "نقدي" ], [ "card", "Card", "بطاقة" ], [ "wallet", "Wallet", "المحفظة" ] ].each do |code, en, ar|
  method = PaymentMethod.find_or_initialize_by(code: code)
  { english => en, arabic => ar }.each do |language, name|
    next if method.payment_method_translations.any? { |t| t.language_id == language.id }

    method.payment_method_translations.build(language: language, name: name)
  end
  method.save!
end
