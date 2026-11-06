# frozen_string_literal: true

require "rails_helper"

RSpec.describe "The website on a phone", type: :system do
  fixtures :users

  let!(:category) { create_service_category("Exterior") }
  let!(:service) { create_service("Full Wash", service_category: category, price: 400, sale_price: 350) }

  before do
    create_header_item(label: "FAQ", url: "/faqs")
    create_page(slug: "about-us")
  end

  def public_paths(prefix = "")
    [ "/", "/services", "/services/#{service.slug}", "/categories/#{category.slug}", "/blogs", "/faqs", "/contact",
      "/sign_in", "/sign_up", "/about-us", "/missing" ].map { |path| path == "/" ? prefix.presence || "/" : "#{prefix}#{path}" }
  end

  it "does not scroll sideways on any public page, in either language" do
    arabic
    on_a_phone do
      (public_paths + public_paths("/ar")).each do |path|
        visit path
        expect(page).to have_css("h1", wait: 5)
        expect(horizontal_overflow?).to be(false), "#{path} scrolls sideways at #{WebsiteSystemHelpers::PHONE_SIZE.first}px"
      end
    end
  end

  it "reaches every page from the menu button and closes the menu after navigating" do
    on_a_phone do
      visit root_path
      expect(page).to have_no_css("header nav a", text: "FAQ", visible: :visible)

      find("button[aria-label='Open menu']").click
      within("[role=dialog]") do
        expect(page).to have_link("FAQ")
        click_on "FAQ"
      end

      expect(page).to have_current_path(faqs_path)
      expect(page).to have_no_css("[role=dialog]")
    end
  end

  it "shows the booking button, account link and language switch in the menu" do
    english
    native_arabic
    on_a_phone do
      visit root_path
      find("button[aria-label='Open menu']").click

      within("[role=dialog]") do
        expect(page).to have_link("Book your visit")
        expect(page).to have_link("Log in or register")
        expect(page).to have_link("العربية")
      end
    end
  end
end
