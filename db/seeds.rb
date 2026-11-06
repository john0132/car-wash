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

# Development-only staff account for signing in at /admin/sign_in.
# Override with ADMIN_EMAIL / ADMIN_PASSWORD. Production admins must be created explicitly.
if Rails.env.development?
  admin = User.find_or_create_by!(email: ENV.fetch("ADMIN_EMAIL", "admin@example.com")) do |user|
    user.name = "Admin"
    user.password = ENV.fetch("ADMIN_PASSWORD", "password123456")
    user.role = :admin
  end
  admin.roles << super_admin unless admin.roles.include?(super_admin)

  # Demo catalog, customers, staff and bookings so the dashboard has something to show.
  load Rails.root.join("db/seeds/development.rb")
end
