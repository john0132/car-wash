# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Every environment: the dashboard permission catalog and the role that holds all of it.
# Admins only get permissions through roles, so assign this role to the first production admin.
super_admin = Role.super_admin!

# Every environment: starter page components (hero, rich text, CTA, features).
load Rails.root.join("db/seeds/components.rb")

# Every environment: the public homepage, built from the components above.
load Rails.root.join("db/seeds/pages.rb")

# Every environment: the website header links and footer.
load Rails.root.join("db/seeds/site_chrome.rb")

# Every environment: starter FAQs for the /faqs page.
load Rails.root.join("db/seeds/faqs.rb")

# Every environment: the contact us page and its header/footer links (after the pages and site chrome).
load Rails.root.join("db/seeds/contact.rb")

# Every environment: example blog posts.
load Rails.root.join("db/seeds/blogs.rb")

# Every environment: Arabic versions of the starter content above (header/footer links, home and
# about pages, FAQs, blog posts), for the /ar site. Must come after the English content it translates.
load Rails.root.join("db/seeds/arabic.rb")

# Every environment: payment methods (checkout books with "cash").
load Rails.root.join("db/seeds/payment_methods.rb")

# Super Admin account for signing in at /admin/sign_in. Development falls back to admin@example.com /
# password123456; other environments create it only when ADMIN_EMAIL and ADMIN_PASSWORD are both set.
# Only a new account gets the password, so re-seeding never resets it.
admin_email = ENV["ADMIN_EMAIL"].presence || ("admin@example.com" if Rails.env.development?)
admin_password = ENV["ADMIN_PASSWORD"].presence || ("password123456" if Rails.env.development?)
if admin_email.present? != admin_password.present?
  abort "Set both ADMIN_EMAIL and ADMIN_PASSWORD to create the admin account, or neither."
elsif admin_email
  admin = User.find_or_create_by!(email: admin_email) do |user|
    user.name = "Admin"
    user.password = admin_password
    user.role = :admin
  end
  admin.roles << super_admin unless admin.roles.include?(super_admin)
end

# Demo catalog with photos, customers, staff, bookings and messages, so the site and the dashboard have
# something to show. Always loaded in development; elsewhere only with SEED_DEMO=1 (e.g. a portfolio deploy).
if Rails.env.development? || ActiveModel::Type::Boolean.new.cast(ENV["SEED_DEMO"])
  load Rails.root.join("db/seeds/demo.rb")
end
