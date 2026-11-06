# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin multilingual forms", type: :system do
  fixtures :users

  let(:admin) { users(:admin) }

  before do
    english
    arabic
    grant(admin, "cities.read", "cities.create", "cities.update")
    sign_in admin
  end

  it "flags the default language when only another language is filled in" do
    visit new_admin_city_path

    click_on "Arabic"
    fill_in "name_ar", with: "الإسكندرية"
    click_on "Create city"

    expect(page).to have_text("must include a name in English")
    expect(page).to have_css("[role=tab][data-state=active]", text: "English")
    expect(page).to have_css("[role=tab]", text: "English")
    expect(page).to have_css("[role=tab] .sr-only", text: "(has errors)", visible: :all)
  end

  it "keeps values typed in each language when switching tabs" do
    visit new_admin_city_path

    fill_in "name_en", with: "Alexandria"
    click_on "Arabic"
    fill_in "name_ar", with: "الإسكندرية"
    click_on "English"

    expect(page).to have_field("name_en", with: "Alexandria")
    click_on "Arabic"
    expect(page).to have_field("name_ar", with: "الإسكندرية")
  end

  it "saves every language" do
    visit new_admin_city_path

    fill_in "name_en", with: "Alexandria"
    click_on "Arabic"
    fill_in "name_ar", with: "الإسكندرية"
    click_on "Create city"

    expect(page).to have_text("Alexandria")
    expect(City.last.city_translations.map(&:name)).to contain_exactly("Alexandria", "الإسكندرية")
  end
end
