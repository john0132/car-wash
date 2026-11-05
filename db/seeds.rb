# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Development-only staff account for signing in at /admin/sign_in.
# Override with ADMIN_EMAIL / ADMIN_PASSWORD. Production admins must be created explicitly.
if Rails.env.development?
  User.find_or_create_by!(email: ENV.fetch("ADMIN_EMAIL", "admin@example.com")) do |user|
    user.name = "Admin"
    user.password = ENV.fetch("ADMIN_PASSWORD", "password123456")
    user.role = :admin
    user.verified = true
  end
end
