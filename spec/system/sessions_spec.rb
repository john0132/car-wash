# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Sessions", type: :system do
  fixtures :users

  it "signs in on the website and lands on the home page" do
    visit sign_in_path

    fill_in "Email address", with: users(:one).email
    fill_in "Password", with: "Secret1*3*5*"
    click_on "Log in"

    expect(page).to have_current_path(root_path)
    expect(page).to have_link("Account")
  end

  it "signs staff in to the admin dashboard" do
    visit admin_sign_in_path

    fill_in "Email address", with: users(:employee).email
    fill_in "Password", with: "Secret1*3*5*"
    click_on "Sign in"

    expect(page).to have_current_path(admin_root_path)
    expect(page).to have_text("Dashboard")
  end
end
