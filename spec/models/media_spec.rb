# frozen_string_literal: true

require "rails_helper"

RSpec.describe Media, type: :model do
  def build_media(attachable)
    Media.new(
      attachable: attachable,
      name: "hero",
      file_name: "hero.jpg",
      extension: "jpg",
      content_type: "image/jpeg",
      byte_size: 1234,
      url: "/uploads/hero.jpg"
    )
  end

  it "is valid with required attributes" do
    page = create_page(slug: "media-spec-page")
    expect(build_media(page)).to be_valid
  end

  it "requires byte_size to be greater than zero" do
    page = create_page(slug: "media-spec-byte-size")
    media = build_media(page)
    media.byte_size = 0
    expect(media).not_to be_valid
  end

  it "stores the short type code, not the full class name, in attachable_type" do
    page = create_page(slug: "media-spec-type-code")
    media = build_media(page)
    media.save!

    expect(media.attachable_type).to eq("page")
  end

  it "resolves attachable back to the owning record via the type map" do
    page = create_page(slug: "media-spec-resolve")
    media = build_media(page)
    media.save!

    expect(Media.find(media.id).attachable).to eq(page)
  end

  it "is destroyed when its attachable owner is destroyed" do
    page = create_page(slug: "media-spec-destroy")
    media = build_media(page)
    media.save!

    page.destroy

    expect(Media.exists?(media.id)).to be(false)
  end
end
