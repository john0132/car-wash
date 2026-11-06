# frozen_string_literal: true

require "rails_helper"

# axe-core checks of the key public pages against WCAG 2.1 A/AA, in both languages.
RSpec.describe "Website accessibility", type: :system do
  fixtures :users

  let!(:category) { create_service_category("Exterior") }
  let!(:service) { create_service("Full Wash", service_category: category, price: 400, sale_price: 350) }

  before do
    english
    native_arabic
    create_header_item(label: "FAQ", url: "/faqs")
    create_blog
  end

  def expect_accessible
    expect(page).to have_css("h1")
    expect(page).to be_axe_clean.according_to(:wcag2a, :wcag2aa, :wcag21a, :wcag21aa)
  end

  [ "", "/ar" ].each do |prefix|
    describe(prefix.empty? ? "in English" : "in Arabic") do
      {
        "the home page" => "/",
        "the services list" => "/services",
        "a service" => :service,
        "a category" => :category,
        "the FAQ" => "/faqs",
        "the blog" => "/blogs",
        "the contact page" => "/contact",
        "sign in" => "/sign_in",
        "sign up" => "/sign_up",
        "the not-found page" => "/nothing-here"
      }.each do |name, path|
        it "has no detectable accessibility problems on #{name}" do
          path = "/services/#{service.slug}" if path == :service
          path = "/categories/#{category.slug}" if path == :category
          visit(path == "/" ? (prefix.presence || "/") : "#{prefix}#{path}")

          expect_accessible
        end
      end
    end
  end

  it "has none in the signed-in account area" do
    sign_in users(:one)

    [ profile_path, profile_bookings_path, profile_addresses_path, profile_cars_path, checkout_path(service: service.slug) ].each do |path|
      visit path
      expect_accessible
    end
  end
end
