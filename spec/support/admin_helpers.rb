# frozen_string_literal: true

module AdminHelpers
  # Gives an admin a role holding exactly `keys` ("resource.action").
  def grant(user, *keys)
    role = Role.create!(name: "role-#{SecureRandom.hex(4)}")
    keys.each do |key|
      resource, action = key.split(".")
      role.permissions << Permission.find_or_create_by!(resource: resource, action: action)
    end
    user.roles << role
    user
  end
end

RSpec.configure do |config|
  config.include AdminHelpers, type: :request
  config.include AdminHelpers, type: :system
end
