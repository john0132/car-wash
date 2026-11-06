# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin navigation", type: :system do
  fixtures :users

  let(:admin) { users(:admin) }

  it "shows only the sections the admin may read, without a documentation link" do
    grant(admin, "cities.read")
    sign_in admin

    visit admin_root_path

    within("[data-sidebar=sidebar]", match: :first) do
      expect(page).to have_link("Cities")
      expect(page).to have_no_link("Bookings")
      expect(page).to have_no_link("Documentation")
    end
  end
end
