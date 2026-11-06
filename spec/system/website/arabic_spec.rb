# frozen_string_literal: true

require "rails_helper"

RSpec.describe "The Arabic site", type: :system do
  fixtures :users

  before do
    english
    arabic
  end

  it "reads right to left, in Arabic, and switches back to the same English page" do
    visit "/ar/services"

    expect(page).to have_css("html[lang=ar][dir=rtl]")
    expect(page).to have_css("h1", text: "خدماتنا")
    expect(page).to have_title("خدماتنا — Auto Atelier")

    within("header") { click_on "English" }

    expect(page).to have_current_path("/services")
    expect(page).to have_css("html[lang=en][dir=ltr]")
    expect(page).to have_css("h1", text: "Our services")
  end

  it "keeps the language through links, sign-in and flash messages" do
    visit "/ar/sign_in"
    fill_in "البريد الإلكتروني", with: users(:one).email
    fill_in "كلمة المرور", with: "wrong password"
    click_on "تسجيل الدخول", match: :first

    expect(page).to have_current_path("/ar/sign_in")
    expect(page).to have_text("البريد الإلكتروني أو كلمة المرور غير صحيحة")

    fill_in "كلمة المرور", with: "Secret1*3*5*"
    click_on "تسجيل الدخول", match: :first

    expect(page).to have_current_path(%r{\A/ar/?\z})
    expect(page).to have_link("ملفي الشخصي")
  end

  it "shows prices and durations the Arabic way" do
    category = create_service_category("Exterior")
    create_service("Full Wash", service_category: category, price: 350, duration_minutes: 90)

    visit "/ar/services"

    expect(page).to have_text("ج.م.")
    expect(page).to have_text("1 س 30 د")
  end

  it "shows the branded not-found page in Arabic" do
    visit "/ar/services/nope"

    expect(page).to have_css("h1", text: "الصفحة غير موجودة")
    click_on "العودة إلى الصفحة الرئيسية"
    expect(page).to have_current_path(%r{\A/ar/?\z})
  end
end
