# frozen_string_literal: true

require "rails_helper"

RSpec.describe PageTranslation, type: :model do
  let(:page) { create_page(slug: "about-us") }
  let(:language) { arabic }

  it "is valid with a page, language, name, and title" do
    expect(PageTranslation.new(page: page, language: language, name: "Name", title: "Title")).to be_valid
  end

  it "requires a name" do
    expect(PageTranslation.new(page: page, language: language, title: "Title")).not_to be_valid
  end

  it "requires a title" do
    expect(PageTranslation.new(page: page, language: language, name: "Name")).not_to be_valid
  end

  it "requires a unique language per page" do
    PageTranslation.create!(page: page, language: language, name: "Name", title: "Title")
    duplicate = PageTranslation.new(page: page, language: language, name: "Other", title: "Other")
    expect(duplicate).not_to be_valid
  end
end
