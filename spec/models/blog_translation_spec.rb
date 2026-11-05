# frozen_string_literal: true

require "rails_helper"

RSpec.describe BlogTranslation, type: :model do
  let(:blog) { Blog.create!(slug: "grand-opening") }
  let(:language) { Language.create!(code: "en", name: "English") }

  it "is valid with a blog, language, name, and title" do
    expect(BlogTranslation.new(blog: blog, language: language, name: "Grand Opening", title: "We're Open!")).to be_valid
  end

  it "requires a name" do
    expect(BlogTranslation.new(blog: blog, language: language, title: "We're Open!")).not_to be_valid
  end

  it "requires a title" do
    expect(BlogTranslation.new(blog: blog, language: language, name: "Grand Opening")).not_to be_valid
  end

  it "requires a unique language per blog" do
    BlogTranslation.create!(blog: blog, language: language, name: "Grand Opening", title: "We're Open!")
    duplicate = BlogTranslation.new(blog: blog, language: language, name: "Grand Opening (duplicate)", title: "We're Open! (duplicate)")
    expect(duplicate).not_to be_valid
  end
end
