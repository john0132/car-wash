# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Browsing the catalog", type: :system do
  let!(:category) { create_service_category("Exterior") }

  before do
    # 11 services: one more page than ServiceCategoriesController::PER_PAGE (9).
    11.times { |i| create_service("Wash #{format('%02d', i + 1)}", service_category: category, price: 100 + i) }
  end

  it "keeps search, sort and pagination in the URL and in step with the results" do
    visit service_category_path(category.slug)
    expect(page).to have_text("Showing 1–9 of 11 services")

    find("a[aria-label='Page 2']").click
    expect(page).to have_current_path(/page=2/)
    expect(page).to have_text("Showing 10–11 of 11 services")

    visit service_category_path(category.slug)
    fill_in "Search services", with: "Wash 07"
    expect(page).to have_current_path(/q=Wash/)
    expect(page).to have_text("Showing 1–1 of 1 service")
    expect(page).to have_css("h3", text: "Wash 07")

    click_on "Clear all"
    expect(page).to have_no_current_path(/q=/)
    expect(page).to have_text("Showing 1–9 of 11 services")
  end

  it "sorts by price and lets Back undo the choice" do
    visit service_category_path(category.slug)
    pick_option("[aria-labelledby=sort-label]", "Price: high to low")

    expect(page).to have_current_path(/sort=price_desc/)
    expect(page).to have_css("h3", text: "Wash 11", match: :first)

    page.go_back
    expect(page).to have_no_current_path(/sort=/)
  end
end
