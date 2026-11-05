# frozen_string_literal: true

require "rails_helper"

RSpec.describe Blog, type: :model do
  it "is valid with a slug and a default-language name" do
    blog = Blog.new(slug: "grand-opening")
    blog.blog_translations.build(language: english, name: "Opening", title: "We're open")
    expect(blog).to be_valid
  end

  it "requires a name in the default language" do
    english
    expect(Blog.new(slug: "grand-opening").tap(&:valid?).errors[:translations]).to be_present
  end

  it "requires a slug" do
    expect(Blog.new(slug: nil).tap(&:valid?).errors[:slug]).to be_present
  end

  it "requires a unique slug" do
    create_blog(slug: "grand-opening")
    expect(Blog.new(slug: "grand-opening").tap(&:valid?).errors[:slug]).to include("has already been taken")
  end

  it "rejects slugs with invalid characters" do
    expect(Blog.new(slug: "Grand Opening!").tap(&:valid?).errors[:slug]).to be_present
  end

  it "defaults is_active to true" do
    expect(create_blog.is_active).to be(true)
  end

  describe ".search" do
    it "matches a name in any language or the slug" do
      tips = create_blog(slug: "winter-tips", name: "Winter tips")
      tips.blog_translations.create!(language: arabic, name: "نصائح الشتاء", title: "نصائح")
      other = create_blog(slug: "summer", name: "Summer")

      expect(Blog.search("نصائح")).to contain_exactly(tips)
      expect(Blog.search("winter-t")).to contain_exactly(tips)
      expect(Blog.search(nil)).to contain_exactly(tips, other)
    end
  end
end
