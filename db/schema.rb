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

ActiveRecord::Schema[8.1].define(version: 2026_11_05_140006) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "postgis"

  create_table "addresses", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "area_id", null: false
    t.string "name", null: false
    t.geography "location", limit: {srid: 4326, type: "st_point", geographic: true}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["area_id"], name: "index_addresses_on_area_id"
    t.index ["location"], name: "index_addresses_on_location", using: :gist
    t.index ["user_id"], name: "index_addresses_on_user_id"
  end

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

  create_table "blog_translations", force: :cascade do |t|
    t.bigint "blog_id", null: false
    t.bigint "language_id", null: false
    t.string "name", null: false
    t.string "title", null: false
    t.string "subtitle"
    t.text "body"
    t.string "seo_title"
    t.text "seo_description"
    t.string "seo_image_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["blog_id", "language_id"], name: "index_blog_translations_on_blog_and_language", unique: true
    t.index ["blog_id"], name: "index_blog_translations_on_blog_id"
    t.index ["language_id"], name: "index_blog_translations_on_language_id"
  end

  create_table "blogs", force: :cascade do |t|
    t.string "slug", null: false
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_blogs_on_slug", unique: true
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

  create_table "media", force: :cascade do |t|
    t.string "attachable_type", null: false
    t.bigint "attachable_id", null: false
    t.string "collection_name", default: "default", null: false
    t.integer "position", default: 0, null: false
    t.string "name", null: false
    t.string "file_name", null: false
    t.string "extension", null: false
    t.string "content_type", null: false
    t.bigint "byte_size", null: false
    t.string "url", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["attachable_type", "attachable_id", "collection_name", "position"], name: "index_media_on_attachable_collection_position"
    t.index ["attachable_type", "attachable_id", "collection_name"], name: "index_media_on_attachable_and_collection"
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

  create_table "packages", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.boolean "is_active", default: true, null: false
    t.decimal "price", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "page_translations", force: :cascade do |t|
    t.bigint "page_id", null: false
    t.bigint "language_id", null: false
    t.string "name", null: false
    t.string "title", null: false
    t.string "subtitle"
    t.string "seo_title"
    t.text "seo_description"
    t.string "seo_image_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["language_id"], name: "index_page_translations_on_language_id"
    t.index ["page_id", "language_id"], name: "index_page_translations_on_page_and_language", unique: true
    t.index ["page_id"], name: "index_page_translations_on_page_id"
  end

  create_table "pages", force: :cascade do |t|
    t.string "slug", null: false
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_pages_on_slug", unique: true
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

  create_table "permissions", force: :cascade do |t|
    t.string "resource", null: false
    t.string "action", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["resource", "action"], name: "index_permissions_on_resource_and_action", unique: true
  end

  create_table "role_permissions", force: :cascade do |t|
    t.bigint "role_id", null: false
    t.bigint "permission_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["permission_id"], name: "index_role_permissions_on_permission_id"
    t.index ["role_id", "permission_id"], name: "index_role_permissions_on_role_id_and_permission_id", unique: true
    t.index ["role_id"], name: "index_role_permissions_on_role_id"
  end

  create_table "roles", force: :cascade do |t|
    t.string "name", null: false
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_roles_on_name", unique: true
  end

  create_table "service_categories", force: :cascade do |t|
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "service_category_translations", force: :cascade do |t|
    t.bigint "service_category_id", null: false
    t.bigint "language_id", null: false
    t.string "name", null: false
    t.string "seo_title"
    t.text "seo_description"
    t.string "seo_image_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["language_id"], name: "index_service_category_translations_on_language_id"
    t.index ["service_category_id", "language_id"], name: "index_service_category_translations_on_category_and_language", unique: true
    t.index ["service_category_id"], name: "index_service_category_translations_on_service_category_id"
  end

  create_table "service_translations", force: :cascade do |t|
    t.bigint "service_id", null: false
    t.bigint "language_id", null: false
    t.string "name", null: false
    t.string "seo_title"
    t.text "seo_description"
    t.string "seo_image_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["language_id"], name: "index_service_translations_on_language_id"
    t.index ["service_id", "language_id"], name: "index_service_translations_on_service_and_language", unique: true
    t.index ["service_id"], name: "index_service_translations_on_service_id"
  end

  create_table "services", force: :cascade do |t|
    t.bigint "service_category_id", null: false
    t.decimal "price", precision: 10, scale: 2, null: false
    t.decimal "sale_price", precision: 10, scale: 2
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["service_category_id"], name: "index_services_on_service_category_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "user_agent"
    t.string "ip_address"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "user_roles", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "role_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["role_id"], name: "index_user_roles_on_role_id"
    t.index ["user_id", "role_id"], name: "index_user_roles_on_user_id_and_role_id", unique: true
    t.index ["user_id"], name: "index_user_roles_on_user_id"
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
    t.bigint "package_id"
    t.string "role", default: "customer", null: false
    t.boolean "is_active", default: true, null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["membership_id"], name: "index_users_on_membership_id"
    t.index ["package_id"], name: "index_users_on_package_id"
  end

  add_foreign_key "addresses", "areas"
  add_foreign_key "addresses", "users"
  add_foreign_key "area_translations", "areas"
  add_foreign_key "area_translations", "languages"
  add_foreign_key "areas", "cities"
  add_foreign_key "blog_translations", "blogs"
  add_foreign_key "blog_translations", "languages"
  add_foreign_key "city_translations", "cities"
  add_foreign_key "city_translations", "languages"
  add_foreign_key "membership_translations", "languages"
  add_foreign_key "membership_translations", "memberships"
  add_foreign_key "page_translations", "languages"
  add_foreign_key "page_translations", "pages"
  add_foreign_key "payment_method_translations", "languages"
  add_foreign_key "payment_method_translations", "payment_methods"
  add_foreign_key "payment_transactions", "payment_methods"
  add_foreign_key "payment_transactions", "users"
  add_foreign_key "role_permissions", "permissions"
  add_foreign_key "role_permissions", "roles"
  add_foreign_key "service_category_translations", "languages"
  add_foreign_key "service_category_translations", "service_categories"
  add_foreign_key "service_translations", "languages"
  add_foreign_key "service_translations", "services"
  add_foreign_key "services", "service_categories"
  add_foreign_key "sessions", "users"
  add_foreign_key "user_roles", "roles"
  add_foreign_key "user_roles", "users"
  add_foreign_key "users", "memberships"
  add_foreign_key "users", "packages"
end
