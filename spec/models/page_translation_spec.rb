# frozen_string_literal: true

require "rails_helper"

RSpec.describe PageTranslation, type: :model do
  let(:page) { Page.create!(slug: "about-us") }
  let(:language) { Language.create!(code: "en", name: "English") }

  it "is valid with a page, language, name, and title" do
    expect(PageTranslation.new(page: page, language: language, name: "About", title: "About Us")).to be_valid
  end

  it "requires a name" do
    expect(PageTranslation.new(page: page, language: language, title: "About Us")).not_to be_valid
  end

  it "requires a title" do
    expect(PageTranslation.new(page: page, language: language, name: "About")).not_to be_valid
  end

  it "requires a unique language per page" do
    PageTranslation.create!(page: page, language: language, name: "About", title: "About Us")
    duplicate = PageTranslation.new(page: page, language: language, name: "About (duplicate)", title: "About Us (duplicate)")
    expect(duplicate).not_to be_valid
  end
end
