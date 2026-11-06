# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Website error pages", type: :system do
  it "shows the branded page, with a way back, for a service that is gone" do
    visit service_path("no-such-service")

    expect(page).to have_css("h1", text: "Page not found")
    expect(page).to have_link("Browse our services")
    click_on "Back to the homepage"
    expect(page).to have_current_path(root_path)
  end
end
