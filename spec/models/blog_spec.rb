# frozen_string_literal: true

require "rails_helper"

RSpec.describe Blog, type: :model do
  it "is valid with a slug" do
    expect(Blog.new(slug: "grand-opening")).to be_valid
  end

  it "requires a slug" do
    expect(Blog.new(slug: nil)).not_to be_valid
  end

  it "requires a unique slug" do
    Blog.create!(slug: "grand-opening")
    expect(Blog.new(slug: "grand-opening")).not_to be_valid
  end

  it "rejects slugs with invalid characters" do
    expect(Blog.new(slug: "Grand Opening!")).not_to be_valid
  end

  it "defaults is_active to true" do
    expect(Blog.create!(slug: "grand-opening").is_active).to be(true)
  end
end
