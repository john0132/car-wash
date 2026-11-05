# frozen_string_literal: true

require "rails_helper"

RSpec.describe MembershipTranslation, type: :model do
  let(:membership) { Membership.create!(egp_to_points: 1, points_to_egp: 1, background_color: "#FFFFFF", text_color: "#000000") }
  let(:language) { Language.create!(code: "en", name: "English") }

  it "is valid with a membership, language, and name" do
    expect(MembershipTranslation.new(membership: membership, language: language, name: "Gold")).to be_valid
  end

  it "requires a name" do
    expect(MembershipTranslation.new(membership: membership, language: language)).not_to be_valid
  end

  it "requires a unique language per membership" do
    MembershipTranslation.create!(membership: membership, language: language, name: "Gold")
    duplicate = MembershipTranslation.new(membership: membership, language: language, name: "Gold (duplicate)")
    expect(duplicate).not_to be_valid
  end
end
