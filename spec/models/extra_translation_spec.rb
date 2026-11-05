# frozen_string_literal: true

require "rails_helper"

RSpec.describe ExtraTranslation, type: :model do
  let(:extra) { Extra.create!(price: 20) }
  let(:language) { Language.create!(code: "en", name: "English") }

  it "is valid with an extra, language, and name" do
    expect(ExtraTranslation.new(extra: extra, language: language, name: "Wax")).to be_valid
  end

  it "requires a name" do
    expect(ExtraTranslation.new(extra: extra, language: language)).not_to be_valid
  end

  it "requires a unique language per extra" do
    ExtraTranslation.create!(extra: extra, language: language, name: "Wax")
    duplicate = ExtraTranslation.new(extra: extra, language: language, name: "Wax (duplicate)")
    expect(duplicate).not_to be_valid
  end
end
