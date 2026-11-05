# frozen_string_literal: true

require "rails_helper"

RSpec.describe Page, type: :model do
  it "is valid with a slug" do
    expect(Page.new(slug: "about-us")).to be_valid
  end

  it "requires a slug" do
    expect(Page.new(slug: nil)).not_to be_valid
  end

  it "requires a unique slug" do
    Page.create!(slug: "about-us")
    expect(Page.new(slug: "about-us")).not_to be_valid
  end

  it "rejects slugs with invalid characters" do
    expect(Page.new(slug: "About Us!")).not_to be_valid
  end

  it "defaults is_active to true" do
    expect(Page.create!(slug: "about-us").is_active).to be(true)
  end
end
