# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_11_05_090008) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "postgis"

  create_table "area_translations", force: :cascade do |t|
    t.bigint "area_id", null: false
    t.bigint "language_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["area_id", "language_id"], name: "index_area_translations_on_area_and_language", unique: true
    t.index ["area_id"], name: "index_area_translations_on_area_id"
    t.index ["language_id"], name: "index_area_translations_on_language_id"
  end

  create_table "areas", force: :cascade do |t|
    t.bigint "city_id", null: false
    t.decimal "rate", precision: 10, scale: 2, null: false
    t.boolean "is_active", default: true, null: false
    t.geography "geofence", limit: {srid: 4326, type: "st_polygon", geographic: true}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["city_id"], name: "index_areas_on_city_id"
    t.index ["geofence"], name: "index_areas_on_geofence", using: :gist
  end

  create_table "cities", force: :cascade do |t|
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "city_translations", force: :cascade do |t|
    t.bigint "city_id", null: false
    t.bigint "language_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["city_id", "language_id"], name: "index_city_translations_on_city_and_language", unique: true
    t.index ["city_id"], name: "index_city_translations_on_city_id"
    t.index ["language_id"], name: "index_city_translations_on_language_id"
  end

  create_table "languages", force: :cascade do |t|
    t.string "code", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_languages_on_code", unique: true
  end

  create_table "membership_translations", force: :cascade do |t|
    t.bigint "membership_id", null: false
    t.bigint "language_id", null: false
    t.string "name", null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["language_id"], name: "index_membership_translations_on_language_id"
    t.index ["membership_id", "language_id"], name: "index_membership_translations_on_membership_and_language", unique: true
    t.index ["membership_id"], name: "index_membership_translations_on_membership_id"
  end

  create_table "memberships", force: :cascade do |t|
    t.boolean "is_active", default: true, null: false
    t.decimal "egp_to_points", precision: 10, scale: 2, null: false
    t.decimal "points_to_egp", precision: 10, scale: 2, null: false
    t.string "background_color", null: false
    t.string "text_color", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "payment_method_translations", force: :cascade do |t|
    t.bigint "payment_method_id", null: false
    t.bigint "language_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["language_id"], name: "index_payment_method_translations_on_language_id"
    t.index ["payment_method_id", "language_id"], name: "index_payment_method_translations_on_method_and_language", unique: true
    t.index ["payment_method_id"], name: "index_payment_method_translations_on_payment_method_id"
  end

  create_table "payment_methods", force: :cascade do |t|
    t.string "code", null: false
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_payment_methods_on_code", unique: true
  end

  create_table "payment_transactions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "payment_method_id", null: false
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.integer "status", default: 0, null: false
    t.string "reference"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["payment_method_id"], name: "index_payment_transactions_on_payment_method_id"
    t.index ["reference"], name: "index_payment_transactions_on_reference", unique: true
    t.index ["user_id"], name: "index_payment_transactions_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "user_agent"
    t.string "ip_address"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "subscriptions", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.boolean "is_active", default: true, null: false
    t.integer "discount_type", null: false
    t.decimal "discount_value", precision: 10, scale: 2, null: false
    t.decimal "price", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.boolean "verified", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "last_name"
    t.float "wallet", default: 0.0, null: false
    t.integer "points", default: 0, null: false
    t.integer "lifetime_points", default: 0, null: false
    t.bigint "membership_id"
    t.bigint "subscription_id"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["membership_id"], name: "index_users_on_membership_id"
    t.index ["subscription_id"], name: "index_users_on_subscription_id"
  end

  add_foreign_key "area_translations", "areas"
  add_foreign_key "area_translations", "languages"
  add_foreign_key "areas", "cities"
  add_foreign_key "city_translations", "cities"
  add_foreign_key "city_translations", "languages"
  add_foreign_key "membership_translations", "languages"
  add_foreign_key "membership_translations", "memberships"
  add_foreign_key "payment_method_translations", "languages"
  add_foreign_key "payment_method_translations", "payment_methods"
  add_foreign_key "payment_transactions", "payment_methods"
  add_foreign_key "payment_transactions", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "users", "memberships"
  add_foreign_key "users", "subscriptions"
end
