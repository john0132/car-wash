# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Website languages", type: :request do
  before { english }

  def arabic
    Language.find_or_create_by!(code: "ar") { |l| l.name = "العربية" }
  end

  it "serves English without a prefix, left to right" do
    get services_path

    expect(response).to have_http_status(:success)
    expect(response.body).to include('<html lang="en" dir="ltr">')
    expect(inertia.props[:locale]).to include(code: "en", dir: "ltr")
  end

  it "serves Arabic under /ar, right to left" do
    arabic

    get "/ar/services"

    expect(response).to have_http_status(:success)
    expect(response.body).to include('<html lang="ar" dir="rtl">')
    expect(inertia.props[:locale]).to include(code: "ar", dir: "rtl")
    expect_inertia.to render_component("website/services/index")
  end

  it "serves the Arabic home page at /ar" do
    get "/ar"

    expect(response).to have_http_status(:success)
    expect(inertia.props[:locale][:code]).to eq("ar")
  end

  it "links each language to the same page, keeping the query" do
    arabic

    get "/ar/blogs?page=2"

    hrefs = inertia.props[:locale][:available].to_h { |l| [ l[:code], l[:href] ] }
    expect(hrefs).to eq("en" => "/blogs?page=2", "ar" => "/ar/blogs?page=2")
  end

  it "keeps the visitor in their language across redirects" do
    get "/ar/profile"

    expect(response).to redirect_to("/ar/sign_in")
  end

  it "shows content in the visitor's language, falling back to English" do
    ar = arabic
    category = create_service_category("Exterior")
    category.service_category_translations.create!(language: ar, name: "الخارجي")
    create_service("Wash", service_category: category)

    get "/ar/services"
    expect(inertia.props[:categories].first[:name]).to eq("الخارجي")

    get "/services"
    expect(inertia.props[:categories].first[:name]).to eq("Exterior")
  end

  it "speaks the visitor's language in server messages" do
    post "/ar/sign_in", params: { email: "nobody@example.com", password: "wrong" }

    expect(response).to redirect_to("/ar/sign_in")
    expect(flash[:alert]).to eq("البريد الإلكتروني أو كلمة المرور غير صحيحة")

    post "/sign_in", params: { email: "nobody@example.com", password: "wrong" }
    expect(flash[:alert]).to eq("That email or password is incorrect")
  end
end
