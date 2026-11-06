# frozen_string_literal: true

require "rails_helper"

RSpec.describe MembershipTranslation, type: :model do
  # Has its English name already, so these build the Arabic one.
  let(:membership) { create_membership }
  let(:language) { arabic }

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
