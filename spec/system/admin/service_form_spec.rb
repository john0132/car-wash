# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin service form", type: :system do
  fixtures :users

  let(:admin) { users(:admin) }
  let!(:category) { create_service_category("Exterior") }

  before do
    arabic
    grant(admin, "services.read", "services.create", "services.update")
    sign_in admin
  end

  it "edits name, content and SEO of one language in a single panel and saves all languages" do
    visit new_admin_service_path(service_category_id: category.id)

    fill_in "name_en", with: "Full Wash"
    fill_in "seo_title_en", with: "Full car wash"
    fill_in "price", with: "150"

    click_on "Arabic"
    fill_in "name_ar", with: "غسيل كامل"
    fill_in "seo_title_ar", with: "غسيل السيارات"

    click_on "English"
    expect(page).to have_field("seo_title_en", with: "Full car wash")

    click_on "Create service"

    expect(page).to have_text("Full Wash")
    service = Service.last
    expect(service.service_translations.map(&:name)).to contain_exactly("Full Wash", "غسيل كامل")
    expect(service.service_translations.map(&:seo_title)).to contain_exactly("Full car wash", "غسيل السيارات")
  end
end
