# frozen_string_literal: true

require "rails_helper"

RSpec.describe Language, type: :model do
  it "is valid with a code and name" do
    expect(Language.new(code: "en", name: "English")).to be_valid
  end

  it "requires a code" do
    expect(Language.new(name: "English")).not_to be_valid
  end

  it "requires a unique code" do
    Language.create!(code: "en", name: "English")
    expect(Language.new(code: "en", name: "English (US)")).not_to be_valid
  end

  it "requires a name" do
    expect(Language.new(code: "en")).not_to be_valid
  end
end
