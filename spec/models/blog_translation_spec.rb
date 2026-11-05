# frozen_string_literal: true

require "rails_helper"

RSpec.describe BlogTranslation, type: :model do
  let(:blog) { create_blog(slug: "grand-opening") }
  let(:language) { arabic }

  it "is valid with a blog, language, name, and title" do
    expect(BlogTranslation.new(blog: blog, language: language, name: "Name", title: "Title")).to be_valid
  end

  it "requires a name" do
    expect(BlogTranslation.new(blog: blog, language: language, title: "Title")).not_to be_valid
  end

  it "requires a title" do
    expect(BlogTranslation.new(blog: blog, language: language, name: "Name")).not_to be_valid
  end

  it "requires a unique language per blog" do
    BlogTranslation.create!(blog: blog, language: language, name: "Name", title: "Title")
    duplicate = BlogTranslation.new(blog: blog, language: language, name: "Other", title: "Other")
    expect(duplicate).not_to be_valid
  end

  it "sanitizes the body" do
    translation = BlogTranslation.create!(blog: blog, language: language, name: "N", title: "T",
      body: %(<p onclick="x()">Hi<script>alert(1)</script></p>))
    expect(translation.body).to eq("<p>Hialert(1)</p>")
  end

  it "stores an empty editor body as nil" do
    translation = BlogTranslation.create!(blog: blog, language: language, name: "N", title: "T", body: "<p></p>")
    expect(translation.body).to be_nil
  end
end
